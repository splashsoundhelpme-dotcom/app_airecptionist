"use client";

import { useState } from "react";
import type { BusinessType, BusinessConfig } from "@/lib/types";
import {
  DEFAULT_CONFIG,
  DEFAULT_WEEK_HOURS,
  DEFAULT_SERVICES,
  saveConfig,
  DAYS_IT,
  DAYS_LABELS,
} from "@/lib/store";

interface Props {
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const BUSINESS_OPTIONS: { type: BusinessType; icon: string; label: string; desc: string; color: string }[] = [
  {
    type: "parrucchiere",
    icon: "💇",
    label: "Parrucchiere",
    desc: "Gestisci tagli, colorazioni, trattamenti e appuntamenti del tuo salone",
    color: "var(--hair)",
  },
  {
    type: "estetista",
    icon: "💅",
    label: "Estetista",
    desc: "Organizza trattamenti viso, corpo, massaggi e prenotazioni",
    color: "var(--beauty)",
  },
  {
    type: "ristorante",
    icon: "🍽️",
    label: "Ristorante",
    desc: "Gestisci tavoli, coperti, prenotazioni pranzo e cena",
    color: "var(--restaurant)",
  },
];

export default function SetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [provisioning, setProvisioning] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>({
    ...DEFAULT_CONFIG,
    weekHours: { ...DEFAULT_WEEK_HOURS },
  });

  const updateConfig = (updates: Partial<BusinessConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleComplete = async () => {
    setProvisioning(true);
    const finalConfig: BusinessConfig = {
      ...config,
      services: DEFAULT_SERVICES[config.businessType],
      setupComplete: true,
    };

    try {
      const res = await fetch("/api/vapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "provision",
          config: {
            businessName: finalConfig.businessName,
            businessType: finalConfig.businessType,
            aiPersonality: finalConfig.aiPersonality,
            services: finalConfig.services,
            weekHours: finalConfig.weekHours,
            turni: finalConfig.turni,
            phone: finalConfig.phone,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        finalConfig.apiIntegration = {
          ownerApiKeysConfigured: true,
          phoneEnabled: true,
          emailEnabled: false,
          whatsappEnabled: false,
          voiceEnabled: true,
          phoneNumber: data.assistantId,
          phoneApiSecret: data.phoneNumber?.id,
          notifyOnNewReservation: true,
          notifyOnCancellation: true,
          notifyOnModification: true,
          aiModel: "gemini" as const,
        };
      }
    } catch (err) {
      console.error("Vapi provisioning error:", err);
    }

    saveConfig(finalConfig);
    setProvisioning(false);
    onComplete();
  };

  const steps = [
    { n: 1, label: "Tipo attività" },
    { n: 2, label: "Informazioni" },
    { n: 3, label: "Orari" },
    { n: 4, label: "Configurazione" },
    { n: 5, label: "Accesso" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 24px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40, maxWidth: 600, width: "100%" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
          </svg>
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Configura la tua attività
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Imposta il tuo pannello di gestione prenotazioni in pochi minuti
        </p>
      </div>

      {/* Step indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginBottom: 40,
          maxWidth: 600,
          width: "100%",
        }}
      >
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                className={`step-dot ${
                  step > s.n ? "step-dot-done" : step === s.n ? "step-dot-active" : "step-dot-inactive"
                }`}
              >
                {step > s.n ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  s.n
                )}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: step === s.n ? "var(--primary)" : "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: step > s.n ? "var(--primary)" : "var(--border)",
                  margin: "0 4px",
                  marginBottom: 22,
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div style={{ width: "100%", maxWidth: 600 }}>
        {step === 1 && (
          <Step1
            selected={config.businessType}
            onSelect={(t) => updateConfig({ businessType: t })}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2
            config={config}
            onChange={updateConfig}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            config={config}
            onChange={updateConfig}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <Step4
            config={config}
            onChange={updateConfig}
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
          />
        )}
        {step === 5 && (
          <Step5
            config={config}
            onChange={updateConfig}
            onBack={() => setStep(4)}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}

// ── Step 1: Business Type ─────────────────────────────────────
function Step1({
  selected,
  onSelect,
  onNext,
}: {
  selected: BusinessType;
  onSelect: (t: BusinessType) => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-fade-in">
      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
          Che tipo di attività gestisci?
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          Scegli il tipo di attività per personalizzare il pannello
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {BUSINESS_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "20px 24px",
                borderRadius: 12,
                border: selected === opt.type ? `2px solid ${opt.color}` : "2px solid var(--border)",
                background: selected === opt.type ? `${opt.color}10` : "var(--surface)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                width: "100%",
              }}
            >
              <span style={{ fontSize: 36 }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: selected === opt.type ? opt.color : "var(--text)",
                    marginBottom: 4,
                  }}
                >
                  {opt.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{opt.desc}</div>
              </div>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: selected === opt.type ? `2px solid ${opt.color}` : "2px solid var(--border)",
                  background: selected === opt.type ? opt.color : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {selected === opt.type && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: "100%", marginTop: 24 }}
          onClick={onNext}
        >
          Continua
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Business Info ─────────────────────────────────────
function Step2({
  config,
  onChange,
  onBack,
  onNext,
}: {
  config: BusinessConfig;
  onChange: (u: Partial<BusinessConfig>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const isRestaurant = config.businessType === "ristorante";
  const canContinue = config.businessName.trim().length >= 2 && config.phone.trim().length >= 6;

  return (
    <div className="animate-fade-in">
      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
          Informazioni sull&apos;attività
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          Questi dati appariranno nel pannello e nelle comunicazioni ai clienti
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label className="form-label">Nome attività *</label>
            <input
              className="form-input"
              placeholder={
                config.businessType === "parrucchiere"
                  ? "Es. Salone Bella Vita"
                  : config.businessType === "estetista"
                  ? "Es. Centro Estetico Aurora"
                  : "Es. Ristorante La Pergola"
              }
              value={config.businessName}
              onChange={(e) => onChange({ businessName: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Indirizzo</label>
            <input
              className="form-input"
              placeholder="Es. Via Roma 12, Milano"
              value={config.address}
              onChange={(e) => onChange({ address: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Telefono *</label>
              <input
                className="form-input"
                type="tel"
                placeholder="+39 02 1234567"
                value={config.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="info@attivita.it"
                value={config.email}
                onChange={(e) => onChange({ email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Sito web (opzionale)</label>
            <input
              className="form-input"
              type="url"
              placeholder="https://www.attivita.it"
              value={config.website || ""}
              onChange={(e) => onChange({ website: e.target.value })}
            />
          </div>

          {isRestaurant && (
            <div
              style={{
                background: "var(--restaurant-bg)",
                border: "1px solid rgba(234,88,12,0.2)",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--restaurant)",
                  marginBottom: 12,
                }}
              >
                🍽️ Configurazione Ristorante
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Coperti massimi</label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    max={500}
                    placeholder="40"
                    value={config.maxCovers || ""}
                    onChange={(e) => onChange({ maxCovers: parseInt(e.target.value) || 40 })}
                  />
                </div>
                <div>
                  <label className="form-label">Numero tavoli</label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    max={100}
                    placeholder="10"
                    value={config.tableCount || ""}
                    onChange={(e) => onChange({ tableCount: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ flex: 1 }}>
            ← Indietro
          </button>
          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={!canContinue}
            style={{ flex: 2 }}
          >
            Continua →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Hours ─────────────────────────────────────────────
function Step3({
  config,
  onChange,
  onBack,
  onNext,
}: {
  config: BusinessConfig;
  onChange: (u: Partial<BusinessConfig>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const updateDay = (day: string, field: string, value: string | boolean) => {
    onChange({
      weekHours: {
        ...config.weekHours,
        [day]: { ...config.weekHours[day], [field]: value },
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
          Orari di apertura
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          Imposta gli orari per ogni giorno della settimana
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DAYS_IT.map((day) => {
            const hours = config.weekHours[day];
            return (
              <div
                key={day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: hours.open ? "var(--surface)" : "var(--surface-2)",
                  border: "1px solid var(--border)",
                  transition: "all 0.2s",
                }}
              >
                {/* Toggle */}
                <label className="toggle" style={{ flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={hours.open}
                    onChange={(e) => updateDay(day, "open", e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>

                {/* Day name */}
                <span
                  style={{
                    width: 90,
                    fontSize: 14,
                    fontWeight: 500,
                    color: hours.open ? "var(--text)" : "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {DAYS_LABELS[day]}
                </span>

                {hours.open ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <input
                      type="time"
                      className="form-input"
                      value={hours.from}
                      onChange={(e) => updateDay(day, "from", e.target.value)}
                      style={{ padding: "8px 12px", fontSize: 14 }}
                    />
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>–</span>
                    <input
                      type="time"
                      className="form-input"
                      value={hours.to}
                      onChange={(e) => updateDay(day, "to", e.target.value)}
                      style={{ padding: "8px 12px", fontSize: 14 }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                    Chiuso
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ flex: 1 }}>
            ← Indietro
          </button>
          <button className="btn btn-primary" onClick={onNext} style={{ flex: 2 }}>
            Continua →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 4: AI & Notifications ────────────────────────────────
function Step4({
  config,
  onChange,
  onBack,
  onNext,
}: {
  config: BusinessConfig;
  onChange: (u: Partial<BusinessConfig>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-fade-in">
      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
          Assistente AI & Notifiche
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          Configura l&apos;assistente AI e le notifiche per le prenotazioni
        </p>

        {/* AI Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea15, #764ba215)",
            border: "1px solid rgba(102,126,234,0.2)",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>
                🤖 Assistente AI
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Risponde automaticamente a chiamate, email e SMS
              </p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={config.aiEnabled}
                onChange={(e) => onChange({ aiEnabled: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {config.aiEnabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Personalità dell&apos;AI</label>
                <select
                  className="form-input"
                  value={config.aiPersonality}
                  onChange={(e) => onChange({ aiPersonality: e.target.value })}
                >
                  <option value="professionale">Professionale e formale</option>
                  <option value="amichevole">Amichevole e cordiale</option>
                  <option value="elegante">Elegante e raffinato</option>
                  <option value="diretto">Diretto ed efficiente</option>
                </select>
              </div>

              <div>
                <label className="form-label">Canali gestiti dall&apos;AI</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {[
                    { id: "telefono", label: "📞 Telefono" },
                    { id: "email", label: "✉️ Email" },
                    { id: "sms", label: "💬 SMS" },
                    { id: "whatsapp", label: "📱 WhatsApp" },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        const langs = config.aiLanguages.includes(ch.id)
                          ? config.aiLanguages.filter((l) => l !== ch.id)
                          : [...config.aiLanguages, ch.id];
                        onChange({ aiLanguages: langs });
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 99,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        border: config.aiLanguages.includes(ch.id)
                          ? "2px solid #667eea"
                          : "2px solid var(--border)",
                        background: config.aiLanguages.includes(ch.id)
                          ? "rgba(102,126,234,0.1)"
                          : "var(--surface)",
                        color: config.aiLanguages.includes(ch.id) ? "#667eea" : "var(--text-secondary)",
                        transition: "all 0.2s",
                      }}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
            🔔 Notifiche per nuove prenotazioni
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { key: "notifyEmail", label: "Email", icon: "✉️", desc: "Ricevi email per ogni nuova prenotazione" },
              { key: "notifySms", label: "SMS", icon: "💬", desc: "Ricevi SMS per ogni nuova prenotazione" },
              { key: "notifyWhatsapp", label: "WhatsApp", icon: "📱", desc: "Ricevi messaggio WhatsApp" },
            ].map((n) => (
              <div
                key={n.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
                    {n.icon} {n.label}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{n.desc}</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={config[n.key as keyof BusinessConfig] as boolean}
                    onChange={(e) => onChange({ [n.key]: e.target.checked })}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ flex: 1 }}>
            ← Indietro
          </button>
          <button className="btn btn-primary" onClick={onNext} style={{ flex: 2 }}>
            Continua →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Admin Access ──────────────────────────────────────
function Step5({
  config,
  onChange,
  onBack,
  onComplete,
}: {
  config: BusinessConfig;
  onChange: (u: Partial<BusinessConfig>) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMismatch, setPinMismatch] = useState(false);

  const canComplete =
    config.adminPin.length >= 4 &&
    config.adminPin === confirmPin &&
    config.adminEmail.trim().length >= 5;

  const handleComplete = () => {
    if (config.adminPin !== confirmPin) {
      setPinMismatch(true);
      return;
    }
    onComplete();
  };

  return (
    <div className="animate-fade-in">
      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
          Accesso amministratore
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          Imposta le credenziali per accedere al pannello
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label className="form-label">Email amministratore *</label>
            <input
              className="form-input"
              type="email"
              placeholder="admin@attivita.it"
              value={config.adminEmail}
              onChange={(e) => onChange({ adminEmail: e.target.value })}
            />
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              Usata per recupero PIN e notifiche importanti
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">PIN di accesso *</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min. 4 cifre"
                value={config.adminPin}
                onChange={(e) => {
                  onChange({ adminPin: e.target.value });
                  setPinMismatch(false);
                }}
                maxLength={8}
                style={{ textAlign: "center", letterSpacing: "0.3em", fontSize: 18 }}
              />
            </div>
            <div>
              <label className="form-label">Conferma PIN *</label>
              <input
                className="form-input"
                type="password"
                placeholder="Ripeti PIN"
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  setPinMismatch(false);
                }}
                maxLength={8}
                style={{ textAlign: "center", letterSpacing: "0.3em", fontSize: 18 }}
              />
            </div>
          </div>

          {pinMismatch && (
            <div className="notification notification-error" style={{ fontSize: 13 }}>
              I PIN non corrispondono. Riprova.
            </div>
          )}

          {/* Summary */}
          <div
            style={{
              background: "var(--surface-2)",
              borderRadius: 10,
              padding: 16,
              border: "1px solid var(--border)",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>
              📋 Riepilogo configurazione
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                {
                  label: "Tipo attività",
                  value:
                    config.businessType === "parrucchiere"
                      ? "💇 Parrucchiere"
                      : config.businessType === "estetista"
                      ? "💅 Estetista"
                      : "🍽️ Ristorante",
                },
                { label: "Nome", value: config.businessName || "—" },
                { label: "Telefono", value: config.phone || "—" },
                {
                  label: "Assistente AI",
                  value: config.aiEnabled ? "✅ Attivo" : "❌ Disattivo",
                },
                {
                  label: "Giorni apertura",
                  value: `${Object.values(config.weekHours).filter((d) => d.open).length} giorni/settimana`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
                >
                  <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                  <span style={{ fontWeight: 500, color: "var(--text)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ flex: 1 }}>
            ← Indietro
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleComplete}
            disabled={!canComplete}
            style={{ flex: 2 }}
          >
            🚀 Avvia il pannello
          </button>
        </div>
      </div>
    </div>
  );
}
