import type {
  BusinessConfig,
  Reservation,
  AiMessage,
  AppNotification,
  BusinessType,
  WeekHours,
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

// ── Mock reservations ─────────────────────────────────────────
export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "r1",
    clientName: "Sofia Bianchi",
    clientPhone: "+39 333 1234567",
    clientEmail: "sofia.bianchi@email.it",
    service: "Colorazione & Highlights",
    serviceCategory: "parrucchiere",
    dateTime: new Date(Date.now() + 86400000).toISOString().replace(/T.*/, "T10:00:00"),
    duration: 150,
    channel: "online",
    status: "confermata",
    notes: "Vuole mèches bionde, capelli lunghi",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    aiHandled: false,
  },
  {
    id: "r2",
    clientName: "Marco Ferretti",
    clientPhone: "+39 347 9876543",
    service: "Taglio Capelli",
    serviceCategory: "parrucchiere",
    dateTime: new Date(Date.now() + 86400000).toISOString().replace(/T.*/, "T11:30:00"),
    duration: 45,
    channel: "telefono",
    status: "confermata",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    aiHandled: true,
    aiTranscript: "Cliente ha chiamato alle 14:30. Ha richiesto taglio capelli per domani mattina. Confermato slot 11:30.",
  },
  {
    id: "r3",
    clientName: "Giulia Romano",
    clientPhone: "+39 320 5551234",
    clientEmail: "giulia.romano@gmail.com",
    service: "Pulizia Viso Profonda",
    serviceCategory: "estetista",
    dateTime: new Date(Date.now() + 86400000).toISOString().replace(/T.*/, "T14:00:00"),
    duration: 60,
    channel: "email",
    status: "in_attesa",
    notes: "Prima visita, pelle sensibile",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    aiHandled: true,
    aiTranscript: "Email ricevuta alle 13:15. Cliente richiede pulizia viso. Slot proposto: domani 14:00. In attesa di conferma.",
  },
  {
    id: "r4",
    clientName: "Alessandro Costa",
    clientPhone: "+39 389 7654321",
    service: "Cena",
    serviceCategory: "ristorante",
    dateTime: new Date(Date.now() + 86400000).toISOString().replace(/T.*/, "T19:30:00"),
    duration: 120,
    covers: 4,
    tableNumber: 7,
    channel: "telefono",
    status: "confermata",
    notes: "Tavolo per 4, anniversario di matrimonio. Richiesta torta.",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    aiHandled: false,
  },
  {
    id: "r5",
    clientName: "Valentina Esposito",
    clientPhone: "+39 366 1122334",
    service: "Massaggio Rilassante",
    serviceCategory: "estetista",
    dateTime: new Date(Date.now() - 86400000).toISOString().replace(/T.*/, "T09:00:00"),
    duration: 60,
    channel: "whatsapp",
    status: "completata",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    aiHandled: true,
    aiTranscript: "Messaggio WhatsApp ricevuto. Prenotazione gestita automaticamente dall'AI.",
  },
  {
    id: "r6",
    clientName: "Luca Martini",
    clientPhone: "+39 340 9988776",
    service: "Pranzo",
    serviceCategory: "ristorante",
    dateTime: new Date(Date.now() + 172800000).toISOString().replace(/T.*/, "T13:00:00"),
    duration: 90,
    covers: 2,
    channel: "sms",
    status: "in_attesa",
    notes: "Tavolo per 2, preferibilmente vicino alla finestra",
    createdAt: new Date(Date.now() - 900000).toISOString(),
    aiHandled: true,
    aiTranscript: "SMS ricevuto. Richiesta tavolo per 2 persone a pranzo. Slot disponibile confermato.",
  },
  {
    id: "r7",
    clientName: "Francesca Ricci",
    clientEmail: "f.ricci@libero.it",
    service: "Manicure",
    serviceCategory: "estetista",
    dateTime: new Date(Date.now() + 259200000).toISOString().replace(/T.*/, "T10:30:00"),
    duration: 45,
    channel: "online",
    status: "confermata",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    aiHandled: false,
  },
  {
    id: "r8",
    clientName: "Roberto Conti",
    clientPhone: "+39 335 4433221",
    service: "Taglio + Piega",
    serviceCategory: "parrucchiere",
    dateTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    duration: 75,
    channel: "manuale",
    status: "no_show",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    aiHandled: false,
  },
];

// ── Mock AI messages ──────────────────────────────────────────
export const MOCK_AI_MESSAGES: AiMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content: "Ciao! Sono l'assistente AI del tuo salone. Ho appena gestito una chiamata da Marco Ferretti che ha prenotato un taglio capelli per domani alle 11:30. Ho confermato la prenotazione automaticamente.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    channel: "telefono",
  },
  {
    id: "m2",
    role: "assistant",
    content: "Ho ricevuto un'email da Giulia Romano. Richiede una pulizia viso profonda. Ho proposto lo slot di domani alle 14:00 e sto aspettando la sua conferma. La prenotazione è in stato 'In Attesa'.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    channel: "email",
  },
  {
    id: "m3",
    role: "assistant",
    content: "SMS ricevuto da Luca Martini: vuole prenotare un pranzo per 2 persone dopodomani. Ho verificato la disponibilità e confermato il tavolo per le 13:00. Preferisce posto vicino alla finestra.",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    channel: "sms",
  },
];

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
