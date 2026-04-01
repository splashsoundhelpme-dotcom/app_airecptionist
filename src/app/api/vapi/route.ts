import { NextRequest, NextResponse } from "next/server";

const VAPI_BASE = "https://api.vapi.ai";

function getApiKey(): string {
  const key = process.env.VAPI_API_KEY;
  if (!key) throw new Error("VAPI_API_KEY non configurata nel .env");
  return key;
}

function getPhoneId(): string {
  const id = process.env.VAPI_PHONE_NUMBER_ID;
  if (!id) throw new Error("VAPI_PHONE_NUMBER_ID non configurata nel .env");
  return id;
}

async function vapiRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`${VAPI_BASE}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Vapi API error: ${res.status}`);
  }
  return data;
}

function buildSystemPrompt(config: {
  businessName?: string;
  businessType?: string;
  aiPersonality?: string;
  services?: { name: string; duration?: number; price?: number }[];
  weekHours?: Record<string, { open: boolean; from: string; to: string }>;
  turni?: { name: string; from: string; to: string; active: boolean }[];
}): string {
  const servicesList = config.services?.map((s) => `- ${s.name}${s.duration ? ` (${s.duration} min)` : ""}${s.price ? ` - €${s.price}` : ""}`).join("\n") || "Nessun servizio configurato";

  const hoursList = config.weekHours
    ? Object.entries(config.weekHours)
        .filter(([, h]) => h.open)
        .map(([d, h]) => `${d}: ${h.from}-${h.to}`)
        .join(", ")
    : "Controlla gli orari sul sito";

  const turniList = config.turni
    ? config.turni.filter((t) => t.active).map((t) => `- ${t.name}: ${t.from}-${t.to}`).join("\n")
    : "";

  const personalityMap: Record<string, string> = {
    professionale: "Sei un assistente professionale e formale. Rispondi in modo chiaro e preciso.",
    amichevole: "Sei un assistente amichevole e cordiale. Usa un tono caldo e accogliente.",
    elegante: "Sei un assistente elegante e raffinato. Comunica con classe e distinzione.",
    diretto: "Sei un assistente diretto ed efficiente. Vai dritto al punto.",
  };

  const isRistorante = config.businessType === "ristorante";

  return `${personalityMap[config.aiPersonality || "professionale"] || personalityMap.professionale}

Lavori per "${config.businessName || "la nostra attività"}", un ${config.businessType || "attività"}.

Orari di apertura: ${hoursList}
${turniList ? `\nTurni disponibili:\n${turniList}` : ""}

Servizi disponibili:
${servicesList}

Il tuo compito è:
1. Rispondere alle chiamate dei clienti in modo cordiale
2. Fornire informazioni su servizi, orari e prezzi
${isRistorante
  ? "3. Prenotare tavoli chiedendo: nome, telefono, numero di coperti, data, ora e turno (pranzo o cena)\n4. Gestire cancellazioni e modifiche a prenotazioni esistenti\n5. Chiedere informazioni su allergie o richieste particolari"
  : "3. Prenotare appuntamenti chiedendo: nome, telefono, servizio desiderato, data e ora preferita\n4. Confermare o cancellare prenotazioni esistenti"
}
6. Rispondere a domande generiche sull'attività

Quando un cliente vuole prenotare, raccogli tutte le informazioni necessarie e conferma con il cliente prima di procedere.
Rispondi sempre in italiano. Sii conciso nelle risposte vocali (massimo 2-3 frasi per volta).`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create_assistant") {
      const { config } = body;
      const systemPrompt = buildSystemPrompt(config);

      const assistant = await vapiRequest("POST", "/assistant", {
        name: `${config.businessName || "Assistente"} AI`,
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          systemPrompt,
          temperature: 0.7,
          maxTokens: 300,
        },
        voice: {
          provider: "11labs",
          voiceId: "pNInz6obpgDQGcFmaJgB",
          stability: 0.5,
          similarityBoost: 0.75,
        },
        firstMessage: `Buongiorno! Benvenuto da ${config.businessName || "noi"}. Come posso aiutarti oggi?`,
        endCallMessage: "Grazie per averci chiamato! Buona giornata!",
        recordingEnabled: true,
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 600,
        backgroundSound: "off",
      });

      return NextResponse.json({ success: true, assistantId: assistant.id });
    }

    if (action === "make_call") {
      const { assistantId, customerNumber } = body;

      if (!assistantId || !customerNumber) {
        return NextResponse.json({ success: false, error: "Parametri mancanti" }, { status: 400 });
      }

      const call = await vapiRequest("POST", "/call", {
        phoneNumberId: getPhoneId(),
        assistantId,
        customer: { number: customerNumber },
      });

      return NextResponse.json({ success: true, callId: call.id });
    }

    if (action === "list_assistants") {
      const assistants = await vapiRequest("GET", "/assistant");
      return NextResponse.json({ success: true, assistants });
    }

    if (action === "list_phone_numbers") {
      const numbers = await vapiRequest("GET", "/phone-number");
      return NextResponse.json({ success: true, numbers });
    }

    if (action === "get_call") {
      const { callId } = body;
      const call = await vapiRequest("GET", `/call/${callId}`);
      return NextResponse.json({ success: true, call });
    }

    if (action === "status") {
      const hasKey = !!process.env.VAPI_API_KEY;
      const hasPhone = !!process.env.VAPI_PHONE_NUMBER_ID;
      return NextResponse.json({ success: true, configured: hasKey && hasPhone, hasKey, hasPhone });
    }

    if (action === "provision") {
      const { config } = body;
      const systemPrompt = buildSystemPrompt(config);

      const assistant = await vapiRequest("POST", "/assistant", {
        name: `${config.businessName || "Assistente"} AI`,
        model: {
          provider: "google",
          model: "gemini-2.5-flash",
          systemPrompt,
          temperature: 0.7,
          maxTokens: 300,
        },
        voice: {
          provider: "11labs",
          voiceId: "pNInz6obpgDQGcFmaJgB",
          stability: 0.5,
          similarityBoost: 0.75,
        },
        firstMessage: `Buongiorno! Benvenuto da ${config.businessName || "noi"}. Come posso aiutarti oggi?`,
        endCallMessage: "Grazie per averci chiamato! Buona giornata e a presto!",
        language: "it",
        recordingEnabled: true,
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 600,
        backgroundSound: "off",
      });

      let phoneNumber = null;
      try {
        phoneNumber = await vapiRequest("POST", "/phone-number", {
          name: `${config.businessName || "Business"} - ${config.phone || ""}`,
          assistantId: assistant.id,
        });
      } catch (phoneErr) {
        console.error("Failed to buy phone number:", phoneErr);
      }

      return NextResponse.json({
        success: true,
        assistantId: assistant.id,
        phoneNumber: phoneNumber ? {
          id: phoneNumber.id,
          number: phoneNumber.number,
        } : null,
      });
    }

    if (action === "suspend") {
      const { phoneNumberId } = body;
      if (!phoneNumberId) {
        return NextResponse.json({ success: false, error: "phoneNumberId mancante" }, { status: 400 });
      }
      await vapiRequest("PATCH", `/phone-number/${phoneNumberId}`, {
        assistantId: null,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "reactivate") {
      const { phoneNumberId, assistantId } = body;
      if (!phoneNumberId || !assistantId) {
        return NextResponse.json({ success: false, error: "Parametri mancanti" }, { status: 400 });
      }
      await vapiRequest("PATCH", `/phone-number/${phoneNumberId}`, {
        assistantId,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Azione non riconosciuta" }, { status: 400 });
  } catch (error) {
    console.error("Vapi API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Errore interno" },
      { status: 500 }
    );
  }
}
