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
  ownerApiKeysConfigured: boolean;
  phoneEnabled: boolean;
  phoneNumber?: string;
  phoneApiKey?: string;
  phoneApiSecret?: string;
  voiceEnabled: boolean;
  voiceTone?: VoiceTone;
  welcomeMessage?: string;
  voiceLanguage?: string;
  emailEnabled: boolean;
  emailApiKey?: string;
  emailFromAddress?: string;
  notifyOnNewReservation: boolean;
  notifyOnCancellation: boolean;
  notifyOnModification: boolean;
  whatsappEnabled: boolean;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  webhookUrl?: string;
  aiModel: "gemini" | "openai";
}

// ── Hours & Schedule ──────────────────────────────────────────
export interface DayHours {
  open: boolean;
  from: string;
  to: string;
}

export type WeekHours = Record<string, DayHours>;

// ── Restaurant Shifts (Turni) ─────────────────────────────────
export interface TurnoConfig {
  id: string;
  name: string;              // "Pranzo", "Cena", "Brunch", "Aperitivo"
  from: string;              // "12:00"
  to: string;                // "15:00"
  maxCovers: number;         // max coperti per questo turno
  maxTables: number;         // max tavoli utilizzabili
  lastOrderMinutes: number;  // minuti prima della chiusura per ultimo ordine (ristorante)
  bufferMinutes: number;     // minuti di pausa tra un turno e l'altro
  active: boolean;           // turno attivo o disattivato
  color: string;             // colore per visualizzazione
  days: string[];            // giorni della settimana in cui questo turno è attivo
}

// ── Table Management (Tavoli) ──────────────────────────────────
export interface TableConfig {
  id: string;
  number: number;
  name?: string;             // "Tavolo Rosso", "Terrazza 1"
  seats: number;
  minSeats: number;          // minimo coperti per questo tavolo
  zone: string;              // "interno", "esterno", "terr VIP", "piano superiore"
  isCombinable: boolean;     // può essere unito ad altri tavoli
  combinedWith?: string[];   // IDs dei tavoli combinati
  isActive: boolean;
  notes?: string;            // "Vista mare", "Vicino cucina"
}

// ── Table Zones ───────────────────────────────────────────────
export interface TableZone {
  id: string;
  name: string;
  color: string;
  isOutdoor: boolean;
}

// ── Staff ─────────────────────────────────────────────────────
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  color: string;
  phone?: string;
  email?: string;
  services?: string[];
  workingDays?: string[];
  isActive?: boolean;
}

// ── Services ──────────────────────────────────────────────────
export interface ServiceItem {
  id: string;
  name: string;
  duration: number;          // minutes
  price: number;
  category: string;
  description?: string;
  isActive?: boolean;
  maxAdvanceBooking?: number;
  minAdvanceBooking?: number;
}

// ── Menu (Ristorante) ─────────────────────────────────────────
export interface MenuItem {
  id: string;
  name: string;
  category: string;          // "Antipasti", "Primi", "Secondi", "Dolci", "Bevande"
  price: number;
  description?: string;
  allergens?: string[];      // "glutine", "lattosio", "crostacei", etc.
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isAvailable: boolean;
  image?: string;
}

// ── Client CRM ────────────────────────────────────────────────
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  birthDate?: string;        // ISO
  notes?: string;
  tags: string[];            // "VIP", "abituale", "allergie", "compleanno"
  preferences?: string;      // preferenze del cliente
  allergies?: string[];      // allergie note (ristorante)
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;        // ISO
  createdAt: string;         // ISO
  loyaltyPoints: number;
  loyaltyTier: "bronzo" | "argento" | "oro" | "platino";
  isActive: boolean;
  // Social
  instagram?: string;
  // Notification preferences
  notifyEmail: boolean;
  notifySms: boolean;
  notifyWhatsapp: boolean;
  // Marketing consent
  marketingConsent: boolean;
}

// ── Loyalty Program ───────────────────────────────────────────
export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: "sconto_percentuale" | "sconto_fisso" | "servizio_gratuito" | "upgrade";
  value: number;             // percentuale sconto o importo fisso
  isActive: boolean;
  maxRedemptions?: number;
  currentRedemptions: number;
}

export interface LoyaltyTransaction {
  id: string;
  clientId: string;
  type: "earned" | "redeemed" | "bonus" | "expired" | "adjusted";
  points: number;
  description: string;
  reservationId?: string;
  timestamp: string;
}

// ── Review / Rating ───────────────────────────────────────────
export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  reservationId?: string;
  rating: number;            // 1-5
  comment?: string;
  staffRating?: number;      // 1-5
  serviceRating?: number;    // 1-5
  ambianceRating?: number;   // 1-5
  createdAt: string;
  isPublic: boolean;
  reply?: string;
  replyAt?: string;
}

// ── Waitlist ──────────────────────────────────────────────────
export interface WaitlistEntry {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  service?: string;
  preferredDate?: string;    // ISO
  preferredTime?: string;    // "12:00"
  preferredTurno?: string;   // turno ID
  covers?: number;
  notes?: string;
  status: "in_attesa" | "contattato" | "confermato" | "scaduto" | "rifiutato";
  createdAt: string;
  notifiedAt?: string;
  expiresAt?: string;
}

// ── Blackout / Closed Dates ───────────────────────────────────
export interface BlackoutDate {
  id: string;
  date: string;              // "2026-03-15"
  reason?: string;           // "Festa", "Chiusura straordinaria", "Evento privato"
  allDay: boolean;
  from?: string;             // "14:00" (se non allDay)
  to?: string;               // "18:00"
  turnoIds?: string[];       // chiudi solo alcuni turni
  isRecurring: boolean;      // ricorre ogni anno
}

// ── Special Events ────────────────────────────────────────────
export interface SpecialEvent {
  id: string;
  name: string;
  description?: string;
  date: string;              // ISO
  from: string;              // "19:00"
  to: string;                // "23:00"
  maxGuests: number;
  pricePerPerson?: number;
  menuId?: string;           // menu speciale associato
  isActive: boolean;
  reservations: string[];    // IDs prenotazioni collegate
}

// ── Business Config ───────────────────────────────────────────
export interface BusinessConfig {
  // Identity
  businessType: BusinessType;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  description?: string;
  piva?: string;             // Partita IVA
  codiceFiscale?: string;

  // Hours
  weekHours: WeekHours;

  // Restaurant-specific
  maxCovers?: number;
  tableCount?: number;
  turni?: TurnoConfig[];
  tables?: TableConfig[];
  tableZones?: TableZone[];
  menu?: MenuItem[];
  cuisineType?: string;      // "italiana", "giapponese", "fusion"
  priceRange?: "$" | "$$" | "$$$" | "$$$$";

  // Hair/Beauty specific
  staff?: StaffMember[];
  services?: ServiceItem[];
  allowOnlineBooking?: boolean;
  bookingAdvanceDays?: number;
  cancellationPolicyHours?: number;
  noShowPolicy?: "warning" | "deposit_forfeit" | "ban_after_3";

  // AI Assistant
  aiEnabled: boolean;
  aiPersonality: string;
  aiLanguages: string[];
  aiAutoConfirm?: boolean;
  aiGreeting?: string;

  // Notifications
  notifyEmail: boolean;
  notifySms: boolean;
  notifyWhatsapp: boolean;
  notifyBeforeAppointment?: number; // minuti prima dell'appuntamento

  // Auth
  adminPin: string;
  adminEmail: string;
  twoFactorEnabled?: boolean;
  sessionTimeoutMinutes?: number;

  // Setup
  setupComplete: boolean;
  setupStep?: number;

  // Subscription
  subscription?: SubscriptionStatus;

  // API Integrations
  apiIntegration?: ApiIntegration;

  // Loyalty
  loyaltyEnabled?: boolean;
  loyaltyPointsPerEuro?: number;
  loyaltyRewards?: LoyaltyReward[];

  // Reviews
  reviewsEnabled?: boolean;
  autoRequestReview?: boolean;

  // Waitlist
  waitlistEnabled?: boolean;
  waitlistAutoExpireHours?: number;

  // Theme
  primaryColor?: string;
  accentColor?: string;
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
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  // Booking
  service: string;
  serviceCategory?: string;
  staffId?: string;
  dateTime: string;          // ISO
  duration?: number;         // minutes
  // Restaurant
  covers?: number;
  tableNumber?: number;
  tableIds?: string[];       // tavoli assegnati (multi-tavolo)
  turnoId?: string;          // turno di riferimento
  // Pricing
  totalPrice?: number;
  discount?: number;
  depositPaid?: boolean;
  depositAmount?: number;
  // Meta
  channel: ReservationChannel;
  status: ReservationStatus;
  notes?: string;
  internalNotes?: string;    // note visibili solo allo staff
  createdAt: string;         // ISO
  updatedAt?: string;        // ISO
  // AI
  aiHandled?: boolean;
  aiTranscript?: string;
  // Recurring
  isRecurring?: boolean;
  recurringId?: string;
  recurringPattern?: "weekly" | "biweekly" | "monthly";
  // Special
  specialEventId?: string;
  // Dietary / Allergies (restaurant)
  allergies?: string[];
  dietaryNotes?: string;
  // Review
  reviewId?: string;
  // Loyalty
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
}

// ── Recurring Reservation ─────────────────────────────────────
export interface RecurringReservation {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  service: string;
  staffId?: string;
  pattern: "weekly" | "biweekly" | "monthly";
  dayOfWeek?: number;        // 0=Mon for weekly
  dayOfMonth?: number;       // for monthly
  time: string;              // "14:30"
  duration?: number;
  covers?: number;
  turnoId?: string;
  notes?: string;
  startDate: string;         // ISO
  endDate?: string;          // ISO (null = indefinite)
  isActive: boolean;
  lastGenerated?: string;    // ISO - ultima prenotazione generata
}

// ── AI Message ────────────────────────────────────────────────
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
  actionUrl?: string;
  reservationId?: string;
  clientId?: string;
}

// ── Analytics / Reports ───────────────────────────────────────
export interface DayAnalytics {
  date: string;              // "2026-03-15"
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  noShows: number;
  totalCovers: number;
  totalRevenue: number;
  avgPartySize: number;
  occupancyRate: number;     // 0-100
  aiHandledCount: number;
  newClients: number;
  returningClients: number;
  topChannel: string;
  topService: string;
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  totalReservations: number;
  completedReservations: number;
  noShows: number;
  avgRating: number;
  totalRevenue: number;
}

export interface ServicePopularity {
  serviceName: string;
  category: string;
  totalBookings: number;
  totalRevenue: number;
  avgDuration: number;
  cancellationRate: number;
}

export interface HourlyDistribution {
  hour: number;              // 0-23
  count: number;
  avgCovers: number;
}

export interface PeakDay {
  date: string;
  dayName: string;
  reservations: number;
  covers: number;
}

// ── Export Options ────────────────────────────────────────────
export interface ExportOptions {
  format: "csv" | "pdf" | "json";
  dateRange: { from: string; to: string };
  includeReservations: boolean;
  includeClients: boolean;
  includeAnalytics: boolean;
  includeReviews: boolean;
  statusFilter?: ReservationStatus[];
}

// ── Helper Types ──────────────────────────────────────────────
export type ViewMode = "dashboard" | "reservations" | "calendar" | "ai" | "settings" | "clients" | "reports" | "waitlist";
