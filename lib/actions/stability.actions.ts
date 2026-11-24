"use server";

import { auth } from "@clerk/nextjs/server";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { calculateIncrements } from "../utils";
import { getCreditFee, urlPath } from "@/constants";

const STABILITY_API_KEY = "sk-ubDlsrKhcm2R6AoDW2iQFihdxk53N9kuqbyhMVaqyhLfmeYc";

type GenerateParams = {
  type: string;
  prompt: string;
  selectPrompt: string;
  originalImage: { imageUrl: string; width: number; height: number };
  aspectRatio: string;
};

type GenerateResult =
  | { ok: true; imageUrl: string; creditBalance: number }
  | {
      ok: false;
      error: string;
      code: "UNAUTHORIZED" | "INSUFFICIENT_CREDITS" | "FAILED";
      creditBalance?: number;
    };

// Cloudinary converts on the fly when "f_png" is added to the URL.
async function fetchAsPng(imageUrl: string) {
  const pngUrl = imageUrl.includes("/upload/")
    ? imageUrl.replace("/upload/", "/upload/f_png/")
    : imageUrl;

  const res = await fetch(pngUrl);
  if (!res.ok) throw new Error(`Could not load original image (${res.status})`);

  const buffer = await res.arrayBuffer();
  return new Blob([buffer], { type: "image/png" });
}

async function buildEditForm(type: string, p: GenerateParams) {
  const png = await fetchAsPng(p.originalImage.imageUrl);
  const formData = new FormData();
  formData.append("image", png, "image.png");

  if (type === "recolor") {
    formData.append("prompt", p.prompt);
    formData.append("select_prompt", p.selectPrompt);
  } else if (type === "replace") {
    formData.append("prompt", p.prompt);
    formData.append("search_prompt", p.selectPrompt);
  } else if (type === "inpaint") {
    formData.append("prompt", p.prompt);
  } else if (type === "outpaint") {
    const d = calculateIncrements({
      currentWidth: p.originalImage.width,
      currentHeight: p.originalImage.width, 
      targetAspectRatio: p.aspectRatio,
    });
    formData.append("left", d.left.toString());
    formData.append("right", d.right.toString());
    formData.append("up", d.up.toString());
    formData.append("down", d.down.toString());
    formData.append("output_format", "png");
  } else if (type === "remove") {
    formData.append("search_prompt", p.selectPrompt);
  } else if (type === "backgroundRemove") {
    formData.append("output_format", "png");
  } else if (type === "backgroundReplace") {
    formData.append("prompt", p.prompt);
    formData.append("output_format", "png");
  }

  return formData;
}

export async function generateImage(params: GenerateParams): Promise<GenerateResult> {
  // 1. Identify the user from the Clerk session, never from the browser
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { ok: false, code: "UNAUTHORIZED", error: "Please sign in again." };
  }

  const { type } = params;
  if (!(type in urlPath)) {
    return { ok: false, code: "FAILED", error: "Unknown action type." };
  }

  // The fee is decided on the server, so the browser can't change it
  const fee = getCreditFee(type);

  await connectToDatabase();

  // 2. Deduct first. The condition makes it atomic: it only succeeds
  const charged = await User.findOneAndUpdate(
    { clerkId, creditBalance: { $gte: fee } },
    { $inc: { creditBalance: -fee } },
    { new: true }
  );

  if (!charged) {
    const current = await User.findOne({ clerkId }).select("creditBalance");
    return {
      ok: false,
      code: "INSUFFICIENT_CREDITS",
      error: `This action costs ${fee} credits.`,
      creditBalance: current?.creditBalance,
    };
  }

  // 3. Call Stability AI
  let imageUrl: string | null = null;
  let errorMessage = "Generation failed. Please try again.";

  try {
    if (type === "create") {
      const res = await fetch(
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${STABILITY_API_KEY}`,
          },
          body: JSON.stringify({
            text_prompts: [{ text: params.prompt }],
            width: 1024,
            height: 1024,
            style_preset: params.selectPrompt,
          }),
        }
      );

      if (res.status === 200) {
        const data = await res.json();
        imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`;
      } else {
        errorMessage = `Stability error ${res.status}`;
        console.error("Stability create failed:", res.status, await res.text());
      }
    } else {
      const body = await buildEditForm(type, params);
      const res = await fetch(
        `https://api.stability.ai/v2beta/stable-image/edit/${urlPath[type as keyof typeof urlPath]}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${STABILITY_API_KEY}`,
          },
          body,
        }
      );

      if (res.status === 200) {
        const data = await res.json();
        imageUrl = `data:image/png;base64,${data.image}`;
      } else {
        errorMessage = `Stability error ${res.status}`;
        console.error("Stability edit failed:", res.status, await res.text());
      }
    }
  } catch (err) {
    console.error("Stability request threw:", err);
  }

  // 4. Success: return the image and the new balance
  if (imageUrl) {
    return { ok: true, imageUrl, creditBalance: charged.creditBalance };
  }

  // 5. Failure: refund the credits we took
  const refunded = await User.findOneAndUpdate(
    { clerkId },
    { $inc: { creditBalance: fee } },
    { new: true }
  );

  return {
    ok: false,
    code: "FAILED",
    error: `${errorMessage} Your credits were refunded.`,
    creditBalance: refunded?.creditBalance,
  };
}