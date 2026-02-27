/**
 * Multi-tenant business logic.
 *
 * Every API request carries a `business_id` (header or query param).
 * The AI assistant operates under a Fiduciary Mandate:
 *   - It acts exclusively in the interest of the registered business.
 *   - It never shares data across tenants.
 *   - It applies Guard Contract penalties for no-show reservations.
 *
 * Guard Contract (no-show penalty policy):
 *   - After a configurable number of no-shows, the client is flagged.
 *   - A penalty fee is recorded and the client may be blocked.
 */

import { NextRequest } from "next/server";

// ── Tenant resolution ─────────────────────────────────────────────────────────

/**
 * Extracts the business_id from a request.
 * Priority: header `x-business-id` → query param `business_id` → env default.
 */
export function getBusinessId(req: NextRequest): string {
  const fromHeader = req.headers.get("x-business-id");
  if (fromHeader) return fromHeader.trim();

  const fromQuery = req.nextUrl.searchParams.get("business_id");
  if (fromQuery) return fromQuery.trim();

  return process.env.DEFAULT_BUSINESS_ID ?? "twilight-lake-0344";
}

/**
 * Validates that a business_id is well-formed (alphanumeric + hyphens).
 */
export function isValidBusinessId(id: string): boolean {
  return /^[a-z0-9-]{3,64}$/.test(id);
}

// ── Fiduciary Mandate ─────────────────────────────────────────────────────────

export interface FiduciaryMandate {
  businessId: string;
  /** The AI must only act on behalf of this business. */
  actingFor: string;
  /** Timestamp when the mandate was established for this request. */
  issuedAt: string;
  /** Mandate version — bump when policy changes. */
  version: "1.0";
}

/**
 * Creates a Fiduciary Mandate for the current request context.
 * Attach this to every AI call to enforce tenant isolation.
 */
export function createFiduciaryMandate(businessId: string): FiduciaryMandate {
  return {
    businessId,
    actingFor: businessId,
    issuedAt: new Date().toISOString(),
    version: "1.0",
  };
}

/**
 * Returns the system prompt fragment that enforces the Fiduciary Mandate.
 * Inject this at the start of every AI conversation.
 */
export function getFiduciarySystemPrompt(mandate: FiduciaryMandate, businessName: string): string {
  return `
MANDATO FIDUCIARIO — ISTRUZIONI OPERATIVE VINCOLANTI
=====================================================
Sei l'assistente AI esclusivo di "${businessName}" (ID: ${mandate.businessId}).
Operi sotto Mandato Fiduciario versione ${mandate.version}, emesso il ${mandate.issuedAt}.

OBBLIGHI:
1. Agisci ESCLUSIVAMENTE nell'interesse di "${businessName}".
2. Non condividere MAI dati, prenotazioni o informazioni di altri clienti o attività.
3. Mantieni la riservatezza assoluta su tutti i dati del business.
4. Applica le penali del Guard Contract per i no-show (vedi sotto).
5. Conferma sempre le prenotazioni via email e WhatsApp quando disponibili.

GUARD CONTRACT — POLITICA NO-SHOW:
- Dopo ${GUARD_CONTRACT_CONFIG.noShowThreshold} no-show, il cliente viene segnalato come "a rischio".
- Dopo ${GUARD_CONTRACT_CONFIG.blockThreshold} no-show, il cliente viene bloccato automaticamente.
- La penale standard è di €${GUARD_CONTRACT_CONFIG.penaltyAmountEur} per no-show.
- Comunica sempre la politica no-show al momento della prenotazione.

CANALI GESTITI: Telefono (ElevenLabs), Email (SendGrid), WhatsApp (Meta Business API).
`.trim();
}

// ── Guard Contract ────────────────────────────────────────────────────────────

export const GUARD_CONTRACT_CONFIG = {
  /** Number of no-shows before flagging a client as "at risk". */
  noShowThreshold: 2,
  /** Number of no-shows before blocking a client. */
  blockThreshold: 3,
  /** Penalty amount in EUR per no-show. */
  penaltyAmountEur: 30,
  /** Whether to automatically send penalty notification. */
  autoNotify: true,
} as const;

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

/**
 * Evaluates the risk level for a client based on their no-show history.
 */
export function evaluateClientRisk(noShowCount: number): ClientRiskLevel {
  if (noShowCount >= GUARD_CONTRACT_CONFIG.blockThreshold) return "blocked";
  if (noShowCount >= GUARD_CONTRACT_CONFIG.noShowThreshold) return "at_risk";
  return "ok";
}

/**
 * Calculates the total penalty for a given number of no-shows.
 */
export function calculatePenalty(noShowCount: number): number {
  return noShowCount * GUARD_CONTRACT_CONFIG.penaltyAmountEur;
}

/**
 * Returns the Guard Contract message to send to a client after a no-show.
 */
export function getNoShowPenaltyMessage(
  clientName: string,
  businessName: string,
  noShowCount: number,
  penaltyEur: number
): string {
  const riskLevel = evaluateClientRisk(noShowCount);

  if (riskLevel === "blocked") {
    return `Gentile ${clientName}, a causa di ${noShowCount} no-show registrati presso ${businessName}, il suo account è stato bloccato. Penale totale: €${penaltyEur}. Per sbloccare l'account, contattare direttamente il negozio.`;
  }

  if (riskLevel === "at_risk") {
    return `Gentile ${clientName}, abbiamo registrato ${noShowCount} no-show presso ${businessName}. Penale applicata: €${penaltyEur}. Attenzione: un ulteriore no-show comporterà il blocco automatico dell'account.`;
  }

  return `Gentile ${clientName}, abbiamo registrato un no-show per la sua prenotazione presso ${businessName}. Penale applicata: €${GUARD_CONTRACT_CONFIG.penaltyAmountEur}. La preghiamo di disdire in anticipo le prenotazioni che non può rispettare.`;
}

// ── In-memory store for real-time AI stats (per business) ────────────────────
// In production, replace with a database (Redis / Postgres).

interface BusinessStats {
  aiHandledCount: number;
  lastUpdatedAt: string;
}

const statsStore = new Map<string, BusinessStats>();

export function getAiStats(businessId: string): BusinessStats {
  return statsStore.get(businessId) ?? { aiHandledCount: 0, lastUpdatedAt: new Date().toISOString() };
}

export function incrementAiHandled(businessId: string): BusinessStats {
  const current = getAiStats(businessId);
  const updated: BusinessStats = {
    aiHandledCount: current.aiHandledCount + 1,
    lastUpdatedAt: new Date().toISOString(),
  };
  statsStore.set(businessId, updated);
  return updated;
}

export function setAiHandledCount(businessId: string, count: number): BusinessStats {
  const updated: BusinessStats = {
    aiHandledCount: count,
    lastUpdatedAt: new Date().toISOString(),
  };
  statsStore.set(businessId, updated);
  return updated;
}
