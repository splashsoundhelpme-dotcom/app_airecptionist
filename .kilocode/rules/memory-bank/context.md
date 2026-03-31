# Active Context: Multi-business Admin Platform with Subscription System

## Current State

**Template Status**: ✅ Admin platform with subscription & API integrations

Complete admin platform for hairdressers, beauty salons, and restaurants with subscription billing, real-time API integrations, and integrated AI assistant.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] **Multi-business admin platform** (complete rebuild)
- [x] **Restaurant Turni (Shifts) System** - FULL
  - TurnoConfig type with name, time range, max covers/tables, buffer time, active days, color
  - TurniEditor in SettingsView: add/edit/delete shifts, configure per-day availability
  - Default turni: Pranzo (12-15) and Cena (19-23)
  - NewReservationModal: turno selector shows available covers per shift
  - ReservationsView: turno column + turno filter dropdown
  - CalendarView: per-turno capacity bars per day
  - DashboardView: turno capacity stats for today
- [x] **Table Management (Tavoli) System** - FULL
  - TableConfig type with number, seats, min seats, zone, combinable, notes
  - TableZone type for grouping tables (interno, esterno, VIP)
  - TavoliEditor in SettingsView: add/edit/delete tables, manage zones
  - Default 10 tables across 3 zones
  - NewReservationModal: table selector showing available tables per turno
- [x] **Client CRM System** - FULL
  - Client type with contact info, visit history, loyalty points/tier, tags, allergies
  - ClientsView: search, filter by tier, sort by name/visits/spending, detail panel
  - Auto-tagging: VIP (10+ visits), abituale (3+ visits)
  - Loyalty tiers: Bronzo, Argento, Oro, Platino
  - Store helpers: findOrCreateClient, updateClientStats, addLoyaltyPoints
- [x] **Reports & Analytics** - FULL
  - ReportsView with 4 tabs: Panoramica, Servizi, Orari, Esporta
  - Service popularity analysis, hourly distribution, weekly trends
  - Export to CSV: reservations and clients
  - Analytics helpers: calculateDayAnalytics, calculateStaffPerformance, calculateServicePopularity, calculateHourlyDistribution, getWeeklyTrend, getMonthlyRevenue
- [x] **Enhanced Types** - 40+ new interfaces
  - TurnoConfig, TableConfig, TableZone, MenuItem, Client, Review, WaitlistEntry, BlackoutDate, SpecialEvent, RecurringReservation, LoyaltyReward, LoyaltyTransaction
  - DayAnalytics, StaffPerformance, ServicePopularity, HourlyDistribution
- [x] **Enhanced Store** - 50+ helper functions
  - Turni helpers: getActiveTurniForDay, getTurnoById, getTurnoForDateTime, getCoversInTurno, getTablesInTurno, getAvailableTables
  - Client helpers: getClients, saveClients, findOrCreateClient, updateClientStats
  - Export: exportReservationsCSV, exportClientsCSV, downloadCSV
  - Notifications: addNotification helper
  - Blackout dates: isDateBlackedOut with recurring support
- [x] **Settings Enhancements**
  - New tabs: Turni (shifts), Tavoli (tables) for restaurants
  - PIVA/Codice Fiscale fields, cuisine type, price range
  - Online booking config, cancellation policy, no-show policy
  - AI auto-confirm, greeting message
  - Loyalty program toggle, reviews toggle, waitlist toggle
  - Notification before appointment timing

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/lib/googleSheets.ts` | Google Sheets API client | ✅ Ready |
| `src/app/api/sheets/reservations/route.ts` | Reservations API (GET/POST) | ✅ Ready |
| `src/app/api/sheets/config/route.ts` | Config API (GET/POST) | ✅ Ready |
| `src/app/api/sheets/status/route.ts` | Status API | ✅ Ready |
|----------------|---------|--------|
| `src/app/page.tsx` | Entry point → LoginGate | ✅ Ready |
| `src/app/layout.tsx` | Root layout (Inter font) | ✅ Ready |
| `src/app/globals.css` | Admin design system | ✅ Ready |
| `src/lib/types.ts` | Shared TypeScript types | ✅ Ready |
| `src/lib/store.ts` | localStorage store + helpers | ✅ Ready |
| `src/components/LoginGate.tsx` | Auth gate + routing | ✅ Ready |
| `src/components/SetupWizard.tsx` | 5-step onboarding wizard | ✅ Ready |
| `src/components/AdminApp.tsx` | Main app shell + sidebar | ✅ Ready |
| `src/components/NewReservationModal.tsx` | Add reservation modal | ✅ Ready |
| `src/components/PricingPlans.tsx` | Subscription pricing page | ✅ Ready |
| `src/components/ApiIntegrations.tsx` | API integrations settings | ✅ Ready |
| `src/components/GoogleSheetsDb.tsx` | Google Sheets DB configuration | ✅ Ready |
| `src/components/views/DashboardView.tsx` | Overview dashboard | ✅ Ready |
| `src/components/views/ReservationsView.tsx` | Reservations table | ✅ Ready |
| `src/components/views/CalendarView.tsx` | Monthly calendar | ✅ Ready |
| `src/components/views/AiAssistantView.tsx` | AI chat + activity | ✅ Ready |
| `src/components/views/SettingsView.tsx` | Settings panel (turni/tavoli for ristorante) | ✅ Ready |
| `src/components/views/ClientsView.tsx` | Client CRM | ✅ Ready |
| `src/components/views/ReportsView.tsx` | Analytics & Export | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

Admin platform is complete and self-contained (no backend required — uses localStorage). 

**First-time flow**: Pricing Plans → Setup Wizard (5 steps) → Login (PIN) → Dashboard

**Subscription Plans**:
- 🎁 Prova Gratuita: 3 giorni gratis
- 📅 Mensile: €199.99/mese (fake sconto da €299.99)
- 📆 Annuale: €1999.99/anno (fake sconto da €2399.88)

**Business types supported**:
- 💇 Parrucchiere: services, staff management, appointment booking
- 💅 Estetista: treatments, staff management, appointment booking  
- 🍽️ Ristorante: covers/tables, capacity tracking, meal bookings

**Reservation channels**: Email, Telefono, SMS, WhatsApp, Online, Manuale, AI

**AI Assistant**: Simulated responses to natural language queries about reservations, hours, services, stats. Tracks AI-handled reservations.

**API Integrations**: Real-time data collection from:
- 📞 Chiamate telefoniche (Twilio)
- ✉️ Email (SendGrid)  
- 💬 WhatsApp Business (Meta)
- 🌐 Webhook per eventi

**Google Sheets Database**: Opzionale - configura un foglio Google Sheets come database per le prenotazioni:
- 📊 Foglio "Prenotazioni" per i dati delle prenotazioni
- 📋 Foglio "Configurazione" per le impostazioni
- 🔐 Service Account richiesto per l'accesso

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="btn btn-primary">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [x] Fix Google Sheets integration - credentials now passed via headers from client
- [x] Add debugging for Google Sheets credential verification errors
- [x] Export reservations to CSV
- [ ] Real AI integration (OpenAI/Anthropic/Gemini API for actual call/email handling)
- [ ] Production API key configuration
- [ ] Multi-user staff accounts
- [ ] Waitlist UI component
- [ ] Blackout dates management UI
- [ ] Special events management UI
- [ ] Review system UI
- [ ] Recurring reservations generation

## Session History

| Date | Changes |
|------|---------|
| 2026-03-31 | **Major feature expansion**: Restaurant turni system, table management, client CRM, reports/analytics, export CSV. Added 40+ types, 50+ store helpers. New views: ClientsView, ReportsView. Enhanced all existing views with shift support. |
| 2026-03-05 | Added debugging for Google Sheets credential verification - now shows detailed error messages |
| 2026-03-04 | Added full Google Sheets sync: PUT/DELETE APIs for update/delete reservations, with updateSheetRow() and deleteSheetRow() helpers |
| 2026-03-04 | Added detailed debugging logs for Google Sheets credential verification |
| 2026-03-03 | Fixed Google Sheets integration - credentials now passed via headers from client |
| 2026-02-25 | Luxury salon booking page with FastAPI integration |
| 2026-02-25 | Complete rebuild as multi-business admin platform |
| 2026-02-25 | Added subscription system with pricing plans and 3-day trial |
| 2026-02-25 | Added API integrations for real-time data collection (Twilio, SendGrid, WhatsApp) |
| 2026-02-28 | Added Google Sheets database integration for reservations and config |
