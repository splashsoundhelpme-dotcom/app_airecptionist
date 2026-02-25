// ── Business Types ────────────────────────────────────────────
export type BusinessType = "parrucchiere" | "estetista" | "ristorante";

export interface DayHours {
  open: boolean;
  from: string;
  to: string;
}

export type WeekHours = Record<string, DayHours>;

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  category: string;
}

export interface BusinessConfig {
  // Identity
  businessType: BusinessType;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  website?: string;

  // Hours
  weekHours: WeekHours;

  // Restaurant-specific
  maxCovers?: number;
  tableCount?: number;

  // Staff (hair/beauty)
  staff?: StaffMember[];

  // Services
  services?: ServiceItem[];

  // AI Assistant
  aiEnabled: boolean;
  aiPersonality: string; // e.g. "professionale", "amichevole"
  aiLanguages: string[];

  // Notifications
  notifyEmail: boolean;
  notifySms: boolean;
  notifyWhatsapp: boolean;

  // Auth
  adminPin: string;
  adminEmail: string;

  // Setup complete
  setupComplete: boolean;
}

// ── Reservation Types ─────────────────────────────────────────
export type ReservationStatus =
  | "in_attesa"
  | "confermata"
  | "completata"
  | "cancellata"
  | "no_show";

export type ReservationChannel =
  | "email"
  | "telefono"
  | "sms"
  | "whatsapp"
  | "manuale"
  | "online"
  | "ai";

export interface Reservation {
  id: string;
  // Client
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  // Booking
  service: string;
  serviceCategory?: string;
  staffId?: string;
  dateTime: string; // ISO
  duration?: number; // minutes
  // Restaurant
  covers?: number;
  tableNumber?: number;
  // Meta
  channel: ReservationChannel;
  status: ReservationStatus;
  notes?: string;
  createdAt: string; // ISO
  // AI
  aiHandled?: boolean;
  aiTranscript?: string;
}

// ── AI Message Types ──────────────────────────────────────────
export interface AiMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  channel?: ReservationChannel;
}

// ── Notification ──────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
}
