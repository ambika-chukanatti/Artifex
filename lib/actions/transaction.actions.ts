"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { plans } from "@/constants";
import { connectToDatabase } from "../database/mongoose";
import User from "../database/models/user.model";

export async function checkoutCredits({ plan }: { plan: string }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const selectedPlan = plans.find((p) => p.name === plan && p.price > 0);
  if (!selectedPlan) throw new Error("Invalid plan");

  await connectToDatabase();
  const buyer = await User.findOne({ clerkId });
  if (!buyer) throw new Error("User not found");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: selectedPlan.price * 100,
          product_data: {
            name: selectedPlan.name,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      plan: selectedPlan.name,
      credits: String(selectedPlan.credits),
      buyerId: buyer._id.toString(),
    },
    mode: "payment",
    success_url: `https://artifex-gamma.vercel.app/profile`,
    cancel_url: `https://artifex-gamma.vercel.app/credits`,
  });

  redirect(session.url!);
}