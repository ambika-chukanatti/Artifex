import { SignedIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import Checkout from "@/components/shared/Checkout";
import { plans } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";

const Credits = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  return (
    <div className="credits-page">
      <div className="grid-overlay" />
      <Header />

      <div className="credits-content">
        {/* Hero */}
        <div className="credits-hero">
          <span className="credits-badge">Pricing</span>
          <h1 className="credits-hero-title">
            Buy <span>Credits</span>
          </h1>
          <p className="credits-hero-subtitle">
            Select a plan and start generating art instantly.
          </p>
        </div>

        {/* Section header */}
        <section className="plans-section">
          <div className="plans-section-header">
            <span className="section-line" />
            <span className="section-label">Available Plans</span>
            <span className="section-line-reverse" />
          </div>

          {/* Plans grid */}
          <ul className="plans-grid">
            {plans.map((plan, index) => (
              <li
                key={plan.name}
                className={`plan-card${index === 1 ? " plan-card--featured" : ""}`}
              >
                {/* Card header */}
                <div className="plan-card-header">
                  <div className="plan-card-icon">
                    <Image src={plan.icon} alt={plan.name} width={26} height={26} />
                  </div>
                  <div className="plan-card-title-group">
                    <p className="plan-card-name">{plan.name}</p>
                    <p className="plan-card-credits">{plan.credits} Credits</p>
                  </div>
                </div>

                {/* Price */}
                <div className="plan-card-price">
                  <span className="plan-card-price-currency">$</span>
                  <span className="plan-card-price-amount">{plan.price}</span>
                  <span className="plan-card-price-period">/ one-time</span>
                </div>

                <div className="plan-card-divider" />

                {/* Inclusions */}
                <ul className="plan-card-inclusions">
                  {plan.inclusions.map((inclusion) => (
                    <li
                      key={plan.name + inclusion.label}
                      className={`plan-inclusion-item${inclusion.isIncluded ? " plan-inclusion-item--included" : ""}`}
                    >
                      <span
                        className={`plan-inclusion-icon ${
                          inclusion.isIncluded
                            ? "plan-inclusion-icon--check"
                            : "plan-inclusion-icon--cross"
                        }`}
                      >
                        {inclusion.isIncluded ? (
                          /* Check icon */
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                              d="M2 5l2.5 2.5L8 2.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          /* Cross icon */
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                              d="M3 3l4 4M7 3L3 7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </span>
                      {inclusion.label}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.name === "Free" ? (
                  <button className="plan-card-cta plan-card-cta--free" disabled>
                    Free Consumable
                  </button>
                ) : (
                  <SignedIn>
                    <div className="plan-card-cta plan-card-cta--paid">
                      <Checkout
                        plan={plan.name}
                        amount={plan.price}
                        credits={plan.credits}
                        buyerId={user._id}
                      />
                    </div>
                  </SignedIn>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Credits;