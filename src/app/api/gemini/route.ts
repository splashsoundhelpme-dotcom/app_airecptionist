import { NextRequest, NextResponse } from "next/server";
import { readSheet, isSheetsConfigured } from "@/lib/googleSheets";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function getStoredApiKey(headers: Headers): Promise<string | null> {
  if (isSheetsConfigured(headers)) {
    try {
      const data = await readSheet("Configurazione!A:B", headers);
      const row = data.find((r) => r[0] === "geminiApiKey");
      if (row && row[1]) {
        return row[1];
      }
    } catch (e) {
      console.error("[Gemini Route] Failed to read API key from storage:", e);
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // Support API key from header, body, environment, or storage
    let apiKey = process.env.GEMINI_API_KEY;
    
    // Check header first (client-provided)
    const headerKey = req.headers.get("x-gemini-api-key");
    if (headerKey) {
      apiKey = headerKey;
    }
    
    // Check body
    if (!apiKey) {
      const body = await req.json();
      if (body.apiKey) {
        apiKey = body.apiKey;
      }
    }
    
    // Check Google Sheets storage
    if (!apiKey) {
      apiKey = await getStoredApiKey(req.headers) ?? undefined;
    }
    
    if (!apiKey) {
      console.error("[Gemini Route] GEMINI_API_KEY is undefined. Env check:", { 
        hasKey: !!process.env.GEMINI_API_KEY,
        allEnvKeys: Object.keys(process.env).filter(k => /GEMINI|VAPI|ELEVEN/.test(k)).join(", ")
      });
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY non configurata. Inserisci la chiave API nelle impostazioni." }, { status: 500 });
    }

    const body = await req.json();
    const { messages, systemPrompt } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: "Messaggi mancanti" }, { status: 400 });
    }

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const requestBody: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    if (systemPrompt) {
      requestBody.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.error?.message || `Gemini API error: ${res.status}`;
      console.error("Gemini API error:", data);
      return NextResponse.json({ success: false, error: errorMsg }, { status: res.status });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Nessuna risposta";

    return NextResponse.json({ success: true, response: text });
  } catch (error) {
    console.error("Gemini route error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Errore interno" },
      { status: 500 }
    );
  }
}
