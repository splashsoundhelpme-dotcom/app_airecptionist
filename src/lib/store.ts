import type {
  BusinessConfig,
  Reservation,
  AiMessage,
  AppNotification,
  BusinessType,
  WeekHours,
  SubscriptionStatus,
  SubscriptionPlan,
  ApiIntegration,
} from "./types";

// ── Default week hours ────────────────────────────────────────
export const DEFAULT_WEEK_HOURS: WeekHours = {
  lunedi:    { open: true,  from: "09:00", to: "19:00" },
  martedi:   { open: true,  from: "09:00", to: "19:00" },
  mercoledi: { open: true,  from: "09:00", to: "19:00" },
  giovedi:   { open: true,  from: "09:00", to: "19:00" },
  venerdi:   { open: true,  from: "09:00", to: "19:00" },
  sabato:    { open: true,  from: "09:00", to: "17:00" },
  domenica:  { open: false, from: "09:00", to: "13:00" },
};

// ── Default config ────────────────────────────────────────────
export const DEFAULT_CONFIG: BusinessConfig = {
  businessType: "parrucchiere",
  businessName: "",
  address: "",
  phone: "",
  email: "",
  weekHours: DEFAULT_WEEK_HOURS,
  maxCovers: 40,
  tableCount: 10,
  staff: [],
  services: [],
  aiEnabled: true,
  aiPersonality: "professionale",
  aiLanguages: ["italiano"],
  notifyEmail: true,
  notifySms: false,
  notifyWhatsapp: false,
  adminPin: "1234",
  adminEmail: "",
  setupComplete: false,
  subscription: createTrialSubscription(),
  apiIntegration: {
    phoneEnabled: false,
    emailEnabled: false,
    whatsappEnabled: false,
  },
};

// ── Default services per business type ───────────────────────
export const DEFAULT_SERVICES: Record<BusinessType, { id: string; name: string; duration: number; price: number; category: string }[]> = {
  parrucchiere: [
    { id: "s1", name: "Taglio Capelli", duration: 45, price: 25, category: "Taglio" },
    { id: "s2", name: "Taglio + Piega", duration: 75, price: 40, category: "Taglio" },
    { id: "s3", name: "Colorazione", duration: 120, price: 70, category: "Colore" },
    { id: "s4", name: "Highlights / Mèches", duration: 150, price: 90, category: "Colore" },
    { id: "s5", name: "Piega", duration: 45, price: 20, category: "Styling" },
    { id: "s6", name: "Trattamento Cheratina", duration: 180, price: 120, category: "Trattamenti" },
    { id: "s7", name: "Extension Capelli", duration: 240, price: 200, category: "Extension" },
    { id: "s8", name: "Trattamento Cuoio Capelluto", duration: 60, price: 35, category: "Trattamenti" },
  ],
  estetista: [
    { id: "s1", name: "Pulizia Viso Profonda", duration: 60, price: 50, category: "Viso" },
    { id: "s2", name: "Trattamento Anti-età", duration: 75, price: 70, category: "Viso" },
    { id: "s3", name: "Manicure", duration: 45, price: 25, category: "Mani & Piedi" },
    { id: "s4", name: "Pedicure Spa", duration: 60, price: 35, category: "Mani & Piedi" },
    { id: "s5", name: "Nail Art", duration: 60, price: 40, category: "Mani & Piedi" },
    { id: "s6", name: "Ceretta Gambe Intere", duration: 45, price: 30, category: "Ceretta" },
    { id: "s7", name: "Ceretta Ascelle", duration: 20, price: 15, category: "Ceretta" },
    { id: "s8", name: "Massaggio Rilassante", duration: 60, price: 55, category: "Massaggi" },
    { id: "s9", name: "Massaggio Anticellulite", duration: 60, price: 60, category: "Massaggi" },
    { id: "s10", name: "Trattamento Corpo", duration: 90, price: 80, category: "Corpo" },
  ],
  ristorante: [
    { id: "s1", name: "Pranzo", duration: 90, price: 0, category: "Pranzo" },
    { id: "s2", name: "Cena", duration: 120, price: 0, category: "Cena" },
    { id: "s3", name: "Brunch del Weekend", duration: 120, price: 0, category: "Brunch" },
    { id: "s4", name: "Menu Degustazione", duration: 180, price: 0, category: "Speciale" },
    { id: "s5", name: "Evento Privato", duration: 240, price: 0, category: "Speciale" },
    { id: "s6", name: "Aperitivo", duration: 60, price: 0, category: "Aperitivo" },
  ],
};

// ── Default reservations (empty - user creates them) ───────────────────────
export const MOCK_RESERVATIONS: Reservation[] = [];

// ── Default AI messages (empty - user creates them) ──────────────────────
export const MOCK_AI_MESSAGES: AiMessage[] = [];

// ── Storage helpers ───────────────────────────────────────────
const STORAGE_KEYS = {
  config: "admin_business_config",
  reservations: "admin_reservations",
  aiMessages: "admin_ai_messages",
  notifications: "admin_notifications",
  authenticated: "admin_authenticated",
};

export function getConfig(): BusinessConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.config);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: BusinessConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
}

export function getReservations(): Reservation[] {
  if (typeof window === "undefined") return MOCK_RESERVATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.reservations);
    if (!raw) return MOCK_RESERVATIONS;
    return JSON.parse(raw);
  } catch {
    return MOCK_RESERVATIONS;
  }
}

export function saveReservations(reservations: Reservation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(reservations));
}

export function getAiMessages(): AiMessage[] {
  if (typeof window === "undefined") return MOCK_AI_MESSAGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.aiMessages);
    if (!raw) return MOCK_AI_MESSAGES;
    return JSON.parse(raw);
  } catch {
    return MOCK_AI_MESSAGES;
  }
}

export function saveAiMessages(messages: AiMessage[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.aiMessages, JSON.stringify(messages));
}

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.notifications);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: AppNotification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEYS.authenticated) === "true";
}

export function setAuthenticated(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    sessionStorage.setItem(STORAGE_KEYS.authenticated, "true");
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.authenticated);
  }
}

// ── Helpers ───────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function formatDateTime(iso: string): { date: string; time: string; relative: string } {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / 86400000);

  let relative = "";
  if (diffDays === 0) relative = "Oggi";
  else if (diffDays === 1) relative = "Domani";
  else if (diffDays === -1) relative = "Ieri";
  else if (diffDays > 1) relative = `Tra ${diffDays} giorni`;
  else relative = `${Math.abs(diffDays)} giorni fa`;

  return {
    date: d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" }),
    time: d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
    relative,
  };
}

export const BUSINESS_LABELS: Record<string, { label: string; icon: string; color: string; badgeClass: string }> = {
  parrucchiere: { label: "Parrucchiere", icon: "💇", color: "var(--hair)", badgeClass: "badge-hair" },
  estetista:    { label: "Estetista",    icon: "💅", color: "var(--beauty)", badgeClass: "badge-beauty" },
  ristorante:   { label: "Ristorante",   icon: "🍽️", color: "var(--restaurant)", badgeClass: "badge-restaurant" },
};

export const CHANNEL_LABELS: Record<string, { label: string; icon: string; colorClass: string }> = {
  email:     { label: "Email",     icon: "✉️",  colorClass: "channel-email" },
  telefono:  { label: "Telefono",  icon: "📞",  colorClass: "channel-phone" },
  sms:       { label: "SMS",       icon: "💬",  colorClass: "channel-sms" },
  whatsapp:  { label: "WhatsApp",  icon: "📱",  colorClass: "channel-whatsapp" },
  manuale:   { label: "Manuale",   icon: "✏️",  colorClass: "channel-manual" },
  online:    { label: "Online",    icon: "🌐",  colorClass: "channel-email" },
  ai:        { label: "AI",        icon: "🤖",  colorClass: "channel-phone" },
};

export const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; dot: string }> = {
  in_attesa:  { label: "In Attesa",  badgeClass: "badge-warning", dot: "#f59e0b" },
  confermata: { label: "Confermata", badgeClass: "badge-success", dot: "#22c55e" },
  completata: { label: "Completata", badgeClass: "badge-info",    dot: "#0ea5e9" },
  cancellata: { label: "Cancellata", badgeClass: "badge-error",   dot: "#ef4444" },
  no_show:    { label: "No Show",    badgeClass: "badge-neutral",  dot: "#94a3b8" },
};

export const DAYS_IT = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
export const DAYS_LABELS: Record<string, string> = {
  lunedi: "Lunedì", martedi: "Martedì", mercoledi: "Mercoledì",
  giovedi: "Giovedì", venerdi: "Venerdì", sabato: "Sabato", domenica: "Domenica",
};

// ── Subscription helpers ──────────────────────────────────────────
export const SUBSCRIPTION_PLANS: Record<string, { name: string; price: number; interval: string; originalPrice?: number; savings?: number; features: string[] }> = {
  trial: {
    name: "Prova Gratuita",
    price: 0,
    interval: "3 giorni",
    features: [
      "Accesso completo a tutte le funzionalità",
      "Assistente AI attivo",
      "Gestione prenotazioni illimitata",
      "Supporto prioritario",
    ],
  },
  monthly: {
    name: "Mensile",
    price: 199.99,
    interval: "mese",
    originalPrice: 299.99,
    savings: 100,
    features: [
      "Tutto incluso nel piano trial",
      "Integrazioni telefoniche e email",
      "Notifiche in tempo reale",
      "Assistenza 24/7",
    ],
  },
  annual: {
    name: "Annuale",
    price: 1999.99,
    interval: "anno",
    originalPrice: 2399.88,
    savings: 400,
    features: [
      "Tutto nel piano mensile",
      "Risparmia €400 rispetto al mensile",
      "Dominio personalizzato",
      "API dedicata",
    ],
  },
};

export function createTrialSubscription(): SubscriptionStatus {
  const now = new Date();
  const expires = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  return {
    plan: "trial",
    startDate: now.toISOString(),
    expiresAt: expires.toISOString(),
    isActive: true,
    trialUsed: false,
  };
}

export function createMonthlySubscription(): SubscriptionStatus {
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return {
    plan: "monthly",
    startDate: now.toISOString(),
    expiresAt: expires.toISOString(),
    isActive: true,
    trialUsed: true,
  };
}

export function createAnnualSubscription(): SubscriptionStatus {
  const now = new Date();
  const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  
  return {
    plan: "annual",
    startDate: now.toISOString(),
    expiresAt: expires.toISOString(),
    isActive: true,
    trialUsed: true,
  };
}

export function checkSubscriptionStatus(subscription?: SubscriptionStatus): { isValid: boolean; daysRemaining: number; plan: string } {
  if (!subscription) {
    return { isValid: false, daysRemaining: 0, plan: "expired" };
  }
  
  const now = new Date();
  const expires = new Date(subscription.expiresAt);
  const diffMs = expires.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  
  return {
    isValid: subscription.isActive && daysRemaining > 0,
    daysRemaining: Math.max(0, daysRemaining),
    plan: subscription.plan as string,
  };
}

// End of file
