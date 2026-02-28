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
  - LoginGate: PIN auth with lockout after 5 failed attempts
  - SetupWizard: 5-step onboarding (business type, info, hours, AI config, security)
  - AdminApp: sidebar navigation with 5 views
  - DashboardView: stats, upcoming reservations, channel breakdown, AI summary
  - ReservationsView: full table with search/filter/sort, detail panel, status management
  - CalendarView: monthly calendar with day detail, restaurant capacity bar
  - AiAssistantView: chat interface, activity log, AI config panel
  - SettingsView: general, hours, services editor, staff editor, notifications, security
  - NewReservationModal: full form with service selector, staff assignment, channel picker
  - **Subscription system**: PricingPlans component with 3-day trial, monthly (€199.99), annual (€1999.99) plans with fake discounts
  - **API integrations**: ApiIntegrations component for Twilio (phone), SendGrid (email), WhatsApp Business API
  - Shared types (src/lib/types.ts) and store (src/lib/store.ts) with localStorage persistence
  - Admin design system (globals.css): neutral blue/slate palette, sidebar layout, tables, badges

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
| `src/components/views/SettingsView.tsx` | Settings panel | ✅ Ready |
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

- [ ] Connect real payment processing (Stripe/LemonSqueezy)
- [ ] Real AI integration (OpenAI/Anthropic API for actual call/email handling)
- [ ] Production API key configuration
- [ ] Export reservations to CSV/PDF
- [ ] Multi-user staff accounts

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-25 | Luxury salon booking page with FastAPI integration |
| 2026-02-25 | Complete rebuild as multi-business admin platform |
| 2026-02-25 | Added subscription system with pricing plans and 3-day trial |
| 2026-02-25 | Added API integrations for real-time data collection (Twilio, SendGrid, WhatsApp) |
| 2026-02-28 | Added Google Sheets database integration for reservations and config |
