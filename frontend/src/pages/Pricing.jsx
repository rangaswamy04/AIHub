import { useState } from "react";

import { upgradeSubscription } from "../services/api";

import { useAuth } from "../context/AuthContext";


function Pricing() {

  const {
    user,
    setUser,
  } = useAuth();


  const [loading, setLoading] =
    useState(false);


  const plan =
    user.plan || "free";


  /* ================================
     UPGRADE TO PRO
  ================================= */

  async function handleUpgrade() {

    setLoading(true);


    const response =
      await upgradeSubscription();


    if (response.ok) {

      const newPlan =
        response.data.plan;


      setUser((previous) => ({

        ...previous,

        plan: newPlan,

      }));


      localStorage.setItem(
        "plan",
        newPlan
      );

    }


    setLoading(false);
  }


  return (

    <div className="simple-pricing-page">


      {/* HEADER */}

      <div className="simple-pricing-header">

        <h1>
          Choose your plan
        </h1>

        <p>
          Get more from AIHub with a plan
          that fits your needs.
        </p>

      </div>


      {/* PRICING GRID */}

      <div className="simple-pricing-grid">


        {/* ================================
            FREE PLAN
        ================================= */}

        <div
          className={`simple-pricing-card ${
            plan === "free"
              ? "current"
              : ""
          }`}
        >

          <div className="simple-pricing-card-header">

            <span className="simple-pricing-label">
              FREE
            </span>

            <h2>
              Free
            </h2>

            <p>
              Get started with the essential
              AI tools.
            </p>

          </div>


          <div className="simple-pricing-price">

            <strong>
              ₹0
            </strong>

            <span>
              / month
            </span>

          </div>


          <div className="simple-pricing-features">

            <div>
              ✓ 10 AI requests
            </div>

            <div>
              ✓ AI Chat
            </div>

            <div>
              ✓ Text Generator
            </div>

            <div>
              ✓ Summarizer
            </div>

            <div>
              ✓ Code Assistant
            </div>

            <div>
              ✓ Resume Analyzer
            </div>

          </div>


          <button
            className="simple-pricing-button secondary"
            disabled
          >

            {plan === "free"
              ? "Current Plan"
              : "Free Plan"}

          </button>

        </div>


        {/* ================================
            PRO PLAN
        ================================= */}

        <div
          className={`simple-pricing-card featured ${
            plan === "pro"
              ? "current"
              : ""
          }`}
        >


          <div className="simple-pricing-badge">
            RECOMMENDED
          </div>


          <div className="simple-pricing-card-header">

            <span className="simple-pricing-label">
              PRO
            </span>

            <h2>
              Pro
            </h2>

            <p>
              More AI usage for serious
              productivity.
            </p>

          </div>


          <div className="simple-pricing-price">

            <strong>
              ₹499
            </strong>

            <span>
              / month
            </span>

          </div>


          <div className="simple-pricing-features">

            <div>
              ✓ 100 AI requests
            </div>

            <div>
              ✓ AI Chat
            </div>

            <div>
              ✓ Text Generator
            </div>

            <div>
              ✓ Summarizer
            </div>

            <div>
              ✓ Code Assistant
            </div>

            <div>
              ✓ Resume Analyzer
            </div>

          </div>


          <button
            className="simple-pricing-button primary"
            onClick={handleUpgrade}
            disabled={
              loading ||
              plan === "pro"
            }
          >

            {plan === "pro"

              ? "Current Plan"

              : loading

                ? "Upgrading..."

                : "Upgrade to Pro"}

          </button>


        </div>


      </div>


    </div>

  );
}


export default Pricing;