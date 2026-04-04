"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { BusinessConfig, Reservation, AiMessage } from "@/lib/types";
import {
  getAiMessages,
  saveAiMessages,
  generateId,
  CHANNEL_LABELS,
  formatDateTime,
} from "@/lib/store";

interface Props {
  config: BusinessConfig;
  reservations: Reservation[];
  onRefresh: () => void;
}

export default function AiAssistantView({ config, reservations, onRefresh }: Props) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "activity" | "settings">("chat");
  const [geminiKey, setGeminiKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<"loading" | "configured" | "missing">("loading");
  const [savingKey, setSavingKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const checkApiKey = useCallback(async () => {
    try {
      const hasLocalStorage = typeof window !== "undefined" && !!(
        localStorage.getItem("gsheet_id") &&
        localStorage.getItem("gsheet_email") && 
        localStorage.getItem("gsheet_key")
      );
      
      if (hasLocalStorage) {
        const storedKey = localStorage.getItem("gsheet_key") || "";
        let encodedKey = "";
        try {
          const cleanKey = storedKey.trim().replace(/\r\n/g, "\n");
          encodedKey = btoa(cleanKey);
        } catch (e) {}
        
        const headers: Record<string, string> = {
          "x-gsheet-configured": "true",
          "x-gsheet-id": localStorage.getItem("gsheet_id") || "",
          "x-gsheet-email": localStorage.getItem("gsheet_email") || "",
          "x-gsheet-key": encodedKey,
        };
        
        const res = await fetch("/api/config/gemini-key", { headers });
        const data = await res.json();
        setKeyStatus(data.configured ? "configured" : "missing");
        return;
      }
    } catch (e) {
      console.error("Failed to check API key:", e);
    }
    setKeyStatus("missing");
  }, []);

  useEffect(() => {
    const init = async () => {
      setMessages(getAiMessages());
      await checkApiKey();
    };
    init();
  }, [checkApiKey]);

  const saveGeminiKey = async () => {
    if (!geminiKey || geminiKey.length < 20) return;
    setSavingKey(true);
    
    try {
      const hasLocalStorage = typeof window !== "undefined" && !!(
        localStorage.getItem("gsheet_id") &&
        localStorage.getItem("gsheet_email") && 
        localStorage.getItem("gsheet_key")
      );
      
      if (hasLocalStorage) {
        const storedKey = localStorage.getItem("gsheet_key") || "";
        let encodedKey = "";
        try {
          const cleanKey = storedKey.trim().replace(/\r\n/g, "\n");
          encodedKey = btoa(cleanKey);
        } catch (e) {}
        
        const headers: Record<string, string> = {
          "x-gsheet-configured": "true",
          "x-gsheet-id": localStorage.getItem("gsheet_id") || "",
          "x-gsheet-email": localStorage.getItem("gsheet_email") || "",
          "x-gsheet-key": encodedKey,
        };
        
        await fetch("/api/config/gemini-key", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ apiKey: geminiKey }),
        });
      }
      
      localStorage.setItem("gemini_api_key", geminiKey);
      setKeyStatus("configured");
    } catch (e) {
      console.error("Failed to save API key:", e);
    }
    
    setSavingKey(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: AiMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const todayRes = reservations.filter(
        (r) => new Date(r.dateTime).toDateString() === new Date().toDateString()
      );
      const pending = reservations.filter((r) => r.status === "in_attesa");
      const upcoming = reservations
        .filter((r) => new Date(r.dateTime) > new Date() && r.status !== "cancellata")
        .slice(0, 5);

      const systemPrompt = `Sei l'assistente AI per "${config.businessName || "la nostra attività"}", un ${config.businessType}.
Rispondi sempre in italiano, in modo cordiale e professionale.

Informazioni attuali:
- Prenotazioni oggi: ${todayRes.length}
- Prenotazioni in attesa: ${pending.length}
- Prossime prenotazioni: ${upcoming.map((r) => `${r.clientName} - ${new Date(r.dateTime).toLocaleDateString("it-IT")} ${new Date(r.dateTime).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })} - ${r.service}`).join("; ") || "Nessuna"}
- Orari: ${Object.entries(config.weekHours).filter(([, h]) => h.open).map(([d, h]) => `${d}: ${h.from}-${h.to}`).join(", ")}
- Servizi: ${config.services?.map((s) => `${s.name} (${s.duration}min, €${s.price})`).join(", ") || "Nessuno"}
- Staff: ${config.staff?.map((s) => s.name).join(", ") || "Nessuno"}

Puoi aiutare con: analisi prenotazioni, suggerimenti, statistiche, orari, servizi.`;

      const chatMessages = newMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const apiKey = localStorage.getItem("gemini_api_key");
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages, systemPrompt }),
      };
      
      if (apiKey) {
        fetchOptions.headers = { 
          ...fetchOptions.headers, 
          "x-gemini-api-key": apiKey 
        };
      }

      const res = await fetch("/api/gemini", fetchOptions);

      const data = await res.json();
      const aiResponse = data.success ? data.response : `Errore: ${data.error || "Impossibile contattare l'AI"}`;

      const aiMsg: AiMessage = {
        id: generateId(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      saveAiMessages(finalMessages);
    } catch {
      const errorMsg: AiMessage = {
        id: generateId(),
        role: "assistant",
        content: "Errore di connessione. Riprova più tardi.",
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMsg]);
    }

    setIsTyping(false);
  };

  const aiHandled = reservations.filter((r) => r.aiHandled);
  const channelActivity = aiHandled.reduce<Record<string, number>>((acc, r) => {
    acc[r.channel] = (acc[r.channel] || 0) + 1;
    return acc;
  }, {});

  const quickActions = [
    "Mostrami le prenotazioni di oggi",
    "Quante prenotazioni sono in attesa?",
    "Mostrami le statistiche",
    "Quali servizi offriamo?",
    "Quali sono gli orari di apertura?",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 108px)", gap: 0 }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🤖
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>
              Assistente AI
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: config.aiEnabled ? "#22c55e" : "#94a3b8",
                  display: "inline-block",
                }}
                className={config.aiEnabled ? "animate-pulse" : ""}
              />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {config.aiEnabled ? "Attivo — monitora tutti i canali" : "Disattivo"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "var(--surface-2)", padding: 4, borderRadius: 10 }}>
          {(["chat", "activity", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 14px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                background: activeTab === tab ? "var(--surface)" : "transparent",
                color: activeTab === tab ? "var(--text)" : "var(--text-muted)",
                boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none",
                transition: "all 0.15s",
              }}
            >
              {tab === "chat" ? "💬 Chat" : tab === "activity" ? "📊 Attività" : "⚙️ Config"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "0 4px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                  Assistente AI pronto
                </p>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
                  Chiedimi informazioni sulle prenotazioni, gli orari, i servizi o le statistiche
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => sendMessage(action)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 99,
                        fontSize: 13,
                        cursor: "pointer",
                        border: "1.5px solid var(--border)",
                        background: "var(--surface)",
                        color: "var(--text-secondary)",
                        transition: "all 0.15s",
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: 8,
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    🤖
                  </div>
                )}
                <div>
                  <div className={msg.role === "assistant" ? "ai-bubble" : "user-bubble"}>
                    {msg.content.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 4,
                      textAlign: msg.role === "user" ? "right" : "left",
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.channel && ` · ${CHANNEL_LABELS[msg.channel]?.icon}`}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  🤖
                </div>
                <div
                  className="ai-bubble"
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "12px 16px" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.7)",
                        display: "inline-block",
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "8px 0" }}>
              {quickActions.slice(0, 3).map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 99,
                    fontSize: 12,
                    cursor: "pointer",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "12px 0 0",
              borderTop: "1px solid var(--border)",
            }}
          >
            <input
              className="form-input"
              placeholder="Scrivi un messaggio all'assistente AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isTyping}
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              style={{ flexShrink: 0 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Prenotazioni gestite", value: aiHandled.length, icon: "📋", color: "var(--primary)" },
              { label: "Chiamate gestite", value: aiHandled.filter((r) => r.channel === "telefono").length, icon: "📞", color: "var(--success)" },
              { label: "Email gestite", value: aiHandled.filter((r) => r.channel === "email").length, icon: "✉️", color: "var(--info)" },
              { label: "SMS gestiti", value: aiHandled.filter((r) => r.channel === "sms").length, icon: "💬", color: "var(--warning)" },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <div style={{ fontSize: 24 }}>{stat.icon}</div>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
              Prenotazioni gestite dall&apos;AI
            </h3>
            {aiHandled.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nessuna prenotazione gestita dall&apos;AI ancora.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {aiHandled.map((r) => {
                  const { date, time } = formatDateTime(r.dateTime);
                  const channelConf = CHANNEL_LABELS[r.channel];
                  return (
                    <div
                      key={r.id}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 10,
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{r.clientName}</p>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {channelConf?.icon} {channelConf?.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                        {r.service} · {date} alle {time}
                      </p>
                      {r.aiTranscript && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                            lineHeight: 1.5,
                          }}
                        >
                          &ldquo;{r.aiTranscript}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: "var(--text)" }}>
              Configurazione Assistente AI
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: config.aiEnabled ? "rgba(102,126,234,0.08)" : "var(--surface-2)",
                  border: `1px solid ${config.aiEnabled ? "rgba(102,126,234,0.2)" : "var(--border)"}`,
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>
                    🤖 Assistente AI {config.aiEnabled ? "Attivo" : "Disattivo"}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                    {config.aiEnabled
                      ? "Risponde automaticamente a chiamate, email e SMS"
                      : "Attiva l&apos;AI per gestire automaticamente le prenotazioni"}
                  </p>
                </div>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: config.aiEnabled ? "#22c55e" : "#94a3b8",
                    display: "inline-block",
                  }}
                  className={config.aiEnabled ? "animate-pulse" : ""}
                />
              </div>

              {/* Channels */}
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
                  Canali monitorati
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { id: "telefono", label: "Telefono", icon: "📞", desc: "Risponde alle chiamate" },
                    { id: "email", label: "Email", icon: "✉️", desc: `Monitora ${config.email || "casella email"}` },
                    { id: "sms", label: "SMS", icon: "💬", desc: "Gestisce messaggi SMS" },
                    { id: "whatsapp", label: "WhatsApp", icon: "📱", desc: "Chat WhatsApp automatica" },
                  ].map((ch) => {
                    const active = config.aiLanguages.includes(ch.id);
                    return (
                      <div
                        key={ch.id}
                        style={{
                          padding: "14px 16px",
                          borderRadius: 10,
                          border: `1.5px solid ${active ? "rgba(102,126,234,0.3)" : "var(--border)"}`,
                          background: active ? "rgba(102,126,234,0.06)" : "var(--surface)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 18 }}>{ch.icon}</span>
                          <span style={{ fontWeight: 600, fontSize: 14, color: active ? "#667eea" : "var(--text)" }}>
                            {ch.label}
                          </span>
                          {active && (
                            <span
                              style={{
                                marginLeft: "auto",
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "#22c55e",
                                display: "inline-block",
                              }}
                              className="animate-pulse"
                            />
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{ch.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Personality */}
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                  Personalità
                </p>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                  }}
                >
                  {config.aiPersonality === "professionale" && "👔 Professionale e formale"}
                  {config.aiPersonality === "amichevole" && "😊 Amichevole e cordiale"}
                  {config.aiPersonality === "elegante" && "✨ Elegante e raffinato"}
                  {config.aiPersonality === "diretto" && "⚡ Diretto ed efficiente"}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Modifica nelle impostazioni generali
                </p>
              </div>

              {/* Gemini API Key */}
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                  🔑 Chiave API Gemini
                </p>
                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: 10,
                    background: keyStatus === "configured" ? "rgba(34,197,94,0.08)" : "var(--surface-2)",
                    border: `1px solid ${keyStatus === "configured" ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                  }}
                >
                  {keyStatus === "loading" ? (
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Caricamento...</p>
                  ) : keyStatus === "configured" ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#22c55e" }}>✓</span>
                        <span style={{ fontSize: 13, color: "var(--text)" }}>Chiave API configurata</span>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.removeItem("gemini_api_key");
                          setKeyStatus("missing");
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Rimuovi
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Inserisci la tua chiave API di Google AI per attivare l&apos;assistente.
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          className="form-input"
                          type="password"
                          placeholder="Inserisci chiave API (es. AIza...)"
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={saveGeminiKey}
                          disabled={!geminiKey || geminiKey.length < 20 || savingKey}
                        >
                          {savingKey ? "Salvo..." : "Salva"}
                        </button>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Ottieni una chiave gratuita su{" "}
                        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>
                          Google AI Studio
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fiduciary contract */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: "rgba(102,126,234,0.06)",
                  border: "1px solid rgba(102,126,234,0.15)",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: "#667eea", marginBottom: 6 }}>
                  🛡️ Mandato Fiduciario (Guard Contract)
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  L&apos;assistente AI opera con mandato fiduciario vincolante. Agisce esclusivamente
                  nell&apos;interesse dell&apos;attività e dei clienti, garantendo riservatezza, correttezza
                  e trasparenza nel trattamento dei dati personali, in conformità al GDPR (Reg. UE 2016/679).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
