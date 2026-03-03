"use client";

import { useState, useEffect } from "react";
import { getConfig, getReservations, getNotifications, BUSINESS_LABELS } from "@/lib/store";
import type { BusinessConfig, Reservation, AppNotification } from "@/lib/types";
import DashboardView from "./views/DashboardView";
import ReservationsView from "./views/ReservationsView";
import AiAssistantView from "./views/AiAssistantView";
import CalendarView from "./views/CalendarView";
import SettingsView from "./views/SettingsView";
import NewReservationModal from "./NewReservationModal";

type NavItem = "dashboard" | "reservations" | "calendar" | "ai" | "settings";

interface Props {
  onLogout: () => void;
  onGoToSetup: () => void;
  onGoToPricing?: () => void;
}

export default function AdminApp({ onLogout, onGoToSetup, onGoToPricing }: Props) {
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Initialize from localStorage after mount (client-side only)
    const init = async () => {
      // Check if Google Sheets is configured
      const hasLocalStorage = typeof window !== "undefined" && !!(
        localStorage.getItem("gsheet_id") &&
        localStorage.getItem("gsheet_email") && 
        localStorage.getItem("gsheet_key")
      );
      
      // Also load config
      setConfig(getConfig());
      setNotifications(getNotifications());
      
      if (hasLocalStorage) {
        // Build headers with localStorage values
        const headers: Record<string, string> = {
          "x-gsheet-configured": "true",
          "x-gsheet-id": localStorage.getItem("gsheet_id") || "",
          "x-gsheet-email": localStorage.getItem("gsheet_email") || "",
          "x-gsheet-key": localStorage.getItem("gsheet_key") || "",
        };
        
        // Try to load reservations from Google Sheets
        try {
          const resRes = await fetch("/api/sheets/reservations", { headers });
          const dataRes = await resRes.json();
          if (dataRes.reservations && Array.isArray(dataRes.reservations)) {
            setReservations(dataRes.reservations);
            return;
          }
        } catch (e) {
          console.error("Failed to load from Google Sheets:", e);
        }
      }
      
      // Fall back to localStorage
      setReservations(getReservations());
    };
    init();
  }, []);

  const refreshReservations = async () => {
    const hasLocalStorage = typeof window !== "undefined" && !!(
      localStorage.getItem("gsheet_id") &&
      localStorage.getItem("gsheet_email") && 
      localStorage.getItem("gsheet_key")
    );
    
    if (hasLocalStorage) {
      const headers: Record<string, string> = {
        "x-gsheet-configured": "true",
        "x-gsheet-id": localStorage.getItem("gsheet_id") || "",
        "x-gsheet-email": localStorage.getItem("gsheet_email") || "",
        "x-gsheet-key": localStorage.getItem("gsheet_key") || "",
      };
      
      try {
        const res = await fetch("/api/sheets/reservations", { headers });
        const data = await res.json();
        if (data.reservations && Array.isArray(data.reservations)) {
          setReservations(data.reservations);
          return;
        }
      } catch (e) {
        console.error("Failed to refresh from Google Sheets:", e);
      }
    }
    
    // Fall back to localStorage
    setReservations(getReservations());
  };

  const refreshConfig = () => {
    setConfig(getConfig());
  };

  if (!config) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="animate-spin" style={{ width: 32, height: 32 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        </div>
      </div>
    );
  }

  const businessInfo = BUSINESS_LABELS[config.businessType];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingCount = reservations.filter((r) => r.status === "in_attesa").length;

  const navItems: { id: NavItem; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: "reservations",
      label: "Prenotazioni",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: "calendar",
      label: "Calendario",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "ai",
      label: "Assistente AI",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a2 2 0 012 2v2a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2z" />
          <path d="M12 8v4" />
          <path d="M8.5 14.5A5.5 5.5 0 0012 20a5.5 5.5 0 003.5-5.5" />
          <path d="M6 10a6 6 0 0012 0" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Impostazioni",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <div
          style={{
            padding: "20px 16px",
            borderBottom: "1px solid var(--sidebar-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {businessInfo.icon}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {config.businessName || "La mia attività"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                {businessInfo.label}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 8px", flex: 1 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              padding: "8px 8px 4px",
              marginBottom: 4,
            }}
          >
            Menu
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: 99,
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick action */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid var(--sidebar-border)" }}>
          <button
            className="btn btn-primary"
            style={{ width: "100%", fontSize: 13 }}
            onClick={() => setShowNewReservation(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuova Prenotazione
          </button>
        </div>

        {/* User / Logout */}
        <div
          style={{
            padding: "12px 8px",
            borderTop: "1px solid var(--sidebar-border)",
          }}
        >
          <button
            className="sidebar-nav-item"
            onClick={onLogout}
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Esci
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Top bar */}
        <div
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
              {navItems.find((n) => n.id === activeNav)?.label}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Notifications bell */}
            <button
              className="btn btn-ghost btn-sm"
              style={{ position: "relative", padding: "8px" }}
              title="Notifiche"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#ef4444",
                    border: "2px solid var(--surface)",
                  }}
                />
              )}
            </button>

            {/* AI status */}
            {config.aiEnabled && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 99,
                  background: "rgba(102,126,234,0.1)",
                  border: "1px solid rgba(102,126,234,0.2)",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "inline-block",
                  }}
                  className="animate-pulse"
                />
                <span style={{ fontSize: 12, fontWeight: 500, color: "#667eea" }}>AI Attivo</span>
              </div>
            )}

            {/* Settings shortcut */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setActiveNav("settings")}
              style={{ padding: "8px" }}
              title="Impostazioni"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: "24px" }}>
          {activeNav === "dashboard" && (
            <DashboardView
              config={config}
              reservations={reservations}
              onNewReservation={() => setShowNewReservation(true)}
              onNavigate={setActiveNav}
            />
          )}
          {activeNav === "reservations" && (
            <ReservationsView
              config={config}
              reservations={reservations}
              onRefresh={refreshReservations}
              onNewReservation={() => setShowNewReservation(true)}
            />
          )}
          {activeNav === "calendar" && (
            <CalendarView config={config} reservations={reservations} />
          )}
          {activeNav === "ai" && (
            <AiAssistantView config={config} reservations={reservations} onRefresh={refreshReservations} />
          )}
          {activeNav === "settings" && (
            <SettingsView
              config={config}
              onSave={refreshConfig}
              onGoToSetup={onGoToSetup}
            />
          )}
        </div>
      </main>

      {/* New Reservation Modal */}
      {showNewReservation && (
        <NewReservationModal
          config={config}
          onClose={() => setShowNewReservation(false)}
          onSaved={() => {
            setShowNewReservation(false);
            refreshReservations();
          }}
        />
      )}
    </div>
  );
}
