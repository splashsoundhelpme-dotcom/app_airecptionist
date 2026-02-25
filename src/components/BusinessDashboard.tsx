"use client";

import { useState } from "react";

interface Appointment {
  id: number;
  cliente: string;
  servizio: string;
  data_ora: string;
  categoria: string;
  stato: "confermato" | "in_attesa" | "completato" | "cancellato";
}

// Mock data for demonstration — in production, fetch from your API
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    cliente: "Sofia Bianchi",
    servizio: "Colorazione & Highlights",
    data_ora: "2026-02-26T10:00:00",
    categoria: "parrucchiere",
    stato: "confermato",
  },
  {
    id: 2,
    cliente: "Marco Ferretti",
    servizio: "Taglio Capelli",
    data_ora: "2026-02-26T11:30:00",
    categoria: "parrucchiere",
    stato: "confermato",
  },
  {
    id: 3,
    cliente: "Giulia Romano",
    servizio: "Pulizia Viso Profonda",
    data_ora: "2026-02-26T14:00:00",
    categoria: "estetista",
    stato: "in_attesa",
  },
  {
    id: 4,
    cliente: "Alessandro Costa",
    servizio: "Cena (19:00–23:00)",
    data_ora: "2026-02-26T19:30:00",
    categoria: "ristorante",
    stato: "confermato",
  },
  {
    id: 5,
    cliente: "Valentina Esposito",
    servizio: "Massaggio Rilassante",
    data_ora: "2026-02-27T09:00:00",
    categoria: "estetista",
    stato: "completato",
  },
];

const CATEGORIA_ICONS: Record<string, string> = {
  parrucchiere: "💇",
  estetista: "💅",
  ristorante: "🍽️",
};

const STATO_CONFIG: Record<
  string,
  { label: string; bg: string; color: string; dot: string }
> = {
  confermato: {
    label: "Confermato",
    bg: "#f0fdf4",
    color: "#166534",
    dot: "#22c55e",
  },
  in_attesa: {
    label: "In Attesa",
    bg: "#fffbeb",
    color: "#92400e",
    dot: "#f59e0b",
  },
  completato: {
    label: "Completato",
    bg: "#f0f9ff",
    color: "#075985",
    dot: "#0ea5e9",
  },
  cancellato: {
    label: "Cancellato",
    bg: "#fef2f2",
    color: "#991b1b",
    dot: "#ef4444",
  },
};

const DASHBOARD_PIN = "1234"; // In production, use proper auth

function formatDateTime(isoString: string): { date: string; time: string } {
  const d = new Date(isoString);
  return {
    date: d.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default function BusinessDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [filterCategoria, setFilterCategoria] = useState("tutti");
  const [filterStato, setFilterStato] = useState("tutti");
  const [appointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === DASHBOARD_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const filtered = appointments.filter((a) => {
    const catMatch =
      filterCategoria === "tutti" || a.categoria === filterCategoria;
    const statoMatch = filterStato === "tutti" || a.stato === filterStato;
    return catMatch && statoMatch;
  });

  const stats = {
    totale: appointments.length,
    confermati: appointments.filter((a) => a.stato === "confermato").length,
    in_attesa: appointments.filter((a) => a.stato === "in_attesa").length,
    completati: appointments.filter((a) => a.stato === "completato").length,
  };

  if (!isAuthenticated) {
    return (
      <section id="dashboard" className="py-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10 animate-fade-in-up animate-delay-100">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--dark)",
              }}
            >
              Area Riservata
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Accedi con il PIN per visualizzare gli appuntamenti
            </p>
          </div>

          <div className="card p-8 animate-fade-in-up animate-delay-200">
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label className="form-label" htmlFor="pin">
                  PIN di Accesso
                </label>
                <input
                  id="pin"
                  type="password"
                  className="form-input text-center text-2xl tracking-widest"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError(false);
                  }}
                  maxLength={8}
                  required
                  style={{ letterSpacing: "0.3em" }}
                />
                {pinError && (
                  <p
                    className="text-xs mt-2 text-center"
                    style={{ color: "#dc2626" }}
                  >
                    PIN non corretto. Riprova.
                  </p>
                )}
              </div>

              <button type="submit" className="btn-gold" style={{ width: "100%" }}>
                <span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ display: "inline", marginRight: 8 }}
                  >
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Accedi alla Dashboard
                </span>
              </button>

              <p
                className="text-xs text-center mt-4"
                style={{ color: "var(--text-muted)" }}
              >
                Demo: usa il PIN{" "}
                <code
                  className="px-1.5 py-0.5 rounded"
                  style={{ background: "#f0ebe0", color: "var(--gold-dark)" }}
                >
                  1234
                </code>
              </p>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="dashboard" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-in-up animate-delay-100">
          <div>
            <span className="badge badge-gold mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Gestione Appuntamenti
            </span>
            <h2
              className="text-3xl font-bold"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--dark)",
              }}
            >
              Dashboard Business
            </h2>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
            style={{
              background: "#f5f0e8",
              color: "var(--gold-dark)",
              border: "1px solid rgba(201,169,110,0.3)",
              fontFamily: "var(--font-inter)",
              cursor: "pointer",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Esci
          </button>
        </div>

        {/* Stats */}
        <div
          className="grid gap-4 mb-8 animate-fade-in-up animate-delay-200"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
        >
          {[
            { label: "Totale", value: stats.totale, color: "var(--gold)" },
            { label: "Confermati", value: stats.confermati, color: "#22c55e" },
            { label: "In Attesa", value: stats.in_attesa, color: "#f59e0b" },
            { label: "Completati", value: stats.completati, color: "#0ea5e9" },
          ].map((stat) => (
            <div key={stat.label} className="card p-5 text-center">
              <div
                className="text-3xl font-bold mb-1"
                style={{
                  color: stat.color,
                  fontFamily: "var(--font-playfair)",
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          className="card p-4 mb-6 flex flex-wrap gap-3 items-center animate-fade-in-up animate-delay-300"
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Filtra:
          </span>
          <div className="flex gap-2 flex-wrap">
            {["tutti", "parrucchiere", "estetista", "ristorante"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategoria(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  background:
                    filterCategoria === cat
                      ? "var(--gold)"
                      : "rgba(201,169,110,0.1)",
                  color:
                    filterCategoria === cat ? "white" : "var(--gold-dark)",
                  border:
                    filterCategoria === cat
                      ? "1px solid var(--gold)"
                      : "1px solid rgba(201,169,110,0.2)",
                  cursor: "pointer",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {cat === "tutti"
                  ? "Tutti"
                  : `${CATEGORIA_ICONS[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap ml-auto">
            {["tutti", "confermato", "in_attesa", "completato"].map((stato) => (
              <button
                key={stato}
                onClick={() => setFilterStato(stato)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background:
                    filterStato === stato
                      ? "var(--dark)"
                      : "rgba(0,0,0,0.05)",
                  color: filterStato === stato ? "white" : "var(--dark-light)",
                  border:
                    filterStato === stato
                      ? "1px solid var(--dark)"
                      : "1px solid rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {stato === "tutti"
                  ? "Tutti gli stati"
                  : STATO_CONFIG[stato]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments list */}
        <div className="space-y-3 animate-fade-in-up animate-delay-400">
          {filtered.length === 0 ? (
            <div
              className="card p-12 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto mb-3"
                style={{ opacity: 0.4 }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-sm">Nessun appuntamento trovato</p>
            </div>
          ) : (
            filtered.map((apt) => {
              const { date, time } = formatDateTime(apt.data_ora);
              const statoConf = STATO_CONFIG[apt.stato];
              return (
                <div
                  key={apt.id}
                  className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Category icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "rgba(201,169,110,0.1)" }}
                  >
                    {CATEGORIA_ICONS[apt.categoria] || "📅"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-semibold text-sm"
                        style={{
                          color: "var(--dark)",
                          fontFamily: "var(--font-inter)",
                        }}
                      >
                        {apt.cliente}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: statoConf.bg,
                          color: statoConf.color,
                        }}
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                          style={{ background: statoConf.dot }}
                        />
                        {statoConf.label}
                      </span>
                    </div>
                    <p
                      className="text-xs mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {apt.servizio}
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: "var(--gold-dark)" }}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {date}
                      </span>
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: "var(--gold-dark)" }}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {time}
                      </span>
                    </div>
                  </div>

                  {/* Category badge */}
                  <span
                    className="text-xs px-2 py-1 rounded-lg capitalize hidden sm:block"
                    style={{
                      background: "rgba(201,169,110,0.08)",
                      color: "var(--gold-dark)",
                      border: "1px solid rgba(201,169,110,0.2)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {apt.categoria}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Note */}
        <p
          className="text-xs text-center mt-6"
          style={{ color: "var(--text-muted)" }}
        >
          * I dati mostrati sono di esempio. Integra con il tuo endpoint API per
          dati reali.
        </p>
      </div>
    </section>
  );
}
