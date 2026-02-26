"use client";

import { useState, useEffect } from "react";
import { getConfig, saveConfig, generateId } from "@/lib/store";
import type { BusinessConfig, ApiIntegration } from "@/lib/types";

interface ApiIntegrationsProps {
  config: BusinessConfig;
  onSave: (config: BusinessConfig) => void;
}

export default function ApiIntegrations({ config, onSave }: ApiIntegrationsProps) {
  const [api, setApi] = useState<ApiIntegration>(config.apiIntegration || {
    phoneEnabled: false,
    emailEnabled: false,
    whatsappEnabled: false,
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
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          API
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Collega i tuoi canali di comunicazione per ricevere prenotazioni automaticamente.
        </p>
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
      
      {/* Phone Integration */}
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
                Chiamate Telefoniche
              </h4>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Twilio - €0.01/min (demo gratuito)
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
                <label className="form-label">Numero di Telefono</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+39 333 1234567"
                  value={api.phoneNumber || ""}
                  onChange={(e) => setApi(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">API Key (Twilio)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="SKxxxxxxxxxxxxx"
                  value={api.phoneApiKey || ""}
                  onChange={(e) => setApi(prev => ({ ...prev, phoneApiKey: e.target.value }))}
                />
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
