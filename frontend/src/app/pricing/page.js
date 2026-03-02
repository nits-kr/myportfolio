"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { FiCheck, FiX, FiZap, FiTrendingUp, FiAward } from "react-icons/fi";

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    icon: <FiZap size={32} />,
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    features: [
      { name: "1 Portfolio Site", included: true },
      { name: "Basic Templates", included: true },
      { name: "5 Projects Showcase", included: true },
      { name: "Basic Analytics", included: true },
      { name: "Community Support", included: true },
      { name: "Custom Domain", included: false },
      { name: "Advanced Analytics", included: false },
      { name: "Priority Support", included: false },
      { name: "White Label", included: false },
    ],
    cta: "Get Started Free",
    ctaLink: "/register?plan=free",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    icon: <FiTrendingUp size={32} />,
    price: 199,
    period: "month",
    description: "For serious professionals",
    features: [
      { name: "Unlimited Portfolio Sites", included: true },
      { name: "Premium Templates", included: true },
      { name: "Unlimited Projects", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "Custom Domain", included: true },
      { name: "SEO Optimization", included: true },
      { name: "Email Support", included: true },
      { name: "Remove Branding", included: true },
      { name: "API Access", included: false },
    ],
    cta: "Start Pro Trial",
    ctaLink: "/register?plan=pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: <FiAward size={32} />,
    price: 999,
    period: "month",
    description: "For teams and agencies",
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Team Collaboration (10 users)", included: true },
      { name: "White Label Solution", included: true },
      { name: "API Access", included: true },
      { name: "Custom Integrations", included: true },
      { name: "Priority Support", included: true },
      { name: "Dedicated Account Manager", included: true },
      { name: "Custom Development", included: true },
      { name: "SLA Guarantee", included: true },
    ],
    cta: "Contact Sales",
    ctaLink:
      "/contact?service=custom&message=I'm interested in Enterprise plan",
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [processingPlan, setProcessingPlan] = useState(null);
  const currencySymbol = "₹";

  const loadRazorpaySdk = () =>
    new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const getPlanId = (plan, cycle) => `${plan.id}_${cycle === "yearly" ? "yearly" : "monthly"}`;

  const handleCheckout = async (plan) => {
    if (!user) {
      router.push(`/login?redirect=/pricing`);
      return;
    }

    const selectedPlanId = getPlanId(plan, billingCycle);
    setProcessingPlan(selectedPlanId);

    try {
      const sdkLoaded = await loadRazorpaySdk();
      if (!sdkLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      const authToken = token || localStorage.getItem("token");
      const createOrderRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ planId: selectedPlanId }),
        },
      );

      const orderData = await createOrderRes.json();
      if (!createOrderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize payment");
      }

      const { orderId, amount, currency, keyId, planId } = orderData.data;

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "Nitish Portfolio",
        description: `${plan.name} Plan (${billingCycle})`,
        order_id: orderId,
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        notes: {
          planId,
          billingCycle,
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                  planId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            alert("Payment successful. Your subscription is now active.");
            router.refresh();
          } catch (error) {
            alert(error.message || "Payment verification failed");
          }
        },
        theme: {
          color: "#2563eb",
        },
      });

      razorpay.on("payment.failed", () => {
        alert("Payment failed. Please try again.");
      });

      razorpay.open();
    } catch (error) {
      alert(error.message || "Unable to process payment");
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="container py-5 mt-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-5 py-5"
      >
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-4 py-2 rounded-pill mb-3">
          Pricing Plans
        </span>
        <h1 className="display-3 fw-bold mb-4">
          Choose Your <span className="text-primary">Perfect Plan</span>
        </h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
          Build your professional portfolio with our powerful platform. Start
          free, upgrade anytime.
        </p>

        {/* Billing Toggle */}
        <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
          <span
            className={billingCycle === "monthly" ? "fw-bold" : "text-muted"}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
            }
            className="btn btn-outline-primary rounded-pill px-4"
          >
            {billingCycle === "monthly"
              ? "Switch to Yearly"
              : "Switch to Monthly"}
          </button>
          <span
            className={billingCycle === "yearly" ? "fw-bold" : "text-muted"}
          >
            Yearly
            <span className="badge bg-success ms-2">Save 20%</span>
          </span>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="row g-4 mb-5">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            className="col-lg-4 col-md-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={`glass-card h-100 p-4 position-relative ${plan.popular ? "border-primary border-2" : ""}`}
              style={{
                background: plan.popular
                  ? "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)"
                  : "rgba(255, 255, 255, 0.02)",
              }}
            >
              {plan.popular && (
                <div className="position-absolute top-0 end-0 m-3">
                  <span className="badge bg-primary px-3 py-2">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-4"
                style={{ background: "rgba(124, 58, 237, 0.1)" }}
              >
                <div className="text-primary">{plan.icon}</div>
              </div>

              {/* Plan Name */}
              <h3 className="h4 fw-bold mb-2">{plan.name}</h3>
              <p className="text-muted small mb-4">{plan.description}</p>

              {/* Price */}
              <div className="mb-4">
                <div className="d-flex align-items-baseline gap-2">
                  <span className="display-4 fw-bold">
                    {currencySymbol}
                    {billingCycle === "yearly" && plan.price > 0
                      ? Math.round(plan.price * 0.8)
                      : plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted">
                      /{billingCycle === "yearly" ? "month" : plan.period}
                    </span>
                  )}
                </div>
                {billingCycle === "yearly" && plan.price > 0 && (
                  <p className="small text-muted mt-2">
                    Billed {currencySymbol}
                    {Math.round(plan.price * 0.8 * 12)} annually
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="border-top border-white border-opacity-10 pt-4 mb-4">
                <ul className="list-unstyled">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="d-flex align-items-start gap-2 mb-3"
                    >
                      {feature.included ? (
                        <FiCheck
                          className="text-success mt-1 flex-shrink-0"
                          size={18}
                        />
                      ) : (
                        <FiX
                          className="text-muted mt-1 flex-shrink-0"
                          size={18}
                        />
                      )}
                      <span className={feature.included ? "" : "text-muted"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              {plan.price === 0 || plan.id === "enterprise" ? (
                <Link
                  href={plan.ctaLink}
                  className={`btn ${plan.popular ? "btn-primary" : "btn-outline-light"} w-100`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCheckout(plan)}
                  className={`btn ${plan.popular ? "btn-primary" : "btn-outline-light"} w-100`}
                  disabled={processingPlan === getPlanId(plan, billingCycle)}
                >
                  {processingPlan === getPlanId(plan, billingCycle)
                    ? "Processing..."
                    : `Pay with Razorpay (${billingCycle})`}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-5 pt-5"
      >
        <h2 className="h3 fw-bold text-center mb-5">
          Frequently Asked Questions
        </h2>
        <div className="row g-4">
          {[
            {
              q: "Can I switch plans anytime?",
              a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
            },
            {
              q: "Is there a free trial?",
              a: "The Free plan is available forever. Pro plan includes a 14-day free trial with no credit card required.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Absolutely. Cancel anytime with no questions asked. Your data remains accessible for 30 days after cancellation.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="col-md-6">
              <div className="glass-card p-4">
                <h4 className="h6 fw-bold mb-2">{faq.q}</h4>
                <p className="text-muted small mb-0">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Enterprise CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-5 text-center mt-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
        }}
      >
        <h2 className="h3 fw-bold mb-3">Need a Custom Solution?</h2>
        <p
          className="text-muted mb-4"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          For large teams, agencies, or custom requirements, we offer tailored
          solutions with dedicated support and custom features.
        </p>
        <Link
          href="/contact"
          className="btn btn-primary btn-lg px-5 rounded-pill"
        >
          Talk to Sales
        </Link>
      </motion.div>
    </div>
  );
}
