"use client"

import { loadStripe } from "@stripe/stripe-js"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { checkoutCredits } from "@/lib/actions/transaction.actions"

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string
  amount: number
  credits: number
  buyerId: string
}) => {
  const { toast } = useToast()

  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }, [])

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    if (query.get("success")) {
      toast({ title: "Order placed! You will receive an email confirmation." })
    }
    if (query.get("canceled")) {
      toast({ title: "Order canceled! Continue to shop around and checkout when you're ready." })
    }
  }, [])

  const onCheckout = async () => {
    await checkoutCredits({ plan, amount, credits, buyerId })
  }

  return (
    <button
      type="button"
      onClick={onCheckout}
      className="plan-card-cta plan-card-cta--paid"
    >
      {/* Card icon */}
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <rect x="1" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1 6h11" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
      Buy Credits
    </button>
  )
}

export default Checkout