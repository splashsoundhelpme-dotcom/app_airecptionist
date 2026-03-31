"use client";

import { useState } from "react";
import type { Client, BusinessConfig, Reservation } from "@/lib/types";
import { getClients, saveClients, generateId, LOYALTY_TIERS, formatDateTime } from "@/lib/store";

interface Props {
  config: BusinessConfig;
  reservations: Reservation[];
}

type SortBy = "name" | "visits" | "spending" | "lastVisit";
type TierFilter = "all" | "bronzo" | "argento" | "oro" | "platino";

const TIER_COLORS: Record<string, string> = {
  bronzo: "#cd7f32",
  argento: "#c0c0c0",
  oro: "#ffd700",
  platino: "#e5e4e2",
};

const TIER_BG: Record<string, string> = {
  bronzo: "rgba(205,127,50,0.12)",
  argento: "rgba(192,192,192,0.15)",
  oro: "rgba(255,215,0,0.12)",
  platino: "rgba(229,228,226,0.18)",
};

export default function ClientsView({ config, reservations }: Props) {
  const [clients, setClients] = useState<Client[]>(() => getClients());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [newTag, setNewTag] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    notes: "",
    tags: "",
  });

  const refreshClients = () => {
    setClients(getClients());
  };

  const filtered = clients
    .filter((c) => {
      if (!c.isActive) return false;
      if (tierFilter !== "all" && c.loyaltyTier !== tierFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        return (
          fullName.includes(q) ||
          c.phone.includes(q) ||
          (c.email || "").toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      if (sortBy === "visits") return b.totalVisits - a.totalVisits;
      if (sortBy === "spending") return b.totalSpent - a.totalSpent;
      if (sortBy === "lastVisit") {
        const da = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
        const db = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
        return db - da;
      }
      return 0;
    });

  const handleAddClient = () => {
    if (!form.firstName.trim() || !form.phone.trim()) return;
    const newClient: Client = {
      id: generateId(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      notes: form.notes.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      totalVisits: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      loyaltyPoints: 0,
      loyaltyTier: "bronzo",
      isActive: true,
      notifyEmail: false,
      notifySms: false,
      notifyWhatsapp: false,
      marketingConsent: false,
    };
    const updated = [...clients, newClient];
    saveClients(updated);
    setClients(updated);
    setForm({ firstName: "", lastName: "", phone: "", email: "", notes: "", tags: "" });
    setShowAddForm(false);
  };

  const handleSaveNotes = (clientId: string) => {
    const updated = clients.map((c) => (c.id === clientId ? { ...c, notes: editNotes } : c));
    saveClients(updated);
    setClients(updated);
    setSelectedClient((prev) => (prev && prev.id === clientId ? { ...prev, notes: editNotes } : prev));
  };

  const handleAddTag = (clientId: string) => {
    if (!newTag.trim()) return;
    const updated = clients.map((c) => {
      if (c.id === clientId && !c.tags.includes(newTag.trim())) {
        return { ...c, tags: [...c.tags, newTag.trim()] };
      }
      return c;
    });
    saveClients(updated);
    setClients(updated);
    setSelectedClient((prev) => {
      if (prev && prev.id === clientId && !prev.tags.includes(newTag.trim())) {
        return { ...prev, tags: [...prev.tags, newTag.trim()] };
      }
      return prev;
    });
    setNewTag("");
  };

  const handleRemoveTag = (clientId: string, tag: string) => {
    const updated = clients.map((c) => {
      if (c.id === clientId) {
        return { ...c, tags: c.tags.filter((t) => t !== tag) };
      }
      return c;
    });
    saveClients(updated);
    setClients(updated);
    setSelectedClient((prev) => {
      if (prev && prev.id === clientId) {
        return { ...prev, tags: prev.tags.filter((t) => t !== tag) };
      }
      return prev;
    });
  };

  const getClientReservations = (client: Client): Reservation[] => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    return reservations
      .filter((r) => {
        const matchName = r.clientName.toLowerCase() === fullName;
        const matchId = r.clientId === client.id;
        return matchId || matchName;
      })
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  };

  const getInitials = (client: Client): string => {
    return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 108px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          className="card"
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="form-input"
              placeholder="Cerca nome, telefono, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34, fontSize: 13 }}
            />
          </div>

          <select
            className="form-input"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as TierFilter)}
            style={{ width: "auto", fontSize: 13, padding: "8px 12px" }}
          >
            <option value="all">Tutti i tier</option>
            <option value="bronzo">🥉 Bronzo</option>
            <option value="argento">🥈 Argento</option>
            <option value="oro">🥇 Oro</option>
            <option value="platino">💎 Platino</option>
          </select>

          <select
            className="form-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={{ width: "auto", fontSize: 13, padding: "8px 12px" }}
          >
            <option value="name">Ordina per nome</option>
            <option value="visits">Ordina per visite</option>
            <option value="spending">Ordina per spesa</option>
            <option value="lastVisit">Ordina per ultima visita</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuovo Cliente
          </button>
        </div>

        {showAddForm && (
          <div
            className="card"
            style={{ padding: 20, marginBottom: 16 }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "var(--text)" }}>Nuovo Cliente</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="form-label">Nome *</label>
                <input
                  className="form-input"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Mario"
                />
              </div>
              <div>
                <label className="form-label">Cognome *</label>
                <input
                  className="form-input"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Rossi"
                />
              </div>
              <div>
                <label className="form-label">Telefono *</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+39 333 123 4567"
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="mario@email.com"
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Note</label>
                <input
                  className="form-input"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Note sul cliente..."
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Tag (separati da virgola)</label>
                <input
                  className="form-input"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="VIP, abituale, allergie"
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-primary btn-sm" onClick={handleAddClient}>
                Salva Cliente
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>
                Annulla
              </button>
            </div>
          </div>
        )}

        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
          {filtered.length} client{filtered.length === 1 ? "e" : "i"}
          {search || tierFilter !== "all" ? " (filtrati)" : ""}
        </p>

        <div style={{ flex: 1, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, alignContent: "start" }}>
          {filtered.length === 0 ? (
            <div
              className="card"
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "40px 16px",
                color: "var(--text-muted)",
              }}
            >
              Nessun cliente trovato
            </div>
          ) : (
            filtered.map((c) => {
              const tier = LOYALTY_TIERS[c.loyaltyTier];
              const isSelected = selectedClient?.id === c.id;
              return (
                <div
                  key={c.id}
                  className="card"
                  onClick={() => {
                    setSelectedClient(isSelected ? null : c);
                    setEditNotes(c.notes || "");
                  }}
                  style={{
                    padding: 16,
                    cursor: "pointer",
                    border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                    transition: "border 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: TIER_BG[c.loyaltyTier],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        color: TIER_COLORS[c.loyaltyTier],
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(c)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.firstName} {c.lastName}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.phone}</p>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: TIER_BG[c.loyaltyTier],
                        color: TIER_COLORS[c.loyaltyTier],
                        border: `1px solid ${TIER_COLORS[c.loyaltyTier]}`,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {tier?.icon} {tier?.label}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Visite</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{c.totalVisits}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Spesa</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>€{c.totalSpent.toFixed(0)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Punti</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{c.loyaltyPoints}</p>
                    </div>
                  </div>

                  {c.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {c.tags.map((tag) => (
                        <span
                          key={tag}
                          className="badge"
                          style={{
                            fontSize: 11,
                            background: tag === "VIP" ? "rgba(245,158,11,0.1)" : "var(--surface-muted)",
                            color: tag === "VIP" ? "#d97706" : "var(--text-secondary)",
                            border: tag === "VIP" ? "1px solid rgba(245,158,11,0.3)" : "1px solid var(--border)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedClient && (
        <div
          className="card animate-slide-in"
          style={{
            width: 360,
            flexShrink: 0,
            padding: 20,
            height: "fit-content",
            position: "sticky",
            top: 0,
            maxHeight: "calc(100vh - 108px)",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Dettaglio Cliente</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedClient(null)}
              style={{ padding: "4px 8px" }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: TIER_BG[selectedClient.loyaltyTier],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                color: TIER_COLORS[selectedClient.loyaltyTier],
              }}
            >
              {getInitials(selectedClient)}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
                {selectedClient.firstName} {selectedClient.lastName}
              </p>
              <span
                className="badge"
                style={{
                  background: TIER_BG[selectedClient.loyaltyTier],
                  color: TIER_COLORS[selectedClient.loyaltyTier],
                  border: `1px solid ${TIER_COLORS[selectedClient.loyaltyTier]}`,
                  fontSize: 12,
                  fontWeight: 600,
                  marginTop: 4,
                  display: "inline-block",
                }}
              >
                {LOYALTY_TIERS[selectedClient.loyaltyTier]?.icon} {LOYALTY_TIERS[selectedClient.loyaltyTier]?.label}
              </span>
            </div>
          </div>

          <hr className="divider" style={{ marginBottom: 14 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Telefono</p>
              <p style={{ fontSize: 14, color: "var(--text)" }}>📞 {selectedClient.phone}</p>
            </div>
            {selectedClient.email && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Email</p>
                <p style={{ fontSize: 14, color: "var(--text)" }}>✉️ {selectedClient.email}</p>
              </div>
            )}
          </div>

          <hr className="divider" style={{ marginBottom: 14 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div className="card" style={{ padding: 10, textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Visite</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{selectedClient.totalVisits}</p>
            </div>
            <div className="card" style={{ padding: 10, textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Spesa</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>€{selectedClient.totalSpent.toFixed(0)}</p>
            </div>
            <div className="card" style={{ padding: 10, textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Punti</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{selectedClient.loyaltyPoints}</p>
            </div>
          </div>

          {selectedClient.lastVisit && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Ultima Visita</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {formatDateTime(selectedClient.lastVisit).date} - {formatDateTime(selectedClient.lastVisit).relative}
              </p>
            </div>
          )}

          <hr className="divider" style={{ marginBottom: 14 }} />

          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Tag</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {selectedClient.tags.map((tag) => (
                <span
                  key={tag}
                  className="badge"
                  style={{
                    fontSize: 12,
                    background: tag === "VIP" ? "rgba(245,158,11,0.1)" : "var(--surface-muted)",
                    color: tag === "VIP" ? "#d97706" : "var(--text-secondary)",
                    border: tag === "VIP" ? "1px solid rgba(245,158,11,0.3)" : "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {tag}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(selectedClient.id, tag);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "inherit",
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
              {selectedClient.tags.length === 0 && (
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Nessun tag</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                className="form-input"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nuovo tag..."
                style={{ flex: 1, fontSize: 12, padding: "6px 10px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTag(selectedClient.id);
                }}
              />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleAddTag(selectedClient.id)}
                style={{ fontSize: 12, padding: "6px 10px" }}
              >
                +
              </button>
            </div>
          </div>

          <hr className="divider" style={{ marginBottom: 14 }} />

          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Note</p>
            <textarea
              className="form-input"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              style={{ fontSize: 13, resize: "vertical", width: "100%" }}
              placeholder="Note sul cliente..."
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleSaveNotes(selectedClient.id)}
              style={{ marginTop: 6, fontSize: 12 }}
            >
              Salva Note
            </button>
          </div>

          <hr className="divider" style={{ marginBottom: 14 }} />

          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Storico Visite ({getClientReservations(selectedClient).length})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {getClientReservations(selectedClient).length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 16 }}>Nessuna prenotazione trovata</p>
              ) : (
                getClientReservations(selectedClient).slice(0, 10).map((r) => {
                  const { date, time } = formatDateTime(r.dateTime);
                  return (
                    <div
                      key={r.id}
                      className="card"
                      style={{ padding: 10, fontSize: 12 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{r.service}</p>
                          <p style={{ color: "var(--text-muted)", marginTop: 2 }}>{date} alle {time}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          {r.totalPrice !== undefined && (
                            <p style={{ fontWeight: 600, color: "var(--text)" }}>€{r.totalPrice.toFixed(2)}</p>
                          )}
                          <span
                            className="badge"
                            style={{
                              fontSize: 10,
                              marginTop: 2,
                              background:
                                r.status === "completata" ? "var(--success-bg)" :
                                r.status === "cancellata" ? "var(--error-bg)" :
                                r.status === "no_show" ? "rgba(148,163,184,0.15)" :
                                "var(--warning-bg)",
                              color:
                                r.status === "completata" ? "var(--success)" :
                                r.status === "cancellata" ? "var(--error)" :
                                r.status === "no_show" ? "#64748b" :
                                "var(--warning)",
                            }}
                          >
                            {r.status === "completata" ? "Completata" :
                             r.status === "cancellata" ? "Cancellata" :
                             r.status === "no_show" ? "No Show" :
                             r.status === "confermata" ? "Confermata" : "In Attesa"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
