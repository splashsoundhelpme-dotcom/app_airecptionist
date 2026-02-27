/**
 * POST /api/ai-chat
 *
 * Gemini-powered AI chat endpoint.
 * Enforces Fiduciary Mandate and Guard Contract policies.
 * Supports multi-tenant via business_id.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getBusinessId,
  createFiduciaryMandate,
  getFiduciarySystemPrompt,
} from "@/lib/multi-tenant";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AiChatRequest {
  messages: ChatMessage[];
  business_id?: string;
  businessName?: string;
  businessType?: string;
  // Context for the AI
  context?: {
    todayReservations?: number;
    pendingReservations?: number;
    services?: string[];
    openHours?: string;
  };
}

// ── Gemini API call ───────────────────────────────────────────────────────────

async function callGemini(
  systemPrompt: string,
  messages: ChatMessage[],
  apiKey: string
): Promise<string> {
  // Build Gemini contents array (user/model turns)
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  return text;
}

// ── Fallback simulated response ───────────────────────────────────────────────

function simulateAiResponse(userMessage: string, businessName: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("prenotat") || msg.includes("appuntament")) {
    return `Ho ricevuto la tua richiesta di prenotazione per ${businessName}. Per procedere, ho bisogno di: nome completo, servizio desiderato, data e ora preferita, e numero di telefono. Puoi fornirmi questi dettagli?`;
  }
  if (msg.includes("orari") || msg.includes("aperto") || msg.includes("chiuso")) {
    return `${businessName} è aperto dal lunedì al venerdì dalle 9:00 alle 19:00, e il sabato dalle 9:00 alle 17:00. La domenica siamo chiusi. Vuoi prenotare un appuntamento?`;
  }
  if (msg.includes("servizi") || msg.includes("prezzi") || msg.includes("costo")) {
    return `Offriamo una vasta gamma di servizi. Per informazioni dettagliate su prezzi e disponibilità, ti consiglio di contattarci direttamente o di prenotare una consulenza gratuita. Posso aiutarti a fissare un appuntamento?`;
  }
  if (msg.includes("cancell") || msg.includes("disdire") || msg.includes("annull")) {
    return `Capisco che tu voglia cancellare la prenotazione. Ricorda che le cancellazioni devono essere effettuate almeno 24 ore prima per evitare la penale no-show di €30 prevista dal nostro Guard Contract. Vuoi procedere con la cancellazione?`;
  }
  if (msg.includes("no show") || msg.includes("non si è presentato")) {
    return `Ho registrato il no-show. In base al Guard Contract, verrà applicata una penale di €30. Il cliente riceverà una notifica via WhatsApp ed email. Vuoi che proceda con l'invio della notifica?`;
  }

  return `Sono l'assistente AI di ${businessName}. Posso aiutarti con prenotazioni, informazioni sui servizi, orari e molto altro. Come posso assisterti oggi?`;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: AiChatRequest = await req.json();
    const { messages, businessName, businessType, context } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: messages" },
        { status: 400 }
      );
    }

    const businessId = body.business_id ?? getBusinessId(req);
    const resolvedBusinessName = businessName ?? businessId;

    // Establish Fiduciary Mandate
    const mandate = createFiduciaryMandate(businessId);
    const fiduciaryPrompt = getFiduciarySystemPrompt(mandate, resolvedBusinessName);

    // Build full system prompt
    const contextInfo = context
      ? `\nCONTESTO ATTUALE:\n- Prenotazioni oggi: ${context.todayReservations ?? 0}\n- In attesa: ${context.pendingReservations ?? 0}\n- Servizi disponibili: ${context.services?.join(", ") ?? "vedi catalogo"}\n- Orari: ${context.openHours ?? "vedi impostazioni"}`
      : "";

    const businessTypeInfo = businessType
      ? `\nTIPO ATTIVITÀ: ${businessType === "parrucchiere" ? "Parrucchiere 💇" : businessType === "estetista" ? "Estetista 💅" : "Ristorante 🍽️"}`
      : "";

    const systemPrompt = `${fiduciaryPrompt}${businessTypeInfo}${contextInfo}

LINGUA: Rispondi sempre in italiano, a meno che il cliente non scriva in un'altra lingua.
TONO: Professionale ma cordiale. Usa emoji con moderazione.
FORMATO: Risposte concise (max 3-4 frasi). Per liste usa punti elenco.`;

    const apiKey = process.env.GEMINI_API_KEY;

    let reply: string;
    let simulated = false;

    if (!apiKey || apiKey.startsWith("your_")) {
      // Dev mode: simulate
      const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
      reply = simulateAiResponse(lastUserMessage?.content ?? "", resolvedBusinessName);
      simulated = true;
    } else {
      reply = await callGemini(systemPrompt, messages, apiKey);
    }

    return NextResponse.json({
      success: true,
      reply,
      simulated,
      businessId,
      mandate: mandate.version,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[ai-chat] Error:", err);
    return NextResponse.json(
      { error: "AI chat error", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  const configured =
    !!process.env.GEMINI_API_KEY &&
    !process.env.GEMINI_API_KEY.startsWith("your_");

  return NextResponse.json({
    status: "AI Chat API is running",
    businessId,
    model: "gemini-1.5-flash",
    configured,
    features: ["fiduciary-mandate", "guard-contract", "multi-tenant", "italian-language"],
    methods: ["POST"],
  });
}
