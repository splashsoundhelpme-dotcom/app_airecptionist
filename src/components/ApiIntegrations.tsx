"use client";

import { useState, useEffect } from "react";
import { getConfig, saveConfig, generateId } from "@/lib/store";
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
  
  // Real-time data simulation
  const [incomingData, setIncomingData] = useState<{
    type: string;
    content: string;
    timestamp: string;
  }[]>([]);
  
  // Simulate incoming data for demo
  useEffect(() => {
    if (!api.phoneEnabled && !api.emailEnabled && !api.whatsappEnabled) return;
    
    const interval = setInterval(() => {
      const channels = [];
      if (api.phoneEnabled) channels.push("📞 Chiamata");
      if (api.emailEnabled) channels.push("✉️ Email");
      if (api.whatsappEnabled) channels.push("💬 WhatsApp");
      
      if (channels.length > 0) {
        const randomChannel = channels[Math.floor(Math.random() * channels.length)];
        const sampleData = [
          "Nuova prenotazione: Marco Rossi - 15:00 domani",
          "Richiesta informazioni servizi",
          "Cancellazione appuntamento",
          "Conferma disponibilità",
        ];
        const randomContent = sampleData[Math.floor(Math.random() * sampleData.length)];
        
        setIncomingData(prev => [{
          type: randomChannel,
          content: randomContent,
          timestamp: new Date().toLocaleTimeString("it-IT"),
        }, ...prev].slice(0, 10));
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }, [api.phoneEnabled, api.emailEnabled, api.whatsappEnabled]);
  
  const handleToggle = (field: keyof ApiIntegration) => {
    setApi(prev => ({ ...prev, [field]: !prev[field] }));
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
          API & Integrazioni
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Collega i tuoi canali di comunicazione per ricevere prenotazioni automaticamente.
        </p>
      </div>

      {/* Owner API Keys Status */}
      <div className="card" style={{ padding: 16, background: api.ownerApiKeysConfigured ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>{api.ownerApiKeysConfigured ? "✅" : "⚠️"}</span>
          <div>
            <p style={{ fontWeight: 600, color: "white", marginBottom: 2 }}>
              {api.ownerApiKeysConfigured ? "API Keys Owner Configurate" : "API Keys Owner Non Configurate"}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
              {api.ownerApiKeysConfigured 
                ? "Tutte le funzionalità AI sono attive" 
                : "L'owner deve configurare le API keys nel file .env"}
            </p>
          </div>
        </div>
      </div>
      
      {/* AI Model Selection */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}>
              🤖
            </div>
            <div>
              <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                Modello AI
              </h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Scegli il motore AI per l&apos;assistente vocale
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button
            onClick={() => setApi(prev => ({ ...prev, aiModel: "gemini" }))}
            style={{
              padding: 16,
              borderRadius: 12,
              border: api.aiModel === "gemini" ? "2px solid #667eea" : "2px solid var(--border)",
              background: api.aiModel === "gemini" ? "rgba(102,126,234,0.1)" : "var(--surface-2)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>💎</span>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>Gemini</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Google AI - Più economico</p>
          </button>
          
          <button
            onClick={() => setApi(prev => ({ ...prev, aiModel: "openai" }))}
            style={{
              padding: 16,
              borderRadius: 12,
              border: api.aiModel === "openai" ? "2px solid #667eea" : "2px solid var(--border)",
              background: api.aiModel === "openai" ? "rgba(102,126,234,0.1)" : "var(--surface-2)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>🔗</span>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>OpenAI</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>GPT - Più avanzato</p>
          </button>
        </div>
      </div>
      
      {/* Voice AI (11Labs) */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: api.voiceEnabled ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}>
              🎙️
            </div>
            <div>
              <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                Assistente Vocale AI
              </h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                11Labs - Sintesi vocale AI (€0.01/min)
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("voiceEnabled")}
            className={`toggle ${api.voiceEnabled ? "toggle-on" : ""}`}
            style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              background: api.voiceEnabled ? "var(--success)" : "var(--surface-2)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s",
            }}
          >
            <span style={{
              position: "absolute",
              top: 2,
              left: api.voiceEnabled ? 26 : 2,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.2s",
            }} />
          </button>
        </div>
        
        {api.voiceEnabled && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            {/* Welcome Message */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Messaggio di Benvenuto</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Benvenuto da [Nome Attività]! Come posso aiutarti oggi?"
                value={api.welcomeMessage || ""}
                onChange={(e) => setApi(prev => ({ ...prev, welcomeMessage: e.target.value }))}
              />
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Questo messaggio verrà riprodotto quando i clienti chiamano
              </p>
            </div>
            
            {/* Voice Tone Selection */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Tono della Voce</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {voiceTones.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setApi(prev => ({ ...prev, voiceTone: tone.value }))}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: api.voiceTone === tone.value ? "2px solid #667eea" : "1px solid var(--border)",
                      background: api.voiceTone === tone.value ? "rgba(102,126,234,0.1)" : "var(--surface-2)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <p style={{ fontWeight: 500, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>
                      {tone.label}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {tone.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Language */}
            <div>
              <label className="form-label">Lingua</label>
              <select
                className="form-input"
                value={api.voiceLanguage || "it-IT"}
                onChange={(e) => setApi(prev => ({ ...prev, voiceLanguage: e.target.value }))}
              >
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
      
      {/* Incoming Data Stream (Demo) */}
      {incomingData.length > 0 && (
        <div className="card" style={{ padding: 16, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}></span>
            <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 600 }}>DATI IN ARRIVO IN TEMPO REALE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 150, overflow: "auto" }}>
            {incomingData.map((item, idx) => (
              <div key={idx} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                padding: "8px 12px", 
                background: "rgba(255,255,255,0.05)", 
                borderRadius: 8,
                fontSize: 13,
              }}>
                <span style={{ color: "#fbbf24" }}>{item.type}</span>
                <span style={{ color: "#e2e8f0", flex: 1 }}>{item.content}</span>
                <span style={{ color: "#64748b", fontSize: 11 }}>{item.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Phone Integration (Vapi AI) */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: api.phoneEnabled ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}>
              📞
            </div>
            <div>
              <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                Chiamate Telefoniche AI
              </h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Vapi AI — Telefonia + AI + Voce in un&apos;unica API (~$0.05/min)
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("phoneEnabled")}
            className={`toggle ${api.phoneEnabled ? "toggle-on" : ""}`}
            style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              background: api.phoneEnabled ? "var(--success)" : "var(--surface-2)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s",
            }}
          >
            <span style={{
              position: "absolute",
              top: 2,
              left: api.phoneEnabled ? 26 : 2,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.2s",
            }} />
          </button>
        </div>
        
        {api.phoneEnabled && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label className="form-label">Vapi API Key</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="vapi-xxxxxxxxxxxxx"
                  value={api.phoneApiKey || ""}
                  onChange={(e) => setApi(prev => ({ ...prev, phoneApiKey: e.target.value }))}
                />
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  Trova la tua API key su{" "}
                  <a href="https://dashboard.vapi.ai" target="_blank" rel="noopener noreferrer" style={{ color: "#667eea" }}>
                    dashboard.vapi.ai
                  </a>
                </p>
              </div>
              <div>
                <label className="form-label">Phone Number ID (Vapi)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={api.phoneApiSecret || ""}
                  onChange={(e) => setApi(prev => ({ ...prev, phoneApiSecret: e.target.value }))}
                />
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  ID del numero di telefono acquistato su Vapi
                </p>
              </div>
              <div>
                <label className="form-label">Assistant ID (opzionale)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Lascia vuoto per creare automaticamente"
                  value={api.phoneNumber || ""}
                  onChange={(e) => setApi(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  Se hai già un assistente Vapi, inserisci l&apos;ID. Altrimenti verrà creato automaticamente.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    if (!api.phoneApiKey) { alert("Inserisci prima la Vapi API Key"); return; }
                    try {
                      const res = await fetch("/api/vapi", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "create_assistant",
                          apiKey: api.phoneApiKey,
                          config: {
                            businessName: config.businessName || "La mia attività",
                            businessType: config.businessType,
                            aiPersonality: config.aiPersonality,
                            services: config.services,
                          },
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setApi(prev => ({ ...prev, phoneNumber: data.assistantId }));
                        alert("Assistente creato! ID: " + data.assistantId);
                      } else {
                        alert("Errore: " + (data.error || "Errore sconosciuto"));
                      }
                    } catch (err) {
                      alert("Errore di connessione: " + String(err));
                    }
                  }}
                >
                  🤖 Crea Assistente Vapi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Email Integration */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: api.emailEnabled ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}>
              ✉️
            </div>
            <div>
              <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                Email
              </h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                SendGrid - €0.10 per 100 email (demo gratuito)
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("emailEnabled")}
            className={`toggle ${api.emailEnabled ? "toggle-on" : ""}`}
            style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              background: api.emailEnabled ? "var(--success)" : "var(--surface-2)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s",
            }}
          >
            <span style={{
              position: "absolute",
              top: 2,
              left: api.emailEnabled ? 26 : 2,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.2s",
            }} />
          </button>
        </div>
        
        {api.emailEnabled && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label className="form-label">API Key (SendGrid)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="SG.xxxxxxxxxxxxxx"
                  value={api.emailApiKey || ""}
                  onChange={(e) => setApi(prev => ({ ...prev, emailApiKey: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">Email Mittente</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="noreply@tuodominio.it"
                  value={api.emailFromAddress || ""}
                  onChange={(e) => setApi(prev => ({ ...prev, emailFromAddress: e.target.value }))}
                />
              </div>
            </div>
            
            {/* Email Notifications Settings */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
                🔔 Notifiche Email
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { key: "notifyOnNewReservation", label: "Nuova prenotazione", icon: "📅" },
                  { key: "notifyOnCancellation", label: "Cancellazione", icon: "❌" },
                  { key: "notifyOnModification", label: "Modifica", icon: "✏️" },
                ].map((notification) => (
                  <label
                    key={notification.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "var(--surface-2)",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "var(--text)" }}>
                      {notification.icon} {notification.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={api[notification.key as keyof ApiIntegration] as boolean}
                      onChange={(e) => setApi(prev => ({ ...prev, [notification.key]: e.target.checked }))}
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* WhatsApp Integration */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: api.whatsappEnabled ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}>
              💬
            </div>
            <div>
              <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                WhatsApp Business
              </h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Meta Business API - €0.03/messaggio (demo gratuito)
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("whatsappEnabled")}
            className={`toggle ${api.whatsappEnabled ? "toggle-on" : ""}`}
            style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              background: api.whatsappEnabled ? "var(--success)" : "var(--surface-2)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s",
            }}
          >
            <span style={{
              position: "absolute",
              top: 2,
              left: api.whatsappEnabled ? 26 : 2,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.2s",
            }} />
          </button>
        </div>
        
        {api.whatsappEnabled && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label className="form-label">Phone Number ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="123456789012345"
                  value={api.whatsappPhoneNumberId || ""}
                  onChange={(e) => setApi(prev => ({ ...prev, whatsappPhoneNumberId: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">Access Token</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="EAxxxxxxxxxxxxx"
                  value={api.whatsappAccessToken || ""}
                  onChange={(e) => setApi(prev => ({ ...prev, whatsappAccessToken: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Webhook URL */}
      <div className="card" style={{ padding: 20 }}>
        <h4 style={{ fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
          Webhook URL
        </h4>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>
          Inserisci un URL per ricevere notifiche JSON su ogni nuovo evento.
        </p>
        <input
          type="url"
          className="form-input"
          placeholder="https://tuodominio.it/webhook"
          value={api.webhookUrl || ""}
          onChange={(e) => setApi(prev => ({ ...prev, webhookUrl: e.target.value }))}
        />
      </div>
      
      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary btn-lg"
        style={{ alignSelf: "flex-start" }}
      >
        {saving ? "Salvataggio..." : saved ? "✓ Salvato!" : "Salva Configurazione"}
      </button>
    </div>
  );
}
