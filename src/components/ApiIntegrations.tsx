"use client";

import { useState, useEffect } from "react";
import { saveConfig } from "@/lib/store";
import type { BusinessConfig, ApiIntegration, VoiceTone } from "@/lib/types";

interface ApiIntegrationsProps {
  config: BusinessConfig;
  onSave: (config: BusinessConfig) => void;
}

export default function ApiIntegrations({ config, onSave }: ApiIntegrationsProps) {
  const [api, setApi] = useState<ApiIntegration>(config.apiIntegration || {
    ownerApiKeysConfigured: false,
    phoneEnabled: false,
    emailEnabled: false,
    whatsappEnabled: false,
    voiceEnabled: false,
    notifyOnNewReservation: true,
    notifyOnCancellation: true,
    notifyOnModification: true,
    aiModel: "gemini",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [vapiStatus, setVapiStatus] = useState<{ configured: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/vapi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status" }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setVapiStatus({ configured: d.configured }); })
      .catch(() => {});
  }, []);

  const handleToggle = (key: keyof ApiIntegration) => {
    setApi((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const updatedConfig = { ...config, apiIntegration: api };
      saveConfig(updatedConfig);
      onSave(updatedConfig);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  const voiceTones: { value: VoiceTone; label: string; description: string }[] = [
    { value: "professionale", label: "👔 Professionale", description: "Voce seria e affidabile" },
    { value: "amichevole", label: "😊 Amichevole", description: "Voce calda e accogliente" },
    { value: "elegante", label: "✨ Elegante", description: "Voce raffinata e distintiva" },
    { value: "giovane", label: "🎯 Giovane", description: "Voce moderna e dinamica" },
    { value: "caldo", label: "🔥 Caldo", description: "Voce rassicurante e familiare" },
    { value: "energetico", label: "⚡ Energetico", description: "Voce vivace e motivante" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Canali di Comunicazione
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Attiva i canali per ricevere prenotazioni automaticamente. Le API sono già configurate.
        </p>
      </div>

      {/* Status */}
      <div className="card" style={{ padding: 16, background: vapiStatus?.configured ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>{vapiStatus?.configured ? "✅" : "⚠️"}</span>
          <div>
            <p style={{ fontWeight: 600, color: "white", marginBottom: 2 }}>
              {vapiStatus?.configured ? "Servizi Configurati e Pronti" : "Configurazione in corso..."}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
              {vapiStatus?.configured
                ? "Tutte le funzionalità AI sono attive — attiva i canali che ti servono"
                : "Le API keys sono gestite dal server — nessuna configurazione richiesta"}
            </p>
          </div>
        </div>
      </div>

      {/* AI Model */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🤖</div>
          <div>
            <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Modello AI</h4>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Scegli il motore AI per l&apos;assistente</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {(["gemini", "openai"] as const).map((model) => (
            <button key={model} onClick={() => setApi((prev) => ({ ...prev, aiModel: model }))} style={{
              padding: 16, borderRadius: 12,
              border: api.aiModel === model ? "2px solid #667eea" : "2px solid var(--border)",
              background: api.aiModel === model ? "rgba(102,126,234,0.1)" : "var(--surface-2)",
              cursor: "pointer", textAlign: "left",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 20 }}>{model === "gemini" ? "💎" : "🔗"}</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{model === "gemini" ? "Gemini" : "OpenAI"}</span>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{model === "gemini" ? "Google AI - Più economico" : "GPT - Più avanzato"}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Voice AI */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: api.voiceEnabled ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎙️</div>
            <div>
              <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Assistente Vocale AI</h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Sintesi vocale per le chiamate</p>
            </div>
          </div>
          <ToggleSwitch checked={api.voiceEnabled} onChange={() => handleToggle("voiceEnabled")} />
        </div>
        {api.voiceEnabled && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Messaggio di Benvenuto</label>
              <textarea className="form-input" rows={3} placeholder="Benvenuto da [Nome Attività]! Come posso aiutarti oggi?" value={api.welcomeMessage || ""} onChange={(e) => setApi((prev) => ({ ...prev, welcomeMessage: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Tono della Voce</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {voiceTones.map((tone) => (
                  <button key={tone.value} onClick={() => setApi((prev) => ({ ...prev, voiceTone: tone.value }))} style={{
                    padding: "10px 12px", borderRadius: 8,
                    border: api.voiceTone === tone.value ? "2px solid #667eea" : "1px solid var(--border)",
                    background: api.voiceTone === tone.value ? "rgba(102,126,234,0.1)" : "var(--surface)",
                    cursor: "pointer", textAlign: "left",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{tone.label}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{tone.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Lingua</label>
              <select className="form-input" value={api.voiceLanguage || "it-IT"} onChange={(e) => setApi((prev) => ({ ...prev, voiceLanguage: e.target.value }))}>
                <option value="it-IT">🇮🇹 Italiano</option>
                <option value="en-US">🇬🇧 Inglese</option>
                <option value="es-ES">🇪🇸 Spagnolo</option>
                <option value="fr-FR">🇫🇷 Francese</option>
                <option value="de-DE">🇩🇪 Tedesco</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Phone */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: api.phoneEnabled ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📞</div>
            <div>
              <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Chiamate Telefoniche AI</h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Vapi AI — Telefonia + AI + Voce integrata</p>
            </div>
          </div>
          <ToggleSwitch checked={api.phoneEnabled} onChange={() => handleToggle("phoneEnabled")} />
        </div>
        {api.phoneEnabled && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              ✅ Le chiamate sono gestite dall&apos;assistente AI configurato. Quando un cliente chiama, l&apos;AI risponde automaticamente, raccoglie le informazioni e crea la prenotazione.
            </p>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: api.emailEnabled ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✉️</div>
            <div>
              <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Email</h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Notifiche email per prenotazioni</p>
            </div>
          </div>
          <ToggleSwitch checked={api.emailEnabled} onChange={() => handleToggle("emailEnabled")} />
        </div>
        {api.emailEnabled && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 12 }}>🔔 Notifiche Email</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "notifyOnNewReservation", label: "Nuova prenotazione", icon: "📅" },
                { key: "notifyOnCancellation", label: "Cancellazione", icon: "❌" },
                { key: "notifyOnModification", label: "Modifica", icon: "✏️" },
              ].map((n) => (
                <label key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "var(--surface-2)", cursor: "pointer" }}>
                  <span style={{ fontSize: 13, color: "var(--text)" }}>{n.icon} {n.label}</span>
                  <input type="checkbox" checked={api[n.key as keyof ApiIntegration] as boolean} onChange={() => setApi((prev) => ({ ...prev, [n.key]: !prev[n.key as keyof ApiIntegration] }))} style={{ width: 18, height: 18 }} />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: api.whatsappEnabled ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>💬</div>
            <div>
              <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>WhatsApp Business</h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Ricevi prenotazioni via WhatsApp</p>
            </div>
          </div>
          <ToggleSwitch checked={api.whatsappEnabled} onChange={() => handleToggle("whatsappEnabled")} />
        </div>
        {api.whatsappEnabled && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              ✅ WhatsApp è configurato e pronto. I clienti possono inviare messaggi per prenotare.
            </p>
          </div>
        )}
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-lg" style={{ alignSelf: "flex-start" }}>
        {saving ? "Salvataggio..." : saved ? "✓ Salvato!" : "Salva Configurazione"}
      </button>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 52, height: 28, borderRadius: 14,
      background: checked ? "var(--success)" : "var(--surface-2)",
      border: "none", cursor: "pointer", position: "relative", transition: "all 0.2s",
    }}>
      <span style={{
        position: "absolute", top: 2, left: checked ? 26 : 2,
        width: 24, height: 24, borderRadius: "50%",
        background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "all 0.2s",
      }} />
    </button>
  );
}
