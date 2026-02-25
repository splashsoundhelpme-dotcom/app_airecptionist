# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ Ready for development

The template is a clean Next.js 16 starter with TypeScript and Tailwind CSS 4. It's ready for AI-assisted expansion to build any type of application.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Luxury salon booking page with FastAPI integration
  - BookingForm with cascade categoria→servizio, datetime picker, fetch POST to FastAPI
  - BusinessDashboard with PIN auth (1234), stats, filters, appointment list
  - Fiduciary Contract (Guard Contract) clause in form and footer
  - Hero section, services grid, dark footer
  - Playfair Display + Inter fonts, gold/cream luxury design system

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Full salon landing page | ✅ Ready |
| `src/app/layout.tsx` | Root layout (Playfair + Inter fonts) | ✅ Ready |
| `src/app/globals.css` | Luxury design system (gold/cream) | ✅ Ready |
| `src/components/BookingForm.tsx` | Booking form → POST /prenota | ✅ Ready |
| `src/components/BusinessDashboard.tsx` | PIN-protected appointments dashboard | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

Salon booking application is live. Backend must be running at `http://127.0.0.1:8000` with the FastAPI `/prenota` endpoint for the form to submit successfully.

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
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
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

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
