"use client";

import { useState } from "react";
import type { BusinessConfig, ServiceItem, StaffMember, TurnoConfig, TableConfig, TableZone } from "@/lib/types";
import {
  saveConfig,
  DAYS_IT,
  DAYS_LABELS,
  DEFAULT_SERVICES,
  DEFAULT_TURNI,
  DEFAULT_TABLES,
  DEFAULT_TABLE_ZONES,
  generateId,
} from "@/lib/store";
import ApiIntegrations from "@/components/ApiIntegrations";
import GoogleSheetsDb from "@/components/GoogleSheetsDb";

interface Props {
  config: BusinessConfig;
  onSave: () => void;
  onGoToSetup: () => void;
}

type SettingsTab = "generale" | "orari" | "turni" | "tavoli" | "servizi" | "staff" | "notifiche" | "sicurezza" | "api";

export default function SettingsView({ config, onSave, onGoToSetup }: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("generale");
  const [localConfig, setLocalConfig] = useState<BusinessConfig>({ ...config });
  const [saved, setSaved] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");

  const update = (updates: Partial<BusinessConfig>) => {
    setLocalConfig((prev) => ({ ...prev, ...updates }));
    setSaved(false);
  };

  const handleSave = () => {
    saveConfig(localConfig);
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: "generale", label: "Generale", icon: "🏢" },
    { id: "orari", label: "Orari", icon: "🕐" },
    ...(localConfig.businessType === "ristorante"
      ? [
          { id: "turni" as SettingsTab, label: "Turni", icon: "⏰" },
          { id: "tavoli" as SettingsTab, label: "Tavoli", icon: "🪑" },
        ]
      : []),
    { id: "servizi", label: "Servizi", icon: "📋" },
    ...(localConfig.businessType !== "ristorante"
      ? [{ id: "staff" as SettingsTab, label: "Staff", icon: "👥" }]
      : []),
    { id: "notifiche", label: "Notifiche", icon: "🔔" },
    { id: "api", label: "API & Integrazioni", icon: "🔗" },
    { id: "sicurezza", label: "Sicurezza", icon: "🔒" },
  ];

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* Sidebar tabs */}
      <div style={{ width: 200, flexShrink: 0 }}>
        <div className="card" style={{ padding: 8 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                width: "100%",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 600 : 400,
                background: activeTab === tab.id ? "var(--primary-muted)" : "transparent",
                color: activeTab === tab.id ? "var(--primary)" : "var(--text-secondary)",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="card" style={{ padding: 28 }}>
          {/* Save bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
              {tabs.find((t) => t.id === activeTab)?.icon}{" "}
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {saved && (
                <span
                  className="badge badge-success animate-fade-in"
                  style={{ fontSize: 13 }}
                >
                  ✓ Salvato
                </span>
              )}
              <button className="btn btn-primary" onClick={handleSave}>
                💾 Salva modifiche
              </button>
            </div>
          </div>

          {/* ── GENERALE ─────────────────────────────────────────── */}
          {activeTab === "generale" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="form-label">Nome attività</label>
                  <input
                    className="form-input"
                    value={localConfig.businessName}
                    onChange={(e) => update({ businessName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Tipo attività</label>
                  <select
                    className="form-input"
                    value={localConfig.businessType}
                    onChange={(e) =>
                      update({
                        businessType: e.target.value as BusinessConfig["businessType"],
                        services: DEFAULT_SERVICES[e.target.value as BusinessConfig["businessType"]],
                      })
                    }
                  >
                    <option value="parrucchiere">💇 Parrucchiere</option>
                    <option value="estetista">💅 Estetista</option>
                    <option value="ristorante">🍽️ Ristorante</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Indirizzo</label>
                <input
                  className="form-input"
                  value={localConfig.address}
                  onChange={(e) => update({ address: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="form-label">Telefono</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={localConfig.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    value={localConfig.email}
                    onChange={(e) => update({ email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Sito web</label>
                <input
                  className="form-input"
                  type="url"
                  value={localConfig.website || ""}
                  onChange={(e) => update({ website: e.target.value })}
                />
              </div>

              {localConfig.businessType === "ristorante" && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background: "var(--restaurant-bg)",
                    border: "1px solid rgba(234,88,12,0.15)",
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--restaurant)", marginBottom: 12 }}>
                    🍽️ Configurazione Ristorante
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label className="form-label">Coperti massimi</label>
                      <input
                        className="form-input"
                        type="number"
                        min={1}
                        value={localConfig.maxCovers || ""}
                        onChange={(e) => update({ maxCovers: parseInt(e.target.value) || 40 })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Numero tavoli</label>
                      <input
                        className="form-input"
                        type="number"
                        min={1}
                        value={localConfig.tableCount || ""}
                        onChange={(e) => update({ tableCount: parseInt(e.target.value) || 10 })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AI settings */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: "rgba(102,126,234,0.06)",
                  border: "1px solid rgba(102,126,234,0.15)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#667eea" }}>🤖 Assistente AI</p>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={localConfig.aiEnabled}
                      onChange={(e) => update({ aiEnabled: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                {localConfig.aiEnabled && (
                  <div>
                    <label className="form-label">Personalità</label>
                    <select
                      className="form-input"
                      value={localConfig.aiPersonality}
                      onChange={(e) => update({ aiPersonality: e.target.value })}
                    >
                      <option value="professionale">👔 Professionale e formale</option>
                      <option value="amichevole">😊 Amichevole e cordiale</option>
                      <option value="elegante">✨ Elegante e raffinato</option>
                      <option value="diretto">⚡ Diretto ed efficiente</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ORARI ────────────────────────────────────────────── */}
          {activeTab === "orari" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DAYS_IT.map((day) => {
                const hours = localConfig.weekHours[day];
                return (
                  <div
                    key={day}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: hours.open ? "var(--surface-2)" : "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <label className="toggle" style={{ flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={hours.open}
                        onChange={(e) =>
                          update({
                            weekHours: {
                              ...localConfig.weekHours,
                              [day]: { ...hours, open: e.target.checked },
                            },
                          })
                        }
                      />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ width: 90, fontSize: 14, fontWeight: 500, color: hours.open ? "var(--text)" : "var(--text-muted)" }}>
                      {DAYS_LABELS[day]}
                    </span>
                    {hours.open ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                        <input
                          type="time"
                          className="form-input"
                          value={hours.from}
                          onChange={(e) =>
                            update({
                              weekHours: {
                                ...localConfig.weekHours,
                                [day]: { ...hours, from: e.target.value },
                              },
                            })
                          }
                          style={{ padding: "8px 12px", fontSize: 14 }}
                        />
                        <span style={{ color: "var(--text-muted)" }}>–</span>
                        <input
                          type="time"
                          className="form-input"
                          value={hours.to}
                          onChange={(e) =>
                            update({
                              weekHours: {
                                ...localConfig.weekHours,
                                [day]: { ...hours, to: e.target.value },
                              },
                            })
                          }
                          style={{ padding: "8px 12px", fontSize: 14 }}
                        />
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>Chiuso</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── TURNI (ristorante) ─────────────────────────────── */}
          {activeTab === "turni" && localConfig.businessType === "ristorante" && (
            <TurniEditor
              turni={localConfig.turni || []}
              onChange={(turni) => update({ turni })}
            />
          )}

          {/* ── TAVOLI (ristorante) ─────────────────────────────── */}
          {activeTab === "tavoli" && localConfig.businessType === "ristorante" && (
            <TavoliEditor
              tables={localConfig.tables || []}
              zones={localConfig.tableZones || []}
              onChange={(tables, zones) => update({ tables, tableZones: zones })}
            />
          )}

          {/* ── SERVIZI ──────────────────────────────────────────── */}
          {activeTab === "servizi" && (
            <ServicesEditor
              services={localConfig.services || []}
              businessType={localConfig.businessType}
              onChange={(services) => update({ services })}
            />
          )}

          {/* ── STAFF ────────────────────────────────────────────── */}
          {activeTab === "staff" && localConfig.businessType !== "ristorante" && (
            <StaffEditor
              staff={localConfig.staff || []}
              onChange={(staff) => update({ staff })}
            />
          )}

          {/* ── NOTIFICHE ────────────────────────────────────────── */}
          {activeTab === "notifiche" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                    padding: "16px 20px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                      {n.icon} {n.label}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{n.desc}</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={localConfig[n.key as keyof BusinessConfig] as boolean}
                      onChange={(e) => update({ [n.key]: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* ── API & INTEGRAZIONI ─────────────────────────────────── */}
          {activeTab === "api" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <ApiIntegrations 
                config={localConfig} 
                onSave={(updatedConfig) => {
                  setLocalConfig(updatedConfig);
                  handleSave();
                }}
              />
              <GoogleSheetsDb />
            </div>
          )}

          {/* ── SICUREZZA ────────────────────────────────────────── */}
          {activeTab === "sicurezza" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label className="form-label">Email amministratore</label>
                <input
                  className="form-input"
                  type="email"
                  value={localConfig.adminEmail}
                  onChange={(e) => update({ adminEmail: e.target.value })}
                />
              </div>

              <div
                style={{
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
                  🔑 Cambia PIN di accesso
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="form-label">Nuovo PIN</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="Min. 4 cifre"
                      value={newPin}
                      onChange={(e) => { setNewPin(e.target.value); setPinError(""); }}
                      maxLength={8}
                      style={{ textAlign: "center", letterSpacing: "0.3em", fontSize: 18 }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Conferma PIN</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="Ripeti PIN"
                      value={confirmPin}
                      onChange={(e) => { setConfirmPin(e.target.value); setPinError(""); }}
                      maxLength={8}
                      style={{ textAlign: "center", letterSpacing: "0.3em", fontSize: 18 }}
                    />
                  </div>
                </div>
                {pinError && (
                  <p style={{ color: "var(--error)", fontSize: 13, marginTop: 8 }}>{pinError}</p>
                )}
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: 12 }}
                  disabled={newPin.length < 4}
                  onClick={() => {
                    if (newPin !== confirmPin) {
                      setPinError("I PIN non corrispondono");
                      return;
                    }
                    update({ adminPin: newPin });
                    setNewPin("");
                    setConfirmPin("");
                    setPinError("");
                  }}
                >
                  Aggiorna PIN
                </button>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: "var(--error-bg)",
                  border: "1px solid var(--error-border)",
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--error)", marginBottom: 8 }}>
                  ⚠️ Zona pericolosa
                </p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                  Riconfigura l&apos;attività dall&apos;inizio. Tutti i dati di configurazione verranno resettati.
                </p>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (confirm("Sei sicuro? Verranno resettate tutte le impostazioni.")) {
                      onGoToSetup();
                    }
                  }}
                >
                  Riconfigura attività
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Services Editor ───────────────────────────────────────────
function ServicesEditor({
  services,
  businessType,
  onChange,
}: {
  services: ServiceItem[];
  businessType: BusinessConfig["businessType"];
  onChange: (s: ServiceItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newService, setNewService] = useState<Partial<ServiceItem>>({});
  const [showAdd, setShowAdd] = useState(false);

  const categories = [...new Set(services.map((s) => s.category))];

  const addService = () => {
    if (!newService.name || !newService.duration) return;
    const service: ServiceItem = {
      id: generateId(),
      name: newService.name,
      duration: newService.duration || 60,
      price: newService.price || 0,
      category: newService.category || "Generale",
    };
    onChange([...services, service]);
    setNewService({});
    setShowAdd(false);
  };

  const removeService = (id: string) => {
    onChange(services.filter((s) => s.id !== id));
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    onChange(services.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          {services.length} servizi configurati
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              onChange(DEFAULT_SERVICES[businessType]);
            }}
          >
            ↺ Ripristina default
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAdd(true)}
          >
            + Aggiungi servizio
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div
          className="card animate-fade-in"
          style={{
            padding: 16,
            marginBottom: 16,
            border: "2px solid var(--primary)",
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", marginBottom: 12 }}>
            Nuovo servizio
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <input
              className="form-input"
              placeholder="Nome servizio"
              value={newService.name || ""}
              onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              className="form-input"
              type="number"
              placeholder="Durata (min)"
              value={newService.duration || ""}
              onChange={(e) => setNewService((p) => ({ ...p, duration: parseInt(e.target.value) }))}
            />
            <input
              className="form-input"
              type="number"
              placeholder="Prezzo (€)"
              value={newService.price || ""}
              onChange={(e) => setNewService((p) => ({ ...p, price: parseFloat(e.target.value) }))}
            />
            <input
              className="form-input"
              placeholder="Categoria"
              value={newService.category || ""}
              onChange={(e) => setNewService((p) => ({ ...p, category: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={addService} disabled={!newService.name}>
              Aggiungi
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowAdd(false); setNewService({}); }}>
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Services by category */}
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            {cat}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {services
              .filter((s) => s.category === cat)
              .map((service) => (
                <div
                  key={service.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: editingId === service.id ? "var(--primary-muted)" : "var(--surface-2)",
                  }}
                >
                  {editingId === service.id ? (
                    <>
                      <input
                        className="form-input"
                        value={service.name}
                        onChange={(e) => updateService(service.id, { name: e.target.value })}
                        style={{ flex: 2, padding: "6px 10px", fontSize: 13 }}
                      />
                      <input
                        className="form-input"
                        type="number"
                        value={service.duration}
                        onChange={(e) => updateService(service.id, { duration: parseInt(e.target.value) })}
                        style={{ width: 80, padding: "6px 10px", fontSize: 13 }}
                      />
                      <input
                        className="form-input"
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(service.id, { price: parseFloat(e.target.value) })}
                        style={{ width: 80, padding: "6px 10px", fontSize: 13 }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => setEditingId(null)}>✓</button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
                        {service.name}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {service.duration} min
                      </span>
                      {service.price > 0 && (
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>
                          €{service.price}
                        </span>
                      )}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingId(service.id)}
                        style={{ padding: "4px 8px" }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeService(service.id)}
                        style={{ padding: "4px 8px", color: "var(--error)" }}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Staff Editor ──────────────────────────────────────────────
const STAFF_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];

function StaffEditor({
  staff,
  onChange,
}: {
  staff: StaffMember[];
  onChange: (s: StaffMember[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState<Partial<StaffMember>>({ color: STAFF_COLORS[0] });

  const addMember = () => {
    if (!newMember.name) return;
    const member: StaffMember = {
      id: generateId(),
      name: newMember.name,
      role: newMember.role || "Operatore",
      color: newMember.color || STAFF_COLORS[0],
    };
    onChange([...staff, member]);
    setNewMember({ color: STAFF_COLORS[0] });
    setShowAdd(false);
  };

  const removeMember = (id: string) => {
    onChange(staff.filter((s) => s.id !== id));
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          {staff.length} membri dello staff
        </p>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          + Aggiungi membro
        </button>
      </div>

      {showAdd && (
        <div
          className="card animate-fade-in"
          style={{ padding: 16, marginBottom: 16, border: "2px solid var(--primary)" }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", marginBottom: 12 }}>
            Nuovo membro
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 12 }}>
            <input
              className="form-input"
              placeholder="Nome e cognome"
              value={newMember.name || ""}
              onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              className="form-input"
              placeholder="Ruolo (es. Stilista)"
              value={newMember.role || ""}
              onChange={(e) => setNewMember((p) => ({ ...p, role: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {STAFF_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setNewMember((p) => ({ ...p, color }))}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: color,
                  border: newMember.color === color ? "3px solid var(--text)" : "3px solid transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={addMember} disabled={!newMember.name}>
              Aggiungi
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowAdd(false); setNewMember({ color: STAFF_COLORS[0] }); }}>
              Annulla
            </button>
          </div>
        </div>
      )}

      {staff.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
          <p style={{ fontSize: 14 }}>Nessun membro dello staff. Aggiungine uno!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {staff.map((member) => (
            <div
              key={member.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: member.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{member.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{member.role}</p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => removeMember(member.id)}
                style={{ color: "var(--error)", padding: "4px 8px" }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Turni Editor (Restaurant Shifts) ──────────────────────────
const TURNI_COLORS = ["#f59e0b", "#8b5cf6", "#ec4899", "#10b981", "#ef4444", "#3b82f6"];

function TurniEditor({
  turni,
  onChange,
}: {
  turni: TurnoConfig[];
  onChange: (t: TurnoConfig[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTurno, setNewTurno] = useState<Partial<TurnoConfig>>({
    name: "",
    from: "12:00",
    to: "15:00",
    maxCovers: 30,
    maxTables: 8,
    lastOrderMinutes: 30,
    bufferMinutes: 30,
    active: true,
    color: TURNI_COLORS[0],
    days: [...DAYS_IT],
  });

  const addTurno = () => {
    if (!newTurno.name) return;
    const turno: TurnoConfig = {
      id: generateId(),
      name: newTurno.name,
      from: newTurno.from || "12:00",
      to: newTurno.to || "15:00",
      maxCovers: newTurno.maxCovers || 30,
      maxTables: newTurno.maxTables || 8,
      lastOrderMinutes: newTurno.lastOrderMinutes || 30,
      bufferMinutes: newTurno.bufferMinutes || 30,
      active: true,
      color: newTurno.color || TURNI_COLORS[0],
      days: newTurno.days || [...DAYS_IT],
    };
    onChange([...turni, turno]);
    setNewTurno({
      name: "",
      from: "12:00",
      to: "15:00",
      maxCovers: 30,
      maxTables: 8,
      lastOrderMinutes: 30,
      bufferMinutes: 30,
      active: true,
      color: TURNI_COLORS[turni.length % TURNI_COLORS.length],
      days: [...DAYS_IT],
    });
    setShowAdd(false);
  };

  const removeTurno = (id: string) => onChange(turni.filter((t) => t.id !== id));
  const updateTurno = (id: string, updates: Partial<TurnoConfig>) =>
    onChange(turni.map((t) => (t.id === id ? { ...t, ...updates } : t)));

  const toggleDay = (turnoId: string, day: string) => {
    const turno = turni.find((t) => t.id === turnoId);
    if (!turno) return;
    const days = turno.days.includes(day) ? turno.days.filter((d) => d !== day) : [...turno.days, day];
    updateTurno(turnoId, { days });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{turni.length} turni configurati</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            Gestisci pranzo, cena e altri turni con capacità e giorni dedicati
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {turni.length === 0 && (
            <button className="btn btn-secondary btn-sm" onClick={() => onChange([...DEFAULT_TURNI])}>
              ↺ Ripristina default
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Aggiungi turno</button>
        </div>
      </div>

      {showAdd && (
        <div className="card animate-fade-in" style={{ padding: 16, marginBottom: 16, border: "2px solid var(--primary)" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", marginBottom: 12 }}>Nuovo turno</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label className="form-label">Nome turno</label>
              <input className="form-input" placeholder="es. Pranzo, Cena, Brunch" value={newTurno.name || ""} onChange={(e) => setNewTurno((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Ora inizio</label>
              <input className="form-input" type="time" value={newTurno.from || "12:00"} onChange={(e) => setNewTurno((p) => ({ ...p, from: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Ora fine</label>
              <input className="form-input" type="time" value={newTurno.to || "15:00"} onChange={(e) => setNewTurno((p) => ({ ...p, to: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label className="form-label">Max coperti</label>
              <input className="form-input" type="number" min={1} value={newTurno.maxCovers || 30} onChange={(e) => setNewTurno((p) => ({ ...p, maxCovers: parseInt(e.target.value) || 30 }))} />
            </div>
            <div>
              <label className="form-label">Max tavoli</label>
              <input className="form-input" type="number" min={1} value={newTurno.maxTables || 8} onChange={(e) => setNewTurno((p) => ({ ...p, maxTables: parseInt(e.target.value) || 8 }))} />
            </div>
            <div>
              <label className="form-label">Buffer (min)</label>
              <input className="form-input" type="number" min={0} value={newTurno.bufferMinutes || 30} onChange={(e) => setNewTurno((p) => ({ ...p, bufferMinutes: parseInt(e.target.value) || 30 }))} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Giorni attivi</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DAYS_IT.map((day) => (
                <button key={day} onClick={() => {
                  const days = newTurno.days?.includes(day) ? newTurno.days.filter((d) => d !== day) : [...(newTurno.days || []), day];
                  setNewTurno((p) => ({ ...p, days }));
                }} style={{
                  padding: "4px 10px", borderRadius: 6, border: "1px solid",
                  borderColor: newTurno.days?.includes(day) ? "var(--primary)" : "var(--border)",
                  background: newTurno.days?.includes(day) ? "var(--primary-muted)" : "var(--surface)",
                  color: newTurno.days?.includes(day) ? "var(--primary)" : "var(--text-muted)",
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}>
                  {DAYS_LABELS[day].slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={addTurno} disabled={!newTurno.name}>Aggiungi</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Annulla</button>
          </div>
        </div>
      )}

      {/* Turni list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {turni.map((turno) => (
          <div key={turno.id} style={{
            padding: "16px 20px", borderRadius: 12,
            border: `2px solid ${turno.active ? turno.color : "var(--border)"}`,
            background: turno.active ? `${turno.color}08` : "var(--surface)",
            opacity: turno.active ? 1 : 0.6,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: turno.color }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{turno.name}</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{turno.from} – {turno.to}</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => updateTurno(turno.id, { active: !turno.active })} style={{ fontSize: 12 }}>
                  {turno.active ? "🟢 Attivo" : "⚫ Disattivo"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(editingId === turno.id ? null : turno.id)} style={{ padding: "4px 8px" }}>✏️</button>
                <button className="btn btn-ghost btn-sm" onClick={() => removeTurno(turno.id)} style={{ padding: "4px 8px", color: "var(--error)" }}>🗑️</button>
              </div>
            </div>

            {editingId === turno.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>Nome</label>
                    <input className="form-input" value={turno.name} onChange={(e) => updateTurno(turno.id, { name: e.target.value })} style={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>Da</label>
                    <input className="form-input" type="time" value={turno.from} onChange={(e) => updateTurno(turno.id, { from: e.target.value })} style={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>A</label>
                    <input className="form-input" type="time" value={turno.to} onChange={(e) => updateTurno(turno.id, { to: e.target.value })} style={{ fontSize: 13 }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>Max coperti</label>
                    <input className="form-input" type="number" value={turno.maxCovers} onChange={(e) => updateTurno(turno.id, { maxCovers: parseInt(e.target.value) || 0 })} style={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>Max tavoli</label>
                    <input className="form-input" type="number" value={turno.maxTables} onChange={(e) => updateTurno(turno.id, { maxTables: parseInt(e.target.value) || 0 })} style={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>Ultimo ordine (min)</label>
                    <input className="form-input" type="number" value={turno.lastOrderMinutes} onChange={(e) => updateTurno(turno.id, { lastOrderMinutes: parseInt(e.target.value) || 0 })} style={{ fontSize: 13 }} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>Buffer (min)</label>
                    <input className="form-input" type="number" value={turno.bufferMinutes} onChange={(e) => updateTurno(turno.id, { bufferMinutes: parseInt(e.target.value) || 0 })} style={{ fontSize: 13 }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DAYS_IT.map((day) => (
                    <button key={day} onClick={() => toggleDay(turno.id, day)} style={{
                      padding: "3px 8px", borderRadius: 5, border: "1px solid",
                      borderColor: turno.days.includes(day) ? turno.color : "var(--border)",
                      background: turno.days.includes(day) ? `${turno.color}15` : "var(--surface)",
                      color: turno.days.includes(day) ? turno.color : "var(--text-muted)",
                      fontSize: 11, fontWeight: 500, cursor: "pointer",
                    }}>
                      {DAYS_LABELS[day].slice(0, 3)}
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setEditingId(null)} style={{ alignSelf: "flex-start" }}>✓ Conferma</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--text-secondary)" }}>
                <span>🪑 {turno.maxCovers} coperti max</span>
                <span>📋 {turno.maxTables} tavoli max</span>
                {turno.lastOrderMinutes > 0 && <span>⏱️ Ultimo ordine: {turno.lastOrderMinutes} min</span>}
                {turno.bufferMinutes > 0 && <span>⏸️ Buffer: {turno.bufferMinutes} min</span>}
                <span>📅 {turno.days.length === 7 ? "Tutti i giorni" : turno.days.map((d) => DAYS_LABELS[d].slice(0, 3)).join(", ")}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tavoli Editor (Table Management) ──────────────────────────
function TavoliEditor({
  tables,
  zones,
  onChange,
}: {
  tables: TableConfig[];
  zones: TableZone[];
  onChange: (tables: TableConfig[], zones: TableZone[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showZoneAdd, setShowZoneAdd] = useState(false);
  const [newTable, setNewTable] = useState<Partial<TableConfig>>({ seats: 4, minSeats: 2, zone: "interno", isCombinable: true, isActive: true });
  const [newZone, setNewZone] = useState<Partial<TableZone>>({ name: "", color: "#3b82f6", isOutdoor: false });
  const [editingId, setEditingId] = useState<string | null>(null);

  const addTable = () => {
    const table: TableConfig = {
      id: generateId(),
      number: newTable.number || tables.length + 1,
      name: newTable.name,
      seats: newTable.seats || 4,
      minSeats: newTable.minSeats || 1,
      zone: newTable.zone || "interno",
      isCombinable: newTable.isCombinable ?? true,
      isActive: true,
      notes: newTable.notes,
    };
    onChange([...tables, table], zones);
    setNewTable({ seats: 4, minSeats: 2, zone: "interno", isCombinable: true, isActive: true });
    setShowAdd(false);
  };

  const addZone = () => {
    if (!newZone.name) return;
    const zone: TableZone = { id: generateId(), name: newZone.name, color: newZone.color || "#3b82f6", isOutdoor: newZone.isOutdoor || false };
    onChange(tables, [...zones, zone]);
    setNewZone({ name: "", color: "#3b82f6", isOutdoor: false });
    setShowZoneAdd(false);
  };

  const removeTable = (id: string) => onChange(tables.filter((t) => t.id !== id), zones);
  const updateTable = (id: string, updates: Partial<TableConfig>) =>
    onChange(tables.map((t) => (t.id === id ? { ...t, ...updates } : t)), zones);
  const removeZone = (id: string) => onChange(tables, zones.filter((z) => z.id !== id));

  const activeZones = zones.length > 0 ? zones : DEFAULT_TABLE_ZONES;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {tables.filter((t) => t.isActive).length} tavoli attivi in {activeZones.length} zone
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {tables.length === 0 && (
            <button className="btn btn-secondary btn-sm" onClick={() => onChange(DEFAULT_TABLES, DEFAULT_TABLE_ZONES)}>↺ Ripristina default</button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setShowZoneAdd(true)}>+ Zona</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Tavolo</button>
        </div>
      </div>

      {showZoneAdd && (
        <div className="card animate-fade-in" style={{ padding: 16, marginBottom: 16, border: "2px solid var(--primary)" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", marginBottom: 12 }}>Nuova zona</p>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <input className="form-input" placeholder="Nome zona (es. Terrazza, VIP)" value={newZone.name || ""} onChange={(e) => setNewZone((p) => ({ ...p, name: e.target.value }))} />
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Colore</label>
              <input type="color" value={newZone.color || "#3b82f6"} onChange={(e) => setNewZone((p) => ({ ...p, color: e.target.value }))} style={{ width: "100%", height: 38, border: "none", borderRadius: 6, cursor: "pointer" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label className="toggle">
                <input type="checkbox" checked={newZone.isOutdoor || false} onChange={(e) => setNewZone((p) => ({ ...p, isOutdoor: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 13 }}>Esterno</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={addZone} disabled={!newZone.name}>Aggiungi</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowZoneAdd(false)}>Annulla</button>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="card animate-fade-in" style={{ padding: 16, marginBottom: 16, border: "2px solid var(--primary)" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", marginBottom: 12 }}>Nuovo tavolo</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Numero</label>
              <input className="form-input" type="number" min={1} value={newTable.number || tables.length + 1} onChange={(e) => setNewTable((p) => ({ ...p, number: parseInt(e.target.value) }))} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Posti</label>
              <input className="form-input" type="number" min={1} value={newTable.seats || 4} onChange={(e) => setNewTable((p) => ({ ...p, seats: parseInt(e.target.value) }))} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Min. posti</label>
              <input className="form-input" type="number" min={1} value={newTable.minSeats || 1} onChange={(e) => setNewTable((p) => ({ ...p, minSeats: parseInt(e.target.value) }))} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Zona</label>
              <select className="form-input" value={newTable.zone || "interno"} onChange={(e) => setNewTable((p) => ({ ...p, zone: e.target.value }))}>
                {activeZones.map((z) => <option key={z.id} value={z.name.toLowerCase()}>{z.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Nome opzionale</label>
              <input className="form-input" placeholder="es. Tavolo Rosso" value={newTable.name || ""} onChange={(e) => setNewTable((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 11 }}>Note</label>
              <input className="form-input" placeholder="es. Vista mare" value={newTable.notes || ""} onChange={(e) => setNewTable((p) => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={addTable}>Aggiungi</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Annulla</button>
          </div>
        </div>
      )}

      {/* Zone tags */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {activeZones.map((zone) => {
          const count = tables.filter((t) => t.zone.toLowerCase() === zone.name.toLowerCase()).length;
          return (
            <div key={zone.id} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${zone.color}40`, background: `${zone.color}08`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: zone.color }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{zone.name}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{count} tavoli</span>
              {zone.isOutdoor && <span style={{ fontSize: 11 }}>🌿</span>}
              <button className="btn btn-ghost btn-sm" onClick={() => removeZone(zone.id)} style={{ padding: "2px 4px", fontSize: 10, color: "var(--error)" }}>✕</button>
            </div>
          );
        })}
      </div>

      {/* Tables by zone */}
      {activeZones.map((zone) => {
        const zoneTables = tables.filter((t) => t.zone.toLowerCase() === zone.name.toLowerCase());
        if (zoneTables.length === 0) return null;
        return (
          <div key={zone.id} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: zone.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              {zone.name} {zone.isOutdoor ? "🌿" : ""}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
              {zoneTables.map((table) => (
                <div key={table.id} onClick={() => setEditingId(editingId === table.id ? null : table.id)} style={{
                  padding: "10px 12px", borderRadius: 10,
                  border: `1.5px solid ${table.isActive ? zone.color + "40" : "var(--border)"}`,
                  background: table.isActive ? "var(--surface-2)" : "var(--surface)",
                  opacity: table.isActive ? 1 : 0.5, cursor: "pointer",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>#{table.number}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{table.seats} 👤</span>
                  </div>
                  {table.name && <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{table.name}</p>}
                  {table.notes && <p style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>{table.notes}</p>}
                  {editingId === table.id && (
                    <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); updateTable(table.id, { isActive: !table.isActive }); }} style={{ padding: "2px 6px", fontSize: 11 }}>
                        {table.isActive ? "🟢" : "⚫"}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); removeTable(table.id); }} style={{ padding: "2px 6px", fontSize: 11, color: "var(--error)" }}>🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {tables.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
          <p style={{ fontSize: 14 }}>Nessun tavolo configurato.</p>
        </div>
      )}
    </div>
  );
}
