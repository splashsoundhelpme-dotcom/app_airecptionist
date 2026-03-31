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
  TurnoConfig,
  TableConfig,
  Client,
  MenuItem,
  Review,
  WaitlistEntry,
  BlackoutDate,
  SpecialEvent,
  RecurringReservation,
  LoyaltyReward,
  LoyaltyTransaction,
  ServiceItem,
  StaffMember,
  DayAnalytics,
  StaffPerformance,
  ServicePopularity,
  HourlyDistribution,
  TableZone,
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

// ── Default restaurant turni ──────────────────────────────────
export const DEFAULT_TURNI: TurnoConfig[] = [
  {
    id: "turno_pranzo",
    name: "Pranzo",
    from: "12:00",
    to: "15:00",
    maxCovers: 40,
    maxTables: 10,
    lastOrderMinutes: 30,
    bufferMinutes: 60,
    active: true,
    color: "#f59e0b",
    days: ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"],
  },
  {
    id: "turno_cena",
    name: "Cena",
    from: "19:00",
    to: "23:00",
    maxCovers: 50,
    maxTables: 12,
    lastOrderMinutes: 45,
    bufferMinutes: 0,
    active: true,
    color: "#8b5cf6",
    days: ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"],
  },
];

// ── Default tables ────────────────────────────────────────────
export const DEFAULT_TABLES: TableConfig[] = [
  { id: "t1", number: 1, seats: 2, minSeats: 1, zone: "interno", isCombinable: true, isActive: true },
  { id: "t2", number: 2, seats: 2, minSeats: 1, zone: "interno", isCombinable: true, isActive: true },
  { id: "t3", number: 3, seats: 4, minSeats: 2, zone: "interno", isCombinable: true, isActive: true },
  { id: "t4", number: 4, seats: 4, minSeats: 2, zone: "interno", isCombinable: true, isActive: true },
  { id: "t5", number: 5, seats: 6, minSeats: 3, zone: "interno", isCombinable: true, isActive: true },
  { id: "t6", number: 6, seats: 6, minSeats: 3, zone: "esterno", isCombinable: true, isActive: true },
  { id: "t7", number: 7, seats: 8, minSeats: 4, zone: "esterno", isCombinable: false, isActive: true },
  { id: "t8", number: 8, seats: 2, minSeats: 1, zone: "esterno", isCombinable: true, isActive: true },
  { id: "t9", number: 9, seats: 4, minSeats: 2, zone: "VIP", isCombinable: false, isActive: true, notes: "Riservato clienti premium" },
  { id: "t10", number: 10, seats: 10, minSeats: 6, zone: "VIP", isCombinable: false, isActive: true, notes: "Tavolo eventi privati" },
];

export const DEFAULT_TABLE_ZONES: TableZone[] = [
  { id: "z1", name: "Interno", color: "#3b82f6", isOutdoor: false },
  { id: "z2", name: "Esterno", color: "#22c55e", isOutdoor: true },
  { id: "z3", name: "VIP", color: "#a855f7", isOutdoor: false },
];

// ── Default services per business type ───────────────────────
export const DEFAULT_SERVICES: Record<BusinessType, ServiceItem[]> = {
  parrucchiere: [
    { id: "s1", name: "Taglio Capelli", duration: 45, price: 25, category: "Taglio", isActive: true },
    { id: "s2", name: "Taglio + Piega", duration: 75, price: 40, category: "Taglio", isActive: true },
    { id: "s3", name: "Colorazione", duration: 120, price: 70, category: "Colore", isActive: true },
    { id: "s4", name: "Highlights / Mèches", duration: 150, price: 90, category: "Colore", isActive: true },
    { id: "s5", name: "Piega", duration: 45, price: 20, category: "Styling", isActive: true },
    { id: "s6", name: "Trattamento Cheratina", duration: 180, price: 120, category: "Trattamenti", isActive: true },
    { id: "s7", name: "Extension Capelli", duration: 240, price: 200, category: "Extension", isActive: true },
    { id: "s8", name: "Trattamento Cuoio Capelluto", duration: 60, price: 35, category: "Trattamenti", isActive: true },
    { id: "s9", name: "Piega Sposa", duration: 120, price: 150, category: "Sposa", isActive: true },
    { id: "s10", name: "Maschera Nutriente", duration: 30, price: 15, category: "Trattamenti", isActive: true },
  ],
  estetista: [
    { id: "s1", name: "Pulizia Viso Profonda", duration: 60, price: 50, category: "Viso", isActive: true },
    { id: "s2", name: "Trattamento Anti-età", duration: 75, price: 70, category: "Viso", isActive: true },
    { id: "s3", name: "Manicure", duration: 45, price: 25, category: "Mani & Piedi", isActive: true },
    { id: "s4", name: "Pedicure Spa", duration: 60, price: 35, category: "Mani & Piedi", isActive: true },
    { id: "s5", name: "Nail Art", duration: 60, price: 40, category: "Mani & Piedi", isActive: true },
    { id: "s6", name: "Ceretta Gambe Intere", duration: 45, price: 30, category: "Ceretta", isActive: true },
    { id: "s7", name: "Ceretta Ascelle", duration: 20, price: 15, category: "Ceretta", isActive: true },
    { id: "s8", name: "Massaggio Rilassante", duration: 60, price: 55, category: "Massaggi", isActive: true },
    { id: "s9", name: "Massaggio Anticellulite", duration: 60, price: 60, category: "Massaggi", isActive: true },
    { id: "s10", name: "Trattamento Corpo", duration: 90, price: 80, category: "Corpo", isActive: true },
    { id: "s11", name: "Laminazione Ciglia", duration: 45, price: 45, category: "Ciglia & Sopracciglia", isActive: true },
    { id: "s12", name: "Microblading Sopracciglia", duration: 120, price: 200, category: "Ciglia & Sopracciglia", isActive: true },
  ],
  ristorante: [
    { id: "s1", name: "Pranzo", duration: 90, price: 0, category: "Pasto", isActive: true },
    { id: "s2", name: "Cena", duration: 120, price: 0, category: "Pasto", isActive: true },
    { id: "s3", name: "Brunch del Weekend", duration: 120, price: 0, category: "Brunch", isActive: true },
    { id: "s4", name: "Menu Degustazione", duration: 180, price: 0, category: "Speciale", isActive: true },
    { id: "s5", name: "Evento Privato", duration: 240, price: 0, category: "Speciale", isActive: true },
    { id: "s6", name: "Aperitivo", duration: 60, price: 0, category: "Aperitivo", isActive: true },
    { id: "s7", name: "Pizza & Birra", duration: 60, price: 0, category: "Informale", isActive: true },
    { id: "s8", name: "Cena Romantica", duration: 150, price: 0, category: "Speciale", isActive: true },
  ],
};

// ── Default menu items ────────────────────────────────────────
export const DEFAULT_MENU: MenuItem[] = [
  { id: "m1", name: "Bruschetta Mista", category: "Antipasti", price: 8, isVegetarian: true, isVegan: false, isGlutenFree: false, isAvailable: true },
  { id: "m2", name: "Caprese di Bufala", category: "Antipasti", price: 12, isVegetarian: true, isVegan: false, isGlutenFree: true, isAvailable: true },
  { id: "m3", name: "Carpaccio di Manzo", category: "Antipasti", price: 14, isVegetarian: false, isVegan: false, isGlutenFree: true, isAvailable: true },
  { id: "m4", name: "Spaghetti alla Carbonara", category: "Primi", price: 14, isVegetarian: false, isVegan: false, isGlutenFree: false, isAvailable: true, allergens: ["glutine", "uova"] },
  { id: "m5", name: "Risotto ai Funghi Porcini", category: "Primi", price: 16, isVegetarian: true, isVegan: false, isGlutenFree: true, isAvailable: true },
  { id: "m6", name: "Tagliatelle al Ragù", category: "Primi", price: 14, isVegetarian: false, isVegan: false, isGlutenFree: false, isAvailable: true, allergens: ["glutine", "uova"] },
  { id: "m7", name: "Filetto di Manzo", category: "Secondi", price: 28, isVegetarian: false, isVegan: false, isGlutenFree: true, isAvailable: true },
  { id: "m8", name: "Branzino al Forno", category: "Secondi", price: 24, isVegetarian: false, isVegan: false, isGlutenFree: true, isAvailable: true, allergens: ["pesce"] },
  { id: "m9", name: "Parmigiana di Melanzane", category: "Secondi", price: 16, isVegetarian: true, isVegan: false, isGlutenFree: true, isAvailable: true, allergens: ["lattosio"] },
  { id: "m10", name: "Tiramisù", category: "Dolci", price: 8, isVegetarian: true, isVegan: false, isGlutenFree: false, isAvailable: true, allergens: ["glutine", "lattosio", "uova"] },
  { id: "m11", name: "Panna Cotta", category: "Dolci", price: 7, isVegetarian: true, isVegan: false, isGlutenFree: true, isAvailable: true, allergens: ["lattosio"] },
  { id: "m12", name: "Acqua Naturale/Frizzante", category: "Bevande", price: 3, isVegetarian: true, isVegan: true, isGlutenFree: true, isAvailable: true },
  { id: "m13", name: "Vino della Casa (litro)", category: "Bevande", price: 18, isVegetarian: true, isVegan: true, isGlutenFree: true, isAvailable: true },
  { id: "m14", name: "Caffè Espresso", category: "Bevande", price: 2, isVegetarian: true, isVegan: true, isGlutenFree: true, isAvailable: true },
];

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
  turni: DEFAULT_TURNI,
  tables: DEFAULT_TABLES,
  tableZones: DEFAULT_TABLE_ZONES,
  menu: DEFAULT_MENU,
  staff: [],
  services: [],
  aiEnabled: true,
  aiPersonality: "professionale",
  aiLanguages: ["italiano"],
  aiAutoConfirm: false,
  notifyEmail: true,
  notifySms: false,
  notifyWhatsapp: false,
  adminPin: "1234",
  adminEmail: "",
  setupComplete: false,
  allowOnlineBooking: true,
  bookingAdvanceDays: 60,
  cancellationPolicyHours: 24,
  noShowPolicy: "warning",
  loyaltyEnabled: false,
  loyaltyPointsPerEuro: 1,
  reviewsEnabled: true,
  autoRequestReview: false,
  waitlistEnabled: true,
  waitlistAutoExpireHours: 48,
  subscription: createTrialSubscription(),
  apiIntegration: {
    ownerApiKeysConfigured: false,
    phoneEnabled: false,
    emailEnabled: false,
    whatsappEnabled: false,
    voiceEnabled: false,
    notifyOnNewReservation: true,
    notifyOnCancellation: true,
    notifyOnModification: true,
    aiModel: "gemini",
  },
};

// ── Storage keys ──────────────────────────────────────────────
const STORAGE_KEYS = {
  config: "admin_business_config",
  reservations: "admin_reservations",
  aiMessages: "admin_ai_messages",
  notifications: "admin_notifications",
  authenticated: "admin_authenticated",
  clients: "admin_clients",
  reviews: "admin_reviews",
  waitlist: "admin_waitlist",
  blackoutDates: "admin_blackout_dates",
  specialEvents: "admin_special_events",
  recurringReservations: "admin_recurring",
  loyaltyTransactions: "admin_loyalty_transactions",
};

// ── Generic get/set helpers ───────────────────────────────────
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Config ────────────────────────────────────────────────────
export function getConfig(): BusinessConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.config);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: BusinessConfig): void {
  setItem(STORAGE_KEYS.config, config);
}

// ── Reservations ──────────────────────────────────────────────
export function getReservations(): Reservation[] {
  return getItem<Reservation[]>(STORAGE_KEYS.reservations, []);
}

export function saveReservations(reservations: Reservation[]): void {
  setItem(STORAGE_KEYS.reservations, reservations);
}

// ── Clients CRM ───────────────────────────────────────────────
export function getClients(): Client[] {
  return getItem<Client[]>(STORAGE_KEYS.clients, []);
}

export function saveClients(clients: Client[]): void {
  setItem(STORAGE_KEYS.clients, clients);
}

export function getClientById(id: string): Client | undefined {
  return getClients().find((c) => c.id === id);
}

export function findOrCreateClient(name: string, phone?: string, email?: string): Client {
  const clients = getClients();
  const existing = clients.find(
    (c) => (phone && c.phone === phone) || (email && c.email === email) || c.firstName + " " + c.lastName === name
  );
  if (existing) return existing;

  const parts = name.trim().split(" ");
  const client: Client = {
    id: generateId(),
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    phone: phone || "",
    email: email,
    tags: [],
    totalVisits: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
    loyaltyPoints: 0,
    loyaltyTier: "bronzo",
    isActive: true,
    notifyEmail: false,
    notifySms: false,
    notifyWhatsapp: false,
    marketingConsent: false,
  };
  saveClients([...clients, client]);
  return client;
}

export function updateClientStats(clientId: string, spent: number): void {
  const clients = getClients();
  const idx = clients.findIndex((c) => c.id === clientId);
  if (idx === -1) return;
  clients[idx].totalVisits += 1;
  clients[idx].totalSpent += spent;
  clients[idx].lastVisit = new Date().toISOString();

  // Auto-tagging
  if (clients[idx].totalVisits >= 10 && !clients[idx].tags.includes("VIP")) {
    clients[idx].tags.push("VIP");
  }
  if (clients[idx].totalVisits >= 3 && !clients[idx].tags.includes("abituale")) {
    clients[idx].tags.push("abituale");
  }

  // Loyalty tier
  if (clients[idx].totalSpent >= 2000) clients[idx].loyaltyTier = "platino";
  else if (clients[idx].totalSpent >= 1000) clients[idx].loyaltyTier = "oro";
  else if (clients[idx].totalSpent >= 500) clients[idx].loyaltyTier = "argento";
  else clients[idx].loyaltyTier = "bronzo";

  saveClients(clients);
}

export function addLoyaltyPoints(clientId: string, points: number, description: string, reservationId?: string): void {
  const clients = getClients();
  const idx = clients.findIndex((c) => c.id === clientId);
  if (idx === -1) return;
  clients[idx].loyaltyPoints += points;
  saveClients(clients);

  const txns = getLoyaltyTransactions();
  txns.push({
    id: generateId(),
    clientId,
    type: points > 0 ? "earned" : "redeemed",
    points,
    description,
    reservationId,
    timestamp: new Date().toISOString(),
  });
  saveLoyaltyTransactions(txns);
}

// ── Loyalty Transactions ──────────────────────────────────────
export function getLoyaltyTransactions(): LoyaltyTransaction[] {
  return getItem<LoyaltyTransaction[]>(STORAGE_KEYS.loyaltyTransactions, []);
}

export function saveLoyaltyTransactions(txns: LoyaltyTransaction[]): void {
  setItem(STORAGE_KEYS.loyaltyTransactions, txns);
}

// ── Reviews ───────────────────────────────────────────────────
export function getReviews(): Review[] {
  return getItem<Review[]>(STORAGE_KEYS.reviews, []);
}

export function saveReviews(reviews: Review[]): void {
  setItem(STORAGE_KEYS.reviews, reviews);
}

export function getAverageRating(): number {
  const reviews = getReviews();
  if (reviews.length === 0) return 0;
  return Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;
}

// ── Waitlist ──────────────────────────────────────────────────
export function getWaitlist(): WaitlistEntry[] {
  return getItem<WaitlistEntry[]>(STORAGE_KEYS.waitlist, []);
}

export function saveWaitlist(entries: WaitlistEntry[]): void {
  setItem(STORAGE_KEYS.waitlist, entries);
}

// ── Blackout Dates ────────────────────────────────────────────
export function getBlackoutDates(): BlackoutDate[] {
  return getItem<BlackoutDate[]>(STORAGE_KEYS.blackoutDates, []);
}

export function saveBlackoutDates(dates: BlackoutDate[]): void {
  setItem(STORAGE_KEYS.blackoutDates, dates);
}

export function isDateBlackedOut(date: string, turnoId?: string): boolean {
  const blackouts = getBlackoutDates();
  const d = new Date(date);
  return blackouts.some((b) => {
    const bd = new Date(b.date);
    if (b.isRecurring) {
      if (bd.getMonth() === d.getMonth() && bd.getDate() === d.getDate()) {
        if (b.turnoIds && turnoId) return b.turnoIds.includes(turnoId);
        return true;
      }
    } else {
      if (bd.toDateString() === d.toDateString()) {
        if (!b.allDay && b.from && b.to) {
          const checkTime = d.getHours() * 60 + d.getMinutes();
          const [fh, fm] = b.from.split(":").map(Number);
          const [th, tm] = b.to.split(":").map(Number);
          return checkTime >= fh * 60 + fm && checkTime <= th * 60 + tm;
        }
        if (b.turnoIds && turnoId) return b.turnoIds.includes(turnoId);
        return true;
      }
    }
    return false;
  });
}

// ── Special Events ────────────────────────────────────────────
export function getSpecialEvents(): SpecialEvent[] {
  return getItem<SpecialEvent[]>(STORAGE_KEYS.specialEvents, []);
}

export function saveSpecialEvents(events: SpecialEvent[]): void {
  setItem(STORAGE_KEYS.specialEvents, events);
}

// ── Recurring Reservations ────────────────────────────────────
export function getRecurringReservations(): RecurringReservation[] {
  return getItem<RecurringReservation[]>(STORAGE_KEYS.recurringReservations, []);
}

export function saveRecurringReservations(recurring: RecurringReservation[]): void {
  setItem(STORAGE_KEYS.recurringReservations, recurring);
}

// ── AI Messages ───────────────────────────────────────────────
export function getAiMessages(): AiMessage[] {
  return getItem<AiMessage[]>(STORAGE_KEYS.aiMessages, []);
}

export function saveAiMessages(messages: AiMessage[]): void {
  setItem(STORAGE_KEYS.aiMessages, messages);
}

// ── Notifications ─────────────────────────────────────────────
export function getNotifications(): AppNotification[] {
  return getItem<AppNotification[]>(STORAGE_KEYS.notifications, []);
}

export function saveNotifications(notifications: AppNotification[]): void {
  setItem(STORAGE_KEYS.notifications, notifications);
}

export function addNotification(type: AppNotification["type"], title: string, message?: string): void {
  const notifs = getNotifications();
  notifs.unshift({
    id: generateId(),
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  });
  if (notifs.length > 50) notifs.length = 50;
  saveNotifications(notifs);
}

// ── Auth ──────────────────────────────────────────────────────
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

// ── Turni Helpers ─────────────────────────────────────────────
export function getActiveTurniForDay(turni: TurnoConfig[], dayName: string): TurnoConfig[] {
  return turni.filter((t) => t.active && t.days.includes(dayName));
}

export function getTurnoById(turni: TurnoConfig[], id: string): TurnoConfig | undefined {
  return turni.find((t) => t.id === id);
}

export function getTurnoForDateTime(turni: TurnoConfig[], dateTime: string): TurnoConfig | undefined {
  const d = new Date(dateTime);
  const dayIndex = d.getDay();
  const dayName = DAYS_IT[dayIndex === 0 ? 6 : dayIndex - 1];
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const timeMinutes = hours * 60 + minutes;

  return turni.find((t) => {
    if (!t.active || !t.days.includes(dayName)) return false;
    const [fh, fm] = t.from.split(":").map(Number);
    const [th, tm] = t.to.split(":").map(Number);
    return timeMinutes >= fh * 60 + fm && timeMinutes <= th * 60 + tm;
  });
}

export function getCoversInTurno(reservations: Reservation[], turnoId: string, date: string): number {
  return reservations
    .filter((r) => {
      const rDate = new Date(r.dateTime).toDateString();
      return rDate === new Date(date).toDateString() &&
        r.turnoId === turnoId &&
        r.status !== "cancellata";
    })
    .reduce((sum, r) => sum + (r.covers || 0), 0);
}

export function getTablesInTurno(reservations: Reservation[], turnoId: string, date: string): string[] {
  const tableIds = new Set<string>();
  reservations
    .filter((r) => {
      const rDate = new Date(r.dateTime).toDateString();
      return rDate === new Date(date).toDateString() &&
        r.turnoId === turnoId &&
        r.status !== "cancellata";
    })
    .forEach((r) => {
      if (r.tableIds) r.tableIds.forEach((id) => tableIds.add(id));
      else if (r.tableNumber) tableIds.add(`t${r.tableNumber}`);
    });
  return Array.from(tableIds);
}

export function getAvailableTables(
  tables: TableConfig[],
  reservations: Reservation[],
  turnoId: string,
  date: string,
  covers: number
): TableConfig[] {
  const occupiedIds = getTablesInTurno(reservations, turnoId, date);
  return tables.filter(
    (t) => t.isActive && !occupiedIds.includes(t.id) && t.seats >= covers && t.minSeats <= covers
  );
}

// ── Table Helpers ─────────────────────────────────────────────
export function getTablesForZone(tables: TableConfig[], zone: string): TableConfig[] {
  return tables.filter((t) => t.zone === zone && t.isActive);
}

// ── Analytics Helpers ─────────────────────────────────────────
export function calculateDayAnalytics(reservations: Reservation[], date: string, config: BusinessConfig): DayAnalytics {
  const dayRes = reservations.filter(
    (r) => new Date(r.dateTime).toDateString() === new Date(date).toDateString()
  );
  const completed = dayRes.filter((r) => r.status === "completata");
  const cancelled = dayRes.filter((r) => r.status === "cancellata");
  const noShows = dayRes.filter((r) => r.status === "no_show");
  const totalCovers = dayRes.filter((r) => r.status !== "cancellata").reduce((s, r) => s + (r.covers || 0), 0);
  const totalRevenue = completed.reduce((s, r) => s + (r.totalPrice || 0), 0);
  const aiHandled = dayRes.filter((r) => r.aiHandled);

  const clientIds = new Set(dayRes.filter((r) => r.clientId).map((r) => r.clientId));
  const clients = getClients();
  const newClients = [...clientIds].filter((id) => {
    const c = clients.find((cl) => cl.id === id);
    return c && c.totalVisits <= 1;
  }).length;

  // Channel breakdown
  const channelCounts: Record<string, number> = {};
  dayRes.forEach((r) => { channelCounts[r.channel] = (channelCounts[r.channel] || 0) + 1; });
  const topChannel = Object.entries(channelCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "—";

  // Service breakdown
  const serviceCounts: Record<string, number> = {};
  dayRes.forEach((r) => { serviceCounts[r.service] = (serviceCounts[r.service] || 0) + 1; });
  const topService = Object.entries(serviceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "—";

  const maxCovers = config.maxCovers || 100;

  return {
    date,
    totalReservations: dayRes.length,
    completedReservations: completed.length,
    cancelledReservations: cancelled.length,
    noShows: noShows.length,
    totalCovers,
    totalRevenue,
    avgPartySize: dayRes.length > 0 ? Math.round((totalCovers / dayRes.filter((r) => r.status !== "cancellata").length) * 10) / 10 : 0,
    occupancyRate: Math.round((totalCovers / maxCovers) * 100),
    aiHandledCount: aiHandled.length,
    newClients,
    returningClients: clientIds.size - newClients,
    topChannel,
    topService,
  };
}

export function calculateStaffPerformance(reservations: Reservation[], staff: StaffMember[]): StaffPerformance[] {
  return staff.map((s) => {
    const staffRes = reservations.filter((r) => r.staffId === s.id);
    const completed = staffRes.filter((r) => r.status === "completata");
    const reviews = getReviews().filter((r) => staffRes.some((sr) => sr.id === r.reservationId));
    const avgRating = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + (r.staffRating || r.rating), 0) / reviews.length) * 10) / 10
      : 0;

    return {
      staffId: s.id,
      staffName: s.name,
      totalReservations: staffRes.length,
      completedReservations: completed.length,
      noShows: staffRes.filter((r) => r.status === "no_show").length,
      avgRating,
      totalRevenue: completed.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
    };
  });
}

export function calculateServicePopularity(reservations: Reservation[], services: ServiceItem[]): ServicePopularity[] {
  const serviceMap = new Map<string, ServicePopularity>();

  services.forEach((s) => {
    if (!serviceMap.has(s.name)) {
      serviceMap.set(s.name, {
        serviceName: s.name,
        category: s.category,
        totalBookings: 0,
        totalRevenue: 0,
        avgDuration: s.duration,
        cancellationRate: 0,
      });
    }
  });

  reservations.forEach((r) => {
    const existing = serviceMap.get(r.service);
    if (existing) {
      existing.totalBookings += 1;
      existing.totalRevenue += r.totalPrice || 0;
    }
  });

  // Calculate cancellation rates
  serviceMap.forEach((pop, name) => {
    const total = reservations.filter((r) => r.service === name).length;
    const cancelled = reservations.filter((r) => r.service === name && r.status === "cancellata").length;
    pop.cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
  });

  return Array.from(serviceMap.values()).sort((a, b) => b.totalBookings - a.totalBookings);
}

export function calculateHourlyDistribution(reservations: Reservation[]): HourlyDistribution[] {
  const dist: Record<number, { count: number; totalCovers: number }> = {};
  for (let h = 0; h < 24; h++) dist[h] = { count: 0, totalCovers: 0 };

  reservations.filter((r) => r.status !== "cancellata").forEach((r) => {
    const h = new Date(r.dateTime).getHours();
    dist[h].count += 1;
    dist[h].totalCovers += r.covers || 0;
  });

  return Object.entries(dist).map(([h, d]) => ({
    hour: parseInt(h),
    count: d.count,
    avgCovers: d.count > 0 ? Math.round(d.totalCovers / d.count * 10) / 10 : 0,
  }));
}

export function getWeeklyTrend(reservations: Reservation[]): { day: string; reservations: number; revenue: number }[] {
  const now = new Date();
  const days: { day: string; reservations: number; revenue: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const dayRes = reservations.filter(
      (r) => new Date(r.dateTime).toDateString() === dayStr && r.status !== "cancellata"
    );
    days.push({
      day: d.toLocaleDateString("it-IT", { weekday: "short" }),
      reservations: dayRes.length,
      revenue: dayRes.reduce((s, r) => s + (r.totalPrice || 0), 0),
    });
  }
  return days;
}

export function getMonthlyRevenue(reservations: Reservation[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return reservations
    .filter((r) => r.status === "completata" && new Date(r.dateTime) >= monthStart)
    .reduce((s, r) => s + (r.totalPrice || 0), 0);
}

// ── Export ────────────────────────────────────────────────────
export function exportReservationsCSV(reservations: Reservation[]): string {
  const headers = ["ID", "Cliente", "Telefono", "Email", "Servizio", "Data", "Ora", "Coperti", "Tavolo", "Turno", "Canale", "Stato", "Note", "Creato il"];
  const rows = reservations.map((r) => {
    const d = new Date(r.dateTime);
    return [
      r.id,
      r.clientName,
      r.clientPhone || "",
      r.clientEmail || "",
      r.service,
      d.toLocaleDateString("it-IT"),
      d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
      r.covers || "",
      r.tableNumber || "",
      r.turnoId || "",
      r.channel,
      r.status,
      r.notes || "",
      new Date(r.createdAt).toLocaleString("it-IT"),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

export function exportClientsCSV(clients: Client[]): string {
  const headers = ["ID", "Nome", "Cognome", "Telefono", "Email", "Visite Totali", "Spesa Totale", "Ultima Visita", "Punti Fedeltà", "Tier", "Tag", "Creato il"];
  const rows = clients.map((c) => [
    c.id, c.firstName, c.lastName, c.phone, c.email || "",
    c.totalVisits, c.totalSpent,
    c.lastVisit ? new Date(c.lastVisit).toLocaleDateString("it-IT") : "",
    c.loyaltyPoints, c.loyaltyTier,
    c.tags.join("; "),
    new Date(c.createdAt).toLocaleDateString("it-IT"),
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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

export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2).replace(".", ",")}`;
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

export const LOYALTY_TIERS: Record<string, { label: string; color: string; minPoints: number; icon: string }> = {
  bronzo:   { label: "Bronzo",   color: "#cd7f32", minPoints: 0,    icon: "🥉" },
  argento:  { label: "Argento",  color: "#c0c0c0", minPoints: 500,  icon: "🥈" },
  oro:      { label: "Oro",      color: "#ffd700", minPoints: 1000, icon: "🥇" },
  platino:  { label: "Platino",  color: "#e5e4e2", minPoints: 2000, icon: "💎" },
};

export const DAYS_IT = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
export const DAYS_LABELS: Record<string, string> = {
  lunedi: "Lunedì", martedi: "Martedì", mercoledi: "Mercoledì",
  giovedi: "Giovedì", venerdi: "Venerdì", sabato: "Sabato", domenica: "Domenica",
};

export const ALLERGENS = [
  "glutine", "lattosio", "uova", "soia", "arachidi", "frutta a guscio",
  "sedano", "senape", "sesamo", "solfiti", "lupini", "molluschi", "crostacei", "pesce",
];

// ── Subscription helpers ──────────────────────────────────────
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

// ── Waitlist helpers ──────────────────────────────────────────
export const WAITLIST_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  in_attesa:   { label: "In Attesa",   color: "#f59e0b", icon: "⏳" },
  contattato:  { label: "Contattato",  color: "#3b82f6", icon: "📞" },
  confermato:  { label: "Confermato",  color: "#22c55e", icon: "✅" },
  scaduto:     { label: "Scaduto",     color: "#94a3b8", icon: "⏰" },
  rifiutato:   { label: "Rifiutato",   color: "#ef4444", icon: "❌" },
};

// End of file
