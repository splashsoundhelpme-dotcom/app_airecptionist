// ── Multi-tenant Types ────────────────────────────────────────
export interface TenantContext {
  businessId: string;
  mandateVersion: "1.0";
  issuedAt: string;
}

// ── Guard Contract Types ──────────────────────────────────────
export type ClientRiskLevel = "ok" | "at_risk" | "blocked";

export interface GuardContractRecord {
  clientPhone: string;
  clientEmail?: string;
  businessId: string;
  noShowCount: number;
  riskLevel: ClientRiskLevel;
  totalPenaltyEur: number;
  lastNoShowAt?: string;
  blockedAt?: string;
}

export interface NoShowPenalty {
  reservationId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  penaltyAmountEur: number;
  appliedAt: string;
  notificationSent: boolean;
  riskLevel: ClientRiskLevel;
}

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

// ── Voice/Audio Types ─────────────────────────────────────────
export type VoiceTone = 
  | "professionale" 
  | "amichevole" 
  | "elegante" 
  | "giovane" 
  | "caldo" 
  | "energetico";

export interface VoiceConfig {
  enabled: boolean;
  tone: VoiceTone;
  welcomeMessage: string;
  language: string;
}

// ── API Integration Types ────────────────────────────────────────
export interface ApiIntegration {
  // Owner API Keys (managed centrally)
  ownerApiKeysConfigured: boolean;
  
  // Phone/SMS (Twilio + 11Labs for voice)
  phoneEnabled: boolean;
  phoneNumber?: string;
  phoneApiKey?: string;
  phoneApiSecret?: string;
  
  // Voice AI (11Labs)
  voiceEnabled: boolean;
  voiceTone?: VoiceTone;
  welcomeMessage?: string;
  voiceLanguage?: string;
  
  // Email (SendGrid)
  emailEnabled: boolean;
  emailApiKey?: string;
  emailFromAddress?: string;
  notifyOnNewReservation: boolean;
  notifyOnCancellation: boolean;
  notifyOnModification: boolean;
  
  // WhatsApp (Twilio WhatsApp or Meta Business)
  whatsappEnabled: boolean;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  
  // Webhook for receiving data
  webhookUrl?: string;
  
  // AI Model
  aiModel: "gemini" | "openai";
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
