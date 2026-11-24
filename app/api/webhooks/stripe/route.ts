import { NextResponse } from "next/server";
import stripe from "stripe";
import { plans } from "@/constants";
import { addCreditsForPayment } from "@/lib/payments/credits";

export async function POST(request: Request) {
  const body = await request.text();

  const sig = request.headers.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!sig) {
    return NextResponse.json({ message: "Missing signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Stripe signature check failed:", err);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ message: "Not paid, ignored" }, { status: 200 });
    }

    const metadata = session.metadata ?? {};

    const plan = plans.find((p) => p.name === metadata.plan && p.price > 0);
    if (!plan || !metadata.buyerId) {
      console.error("Webhook: unknown plan or missing buyer", session.id);
      return NextResponse.json({ message: "Invalid metadata" }, { status: 200 });
    }

    try {
      const result = await addCreditsForPayment({
        stripeId: session.id,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        plan: plan.name,
        credits: plan.credits,
        buyerId: metadata.buyerId,
      });

      return NextResponse.json({ message: "OK", status: result.status });
    } catch (err) {
      console.error("Webhook: crediting failed", session.id, err);
      return NextResponse.json({ message: "Processing failed" }, { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}