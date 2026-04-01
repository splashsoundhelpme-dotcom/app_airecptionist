import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY non configurata" }, { status: 500 });
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
