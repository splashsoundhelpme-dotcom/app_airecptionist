// ── Business Types ────────────────────────────────────────────
export type BusinessType = "parrucchiere" | "estetista" | "ristorante";

// ── Subscription Types ────────────────────────────────────────────
export type SubscriptionPlan = "trial" | "monthly" | "annual" | "expired";

export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  startDate: string;
  expiresAt: string;
  isActive: boolean;
  trialUsed: boolean;
}

// ── API Integration Types ────────────────────────────────────────
export interface ApiIntegration {
  // Phone/SMS (Twilio or similar)
  phoneEnabled: boolean;
  phoneNumber?: string;
  phoneApiKey?: string;
  phoneApiSecret?: string;
  
  // Email (SendGrid or similar)
  emailEnabled: boolean;
  emailApiKey?: string;
  emailFromAddress?: string;
  
  // WhatsApp (Twilio WhatsApp or Meta Business)
  whatsappEnabled: boolean;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  
  // Webhook for receiving data
  webhookUrl?: string;
}

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
  
  // Subscription
  subscription?: SubscriptionStatus;
  
  // API Integrations for real-time data
  apiIntegration?: ApiIntegration;
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
