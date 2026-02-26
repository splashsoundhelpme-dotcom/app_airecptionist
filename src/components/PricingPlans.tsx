"use client";

import { useState } from "react";
import { 
  SUBSCRIPTION_PLANS, 
  createTrialSubscription, 
  createMonthlySubscription, 
  createAnnualSubscription,
  saveConfig,
  getConfig 
} from "@/lib/store";
import type { SubscriptionStatus, SubscriptionPlan } from "@/lib/types";

interface PricingPlansProps {
  onPlanSelected?: (plan: SubscriptionPlan) => void;
}

export default function PricingPlans({ onPlanSelected }: PricingPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSelectPlan = async (planKey: string) => {
    setLoading(true);
    setSelectedPlan(planKey as SubscriptionPlan);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let subscription: SubscriptionStatus;
    switch (planKey) {
      case "monthly":
        subscription = createMonthlySubscription();
        break;
      case "annual":
        subscription = createAnnualSubscription();
        break;
      default:
        subscription = createTrialSubscription();
    }
    
    // Save subscription to config
    const config = getConfig();
    config.subscription = subscription;
    saveConfig(config);
    
    setLoading(false);
    
    if (onPlanSelected) {
      onPlanSelected(planKey as SubscriptionPlan);
    }
  };
  
  const plans = [
    {
      key: "trial",
      ...SUBSCRIPTION_PLANS.trial,
      popular: false,
      cta: "Inizia Gratis",
      ctaClass: "btn-secondary",
    },
    {
      key: "monthly",
      ...SUBSCRIPTION_PLANS.monthly,
      popular: true,
      cta: "Attiva Mensile",
      ctaClass: "btn-primary",
    },
    {
      key: "annual",
      ...SUBSCRIPTION_PLANS.annual,
      popular: false,
      cta: "Attiva Annuale",
      ctaClass: "btn-primary",
    },
  ];
  
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "var(--bg)",
      padding: "40px 24px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 12px 32px rgba(37,99,235,0.35)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>
            Scegli il tuo piano
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
            Inizia gratis con 3 giorni di prova. Poi scegli il piano che fa per te.
          </p>
        </div>
        
        {/* Plans Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
          marginBottom: 48,
        }}>
          {plans.map((plan) => (
            <div
              key={plan.key}
              className="card"
              style={{
                padding: 32,
                position: "relative",
                border: plan.popular ? "2px solid var(--primary)" : "1px solid var(--border)",
                transform: plan.popular ? "scale(1.02)" : "none",
                boxShadow: plan.popular ? "0 16px 48px rgba(37,99,235,0.2)" : "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "white",
                    padding: "6px 16px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    boxShadow: "0 4px 12px rgba(245,158,11,0.4)",
                  }}
                >
                  🎯 Più Popolare
                </div>
              )}
              
              {/* Plan Name */}
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                {plan.name}
              </h3>
              
              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text)" }}>
                  €{plan.price.toFixed(2)}
                </span>
                {plan.price > 0 && (
                  <span style={{ color: "var(--text-muted)", fontSize: 14, marginLeft: 8 }}>
                    / {plan.interval}
                  </span>
                )}
              </div>
              
              {/* Fake Discount Badge */}
              {plan.originalPrice && (
                <div style={{ marginBottom: 20 }}>
                  <span
                    style={{
                      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ⚡ Risparmia €{plan.savings} ({Math.round((1 - plan.price / plan.originalPrice) * 100)}%)
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12, marginLeft: 8, textDecoration: "line-through" }}>
                    €{plan.originalPrice.toFixed(2)}
                  </span>
                </div>
              )}
              
              {/* Features */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: idx < plan.features.length - 1 ? "1px solid var(--border)" : "none",
                      color: "var(--text)",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "#22c55e", fontSize: 16 }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.key)}
                disabled={loading}
                className={`${plan.ctaClass} btn-lg`}
                style={{ 
                  width: "100%",
                  opacity: loading && selectedPlan === plan.key ? 0.7 : 1,
                }}
              >
                {loading && selectedPlan === plan.key ? (
                  <>
                    <span className="animate-spin" style={{ marginRight: 8 }}>⏳</span>
                    Attivazione...
                  </>
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>
        
        {/* Trust Badges */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: 32,
          flexWrap: "wrap",
          color: "var(--text-muted)",
          fontSize: 13,
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>🔒</span> Pagamenti sicuri
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>↩️</span> Rimborso 30 giorni
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>🎧</span> Supporto 24/7
          </span>
        </div>
        
        {/* Footer Note */}
        <p style={{ 
          textAlign: "center", 
          color: "var(--text-muted)", 
          fontSize: 12, 
          marginTop: 24 
        }}>
          I prezzi includono IVA. Puoi annullare in qualsiasi momento.
        </p>
      </div>
    </div>
  );
}
