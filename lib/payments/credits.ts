import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";
import User from "../database/models/user.model";

type PaymentParams = {
  stripeId: string;
  amount: number;
  plan: string;
  credits: number;
  buyerId: string;
};

export async function addCreditsForPayment(p: PaymentParams) {
  await connectToDatabase();

  let transaction;
  try {
    transaction = await Transaction.create({
      stripeId: p.stripeId,
      amount: p.amount,
      plan: p.plan,
      credits: p.credits,
      buyer: p.buyerId,
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      return { status: "duplicate" as const };
    }
    throw err;
  }

  try {
    const user = await User.findByIdAndUpdate(
      p.buyerId,
      { $inc: { creditBalance: p.credits } },
      { new: true }
    );
    if (!user) throw new Error("Buyer not found");
  } catch (err) {
    await Transaction.deleteOne({ _id: transaction._id });
    throw err;
  }

  revalidatePath("/profile");
  return { status: "credited" as const };
}