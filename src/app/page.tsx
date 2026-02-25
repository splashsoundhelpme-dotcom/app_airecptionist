import BookingForm from "@/components/BookingForm";
import BusinessDashboard from "@/components/BusinessDashboard";

export default function Home() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--cream)", fontFamily: "var(--font-inter)" }}
    >
      {/* ── HERO / HEADER ─────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--dark) 0%, #2a2018 50%, var(--dark-mid) 100%)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Decorative gold orbs */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,169,110,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Nav */}
        <nav
          className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span
              className="text-xl font-semibold"
              style={{
                color: "white",
                fontFamily: "var(--font-playfair)",
                letterSpacing: "0.02em",
              }}
            >
              Élite Salon
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#prenota"
              className="text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Prenota
            </a>
            <a
              href="#servizi"
              className="text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Servizi
            </a>
            <a
              href="#dashboard"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
              style={{
                color: "var(--gold)",
                border: "1px solid rgba(201,169,110,0.4)",
              }}
            >
              Area Business
            </a>
          </div>
        </nav>

        {/* Hero content */}
        <div
          className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20"
        >
          <div
            className="badge badge-gold mb-6 animate-fade-in-up animate-delay-100"
            style={{
              background: "rgba(201,169,110,0.15)",
              borderColor: "rgba(201,169,110,0.4)",
              color: "var(--gold-light)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Salone di Bellezza Premium · Dal 2010
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up animate-delay-200"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "white",
              maxWidth: "800px",
            }}
          >
            L&apos;Arte della
            <span className="text-gold-gradient block">Bellezza</span>
          </h1>

          <p
            className="text-lg md:text-xl mb-10 leading-relaxed animate-fade-in-up animate-delay-300"
            style={{
              color: "rgba(255,255,255,0.65)",
              maxWidth: "560px",
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
            }}
          >
            Prenota il tuo appuntamento esclusivo. Esperienza, eleganza e cura
            personalizzata per ogni cliente.
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up animate-delay-400">
            <a href="#prenota" className="btn-gold">
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Prenota Ora
              </span>
            </a>
            <a
              href="#servizi"
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-widest transition-all"
              style={{
                color: "rgba(255,255,255,0.85)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                fontFamily: "var(--font-inter)",
              }}
            >
              Scopri i Servizi
            </a>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap gap-8 justify-center mt-16 animate-fade-in-up animate-delay-400"
          >
            {[
              { value: "2.500+", label: "Clienti Soddisfatti" },
              { value: "15+", label: "Anni di Esperienza" },
              { value: "98%", label: "Tasso di Soddisfazione" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-2xl font-bold mb-1"
                  style={{
                    color: "var(--gold)",
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <a
            href="#servizi"
            className="flex flex-col items-center gap-2 opacity-50 hover:opacity-80 transition-opacity"
          >
            <span className="text-xs uppercase tracking-widest" style={{ color: "var(--gold)" }}>
              Scorri
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </a>
        </div>
      </header>

      {/* ── SERVICES SECTION ──────────────────────────────────────── */}
      <section id="servizi" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="badge badge-gold mb-4">I Nostri Servizi</span>
            <h2
              className="text-4xl font-bold"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--dark)",
              }}
            >
              Eccellenza in Ogni
              <span className="text-gold-gradient"> Dettaglio</span>
            </h2>
          </div>

          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {[
              {
                icon: "💇",
                title: "Parrucchiere",
                desc: "Tagli, colorazioni e trattamenti capillari eseguiti da maestri stilisti con prodotti di alta gamma.",
                services: ["Taglio & Styling", "Colorazione", "Trattamenti", "Extension"],
              },
              {
                icon: "💅",
                title: "Estetista",
                desc: "Trattamenti viso e corpo personalizzati per valorizzare la tua bellezza naturale.",
                services: ["Pulizia Viso", "Manicure & Pedicure", "Massaggi", "Ceretta"],
              },
              {
                icon: "🍽️",
                title: "Ristorante",
                desc: "Un'esperienza gastronomica esclusiva con cucina italiana d'autore in un ambiente raffinato.",
                services: ["Pranzo", "Cena", "Brunch", "Menu Degustazione"],
              },
            ].map((cat) => (
              <div
                key={cat.title}
                className="card p-8 hover:shadow-lg transition-all group"
                style={{ cursor: "default" }}
              >
                <div
                  className="text-4xl mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(201,169,110,0.1)" }}
                >
                  {cat.icon}
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    color: "var(--dark)",
                  }}
                >
                  {cat.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cat.desc}
                </p>
                <ul className="space-y-2">
                  {cat.services.map((s) => (
                    <li
                      key={s}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--dark-light)" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "var(--gold)" }}
                      />
                      {s}
                    </li>
                  ))}
                </ul>
                <a
                  href="#prenota"
                  className="inline-flex items-center gap-1 mt-6 text-sm font-medium transition-colors"
                  style={{ color: "var(--gold-dark)" }}
                >
                  Prenota ora
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKING FORM ──────────────────────────────────────────── */}
      <div style={{ background: "#f5f0e8" }}>
        <BookingForm />
      </div>

      {/* ── BUSINESS DASHBOARD ────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(180deg, var(--cream) 0%, #f0ebe0 100%)",
          borderTop: "1px solid rgba(201,169,110,0.2)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-4">
          <hr className="gold-divider mb-16" />
          <div className="text-center mb-4">
            <span className="badge badge-gold">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Accesso Riservato
            </span>
          </div>
        </div>
        <BusinessDashboard />
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "var(--dark)",
          color: "rgba(255,255,255,0.6)",
          fontFamily: "var(--font-inter)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div
            className="grid gap-10 mb-12"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--gold-dark), var(--gold))",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <span
                  className="text-lg font-semibold"
                  style={{
                    color: "white",
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  Élite Salon
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ maxWidth: 240 }}>
                Il tuo salone di bellezza di fiducia. Qualità, eleganza e
                professionalità dal 2010.
              </p>
            </div>

            {/* Contacts */}
            <div>
              <h4
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--gold)" }}
              >
                Contatti
              </h4>
              <ul className="space-y-2 text-sm">
                <li>📍 Via della Bellezza, 12 — Milano</li>
                <li>📞 +39 02 1234 5678</li>
                <li>✉️ info@elitesalon.it</li>
                <li>🕐 Lun–Sab: 9:00–19:00</li>
              </ul>
            </div>

            {/* Legal — Fiduciary Contract */}
            <div>
              <h4
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--gold)" }}
              >
                Mandato Fiduciario
              </h4>
              <div
                className="rounded-xl p-4 text-xs leading-relaxed"
                style={{
                  background: "rgba(201,169,110,0.08)",
                  border: "1px solid rgba(201,169,110,0.2)",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="2"
                    style={{ flexShrink: 0, marginTop: 1 }}
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <strong style={{ color: "var(--gold-light)" }}>
                    Guard Contract — AI Fiduciario
                  </strong>
                </div>
                <p>
                  Il sistema di prenotazione AI opera con{" "}
                  <strong style={{ color: "rgba(255,255,255,0.75)" }}>
                    mandato fiduciario vincolante
                  </strong>{" "}
                  (Fiduciary Contract). L&apos;intelligenza artificiale agisce
                  esclusivamente nell&apos;interesse del cliente, garantendo
                  riservatezza, correttezza e trasparenza nel trattamento dei
                  dati personali, in conformità al{" "}
                  <strong style={{ color: "rgba(255,255,255,0.75)" }}>
                    GDPR (Reg. UE 2016/679)
                  </strong>{" "}
                  e alle normative vigenti in materia di protezione dei dati.
                </p>
              </div>
            </div>
          </div>

          <hr
            className="gold-divider mb-8"
            style={{ opacity: 0.3 }}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <p>
              © {new Date().getFullYear()} Élite Salon & Beauty. Tutti i
              diritti riservati.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Termini di Servizio
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
