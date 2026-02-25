"use client";

import { useState } from "react";

interface BookingFormData {
  cliente: string;
  servizio: string;
  data_ora: string;
  categoria: string;
}

interface BookingResponse {
  messaggio?: string;
  message?: string;
  detail?: string;
}

const CATEGORIE = [
  { value: "parrucchiere", label: "💇 Parrucchiere" },
  { value: "estetista", label: "💅 Estetista" },
  { value: "ristorante", label: "🍽️ Ristorante" },
];

const SERVIZI: Record<string, { value: string; label: string }[]> = {
  parrucchiere: [
    { value: "taglio_capelli", label: "Taglio Capelli" },
    { value: "colorazione", label: "Colorazione & Highlights" },
    { value: "piega_styling", label: "Piega & Styling" },
    { value: "trattamento_cheratina", label: "Trattamento Cheratina" },
    { value: "extension", label: "Extension Capelli" },
    { value: "trattamento_cuoio_capelluto", label: "Trattamento Cuoio Capelluto" },
  ],
  estetista: [
    { value: "pulizia_viso", label: "Pulizia Viso Profonda" },
    { value: "manicure", label: "Manicure & Nail Art" },
    { value: "pedicure", label: "Pedicure Spa" },
    { value: "ceretta", label: "Ceretta Corpo" },
    { value: "massaggio_rilassante", label: "Massaggio Rilassante" },
    { value: "trattamento_anticellulite", label: "Trattamento Anticellulite" },
  ],
  ristorante: [
    { value: "pranzo", label: "Pranzo (12:00–15:00)" },
    { value: "cena", label: "Cena (19:00–23:00)" },
    { value: "brunch", label: "Brunch del Weekend" },
    { value: "evento_privato", label: "Evento Privato" },
    { value: "degustazione", label: "Menu Degustazione" },
  ],
};

type StatusType = "idle" | "loading" | "success" | "error";

export default function BookingForm() {
  const [formData, setFormData] = useState<BookingFormData>({
    cliente: "",
    servizio: "",
    data_ora: "",
    categoria: "",
  });
  const [status, setStatus] = useState<StatusType>("idle");
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);

  const serviziDisponibili = formData.categoria
    ? SERVIZI[formData.categoria] || []
    : [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "categoria" ? { servizio: "" } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      setStatus("error");
      setMessage(
        "Devi accettare il Mandato Fiduciario per procedere con la prenotazione."
      );
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const payload = {
        cliente: formData.cliente,
        servizio: formData.servizio,
        data_ora: new Date(formData.data_ora).toISOString(),
        categoria: formData.categoria,
      };

      const response = await fetch("http://127.0.0.1:8000/prenota", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: BookingResponse = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          data.messaggio ||
            data.message ||
            "Prenotazione confermata con successo!"
        );
        setFormData({ cliente: "", servizio: "", data_ora: "", categoria: "" });
        setAccepted(false);
      } else {
        setStatus("error");
        setMessage(
          data.detail ||
            data.messaggio ||
            "Si è verificato un errore. Riprova."
        );
      }
    } catch {
      setStatus("error");
      setMessage(
        "Impossibile connettersi al server. Verifica che il backend sia attivo su http://127.0.0.1:8000"
      );
    }
  };

  // Get minimum datetime (now)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <section id="prenota" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Section header */}
        <div
          className="text-center mb-12 animate-fade-in-up animate-delay-100"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          <span className="badge badge-gold mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Prenota Ora
          </span>
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: "var(--dark)" }}
          >
            Il Tuo Appuntamento
            <span className="text-gold-gradient block">Esclusivo</span>
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-inter)" }}
          >
            Compila il modulo per riservare il tuo momento di cura e benessere.
            <br />
            Ti confermeremo l&apos;appuntamento entro pochi minuti.
          </p>
        </div>

        {/* Form card */}
        <div className="card p-8 animate-fade-in-up animate-delay-200">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {/* Nome cliente */}
              <div>
                <label className="form-label" htmlFor="cliente">
                  Nome e Cognome
                </label>
                <input
                  id="cliente"
                  name="cliente"
                  type="text"
                  className="form-input"
                  placeholder="Es. Maria Rossi"
                  value={formData.cliente}
                  onChange={handleChange}
                  required
                  minLength={2}
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="form-label" htmlFor="categoria">
                  Tipo di Servizio
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  className="form-input"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Seleziona una categoria —</option>
                  {CATEGORIE.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servizio */}
              <div>
                <label className="form-label" htmlFor="servizio">
                  Servizio Desiderato
                </label>
                <select
                  id="servizio"
                  name="servizio"
                  className="form-input"
                  value={formData.servizio}
                  onChange={handleChange}
                  required
                  disabled={!formData.categoria}
                  style={{
                    opacity: formData.categoria ? 1 : 0.5,
                    cursor: formData.categoria ? "pointer" : "not-allowed",
                  }}
                >
                  <option value="">
                    {formData.categoria
                      ? "— Seleziona un servizio —"
                      : "— Prima seleziona una categoria —"}
                  </option>
                  {serviziDisponibili.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data e ora */}
              <div>
                <label className="form-label" htmlFor="data_ora">
                  Data e Ora Preferita
                </label>
                <input
                  id="data_ora"
                  name="data_ora"
                  type="datetime-local"
                  className="form-input"
                  value={formData.data_ora}
                  onChange={handleChange}
                  required
                  min={minDateTime}
                />
              </div>

              {/* Divider */}
              <hr className="gold-divider" />

              {/* Fiduciary Contract Clause */}
              <div
                className="rounded-xl p-5"
                style={{
                  background: "rgba(201, 169, 110, 0.06)",
                  border: "1px solid rgba(201, 169, 110, 0.25)",
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: "var(--gold-dark)", flexShrink: 0, marginTop: 2 }}
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <div>
                    <p
                      className="font-semibold text-sm mb-1"
                      style={{ color: "var(--gold-dark)", fontFamily: "var(--font-playfair)" }}
                    >
                      Mandato Fiduciario — Guard Contract
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#6b5c3e" }}
                    >
                      Confermando questa prenotazione, il cliente riconosce che
                      il sistema AI opera con{" "}
                      <strong>mandato fiduciario vincolante</strong> (Fiduciary
                      Contract). L&apos;AI agisce esclusivamente nell&apos;interesse del
                      cliente, garantendo riservatezza, correttezza e
                      trasparenza nel trattamento dei dati personali e nella
                      gestione degli appuntamenti, in conformità al GDPR
                      (Reg. UE 2016/679) e alle normative vigenti.
                    </p>
                  </div>
                </div>

                <label
                  className="flex items-start gap-3 cursor-pointer"
                  htmlFor="accept-fiduciary"
                >
                  <div className="relative mt-0.5">
                    <input
                      id="accept-fiduciary"
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center transition-all"
                      style={{
                        background: accepted ? "var(--gold)" : "white",
                        border: accepted
                          ? "2px solid var(--gold)"
                          : "2px solid #d4c4a0",
                      }}
                    >
                      {accepted && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-xs leading-relaxed"
                    style={{ color: "#6b5c3e" }}
                  >
                    Ho letto e accetto il{" "}
                    <strong>Mandato Fiduciario (Guard Contract)</strong> e
                    autorizzo il trattamento dei miei dati personali per la
                    gestione della prenotazione.
                  </span>
                </label>
              </div>

              {/* Status notification */}
              {status !== "idle" && (
                <div
                  className={`notification ${
                    status === "success"
                      ? "notification-success"
                      : status === "error"
                      ? "notification-error"
                      : "notification-loading"
                  }`}
                >
                  {status === "loading" && (
                    <svg
                      className="animate-spin"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                  )}
                  {status === "success" && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  )}
                  {status === "error" && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ flexShrink: 0 }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                  <span>
                    {status === "loading"
                      ? "Invio prenotazione in corso..."
                      : message}
                  </span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className="btn-gold w-full"
                disabled={status === "loading"}
                style={{ width: "100%" }}
              >
                <span>
                  {status === "loading" ? (
                    "Prenotazione in corso..."
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ display: "inline", marginRight: 8 }}
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Conferma Prenotazione
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
