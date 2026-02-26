"use client";

import { useState, useEffect } from "react";
import { getConfig, setAuthenticated, isAuthenticated, saveConfig, checkSubscriptionStatus } from "@/lib/store";
import SetupWizard from "./SetupWizard";
import AdminApp from "./AdminApp";
import PricingPlans from "./PricingPlans";

type View = "loading" | "pricing" | "login" | "setup" | "app";

export default function LoginGate() {
  const [view, setView] = useState<View>("loading");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const init = () => {
      const config = getConfig();
      const subStatus = checkSubscriptionStatus(config.subscription);
      
      if (!subStatus.isValid && config.subscription?.plan !== "trial") {
        // Subscription expired or invalid - show pricing
        setView("pricing");
      } else if (!config.setupComplete) {
        setView("setup");
      } else if (isAuthenticated()) {
        setView("app");
      } else {
        setView("login");
      }
    };
    init();
  }, []);

  const handlePricingComplete = () => {
    const config = getConfig();
    if (!config.setupComplete) {
      setView("setup");
    } else {
      setView("app");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    const config = getConfig();
    if (pin === config.adminPin) {
      setAuthenticated(true);
      setView("app");
      setPinError(false);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPinError(true);
      setPin("");
      if (newAttempts >= 5) {
        setLocked(true);
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
        }, 30000);
      }
    }
  };

  const handleSetupComplete = () => {
    setAuthenticated(true);
    setView("app");
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPin("");
    setPinError(false);
    setView("login");
  };

  const handleGoToSetup = () => {
    setAuthenticated(false);
    setView("setup");
  };

  const handleGoToPricing = () => {
    setAuthenticated(false);
    setView("pricing");
  };

  if (view === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <div className="animate-spin" style={{ width: 32, height: 32 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        </div>
      </div>
    );
  }

  if (view === "pricing") {
    return <PricingPlans onPlanSelected={handlePricingComplete} />;
  }

  if (view === "setup") {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  if (view === "app") {
    return <AdminApp onLogout={handleLogout} onGoToSetup={handleGoToSetup} onGoToPricing={handleGoToPricing} />;
  }

  // Login view
  const config = getConfig();
  const businessInfo = config.setupComplete ? config : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
            {businessInfo?.businessName || "AdminHub"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {businessInfo
              ? `Pannello di gestione — ${businessInfo.businessType === "parrucchiere" ? "💇 Parrucchiere" : businessInfo.businessType === "estetista" ? "💅 Estetista" : "🍽️ Ristorante"}`
              : "Accedi al pannello di gestione"}
          </p>
        </div>

        {/* Login card */}
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 24 }}>
              <label className="form-label" htmlFor="pin">
                PIN Amministratore
              </label>
              <input
                id="pin"
                type="password"
                className="form-input"
                placeholder="••••••"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError(false);
                }}
                maxLength={8}
                required
                disabled={locked}
                style={{
                  textAlign: "center",
                  fontSize: 24,
                  letterSpacing: "0.4em",
                  fontWeight: 700,
                }}
                autoFocus
              />
              {pinError && !locked && (
                <p style={{ color: "var(--error)", fontSize: 13, marginTop: 8, textAlign: "center" }}>
                  PIN non corretto. {5 - attempts} tentativi rimanenti.
                </p>
              )}
              {locked && (
                <div
                  className="notification notification-error"
                  style={{ marginTop: 12, fontSize: 13 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Troppi tentativi. Riprova tra 30 secondi.
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              disabled={locked || !pin}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Accedi
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button
              onClick={() => setView("setup")}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 13, color: "var(--text-muted)" }}
            >
              ⚙️ Riconfigura attività
            </button>
          </div>
        </div>

        {/* Demo hint */}
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
          Demo: PIN predefinito{" "}
          <code
            style={{
              background: "var(--surface-2)",
              padding: "2px 6px",
              borderRadius: 4,
              color: "var(--primary)",
              fontWeight: 600,
            }}
          >
            1234
          </code>
        </p>
      </div>
    </div>
  );
}
