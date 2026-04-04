import { NextRequest, NextResponse } from "next/server";
import { readSheet, writeSheet, isSheetsConfigured } from "@/lib/googleSheets";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function getApiKeyFromStorage(headers: Headers): Promise<string | null> {
  if (isSheetsConfigured(headers)) {
    try {
      const data = await readSheet("Configurazione!A:B", headers);
      const row = data.find((r) => r[0] === "geminiApiKey");
      if (row && row[1]) {
        return row[1];
      }
    } catch (e) {
      console.error("[API Key] Failed to read from sheets:", e);
    }
  }
  return null;
}

async function saveApiKeyToStorage(apiKey: string, headers: Headers): Promise<boolean> {
  if (!isSheetsConfigured(headers)) {
    return false;
  }
  try {
    const data = await readSheet("Configurazione!A1:B10", headers);
    let found = false;
    const rows = data.length > 0 ? data : [["chiave", "valore"]];
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === "geminiApiKey") {
        rows[i][1] = apiKey;
        found = true;
        break;
      }
    }
    
    if (!found) {
      rows.push(["geminiApiKey", apiKey]);
    }
    
    return await writeSheet("Configurazione!A1:B" + rows.length, rows, headers);
  } catch (e) {
    console.error("[API Key] Failed to save to sheets:", e);
    return false;
  }
}

// GET /api/config/gemini-key - Get API key status
export async function GET(request: Request) {
  const headers = request.headers;
  const apiKey = await getApiKeyFromStorage(headers);
  return NextResponse.json({ configured: !!apiKey });
}

// POST /api/config/gemini-key - Save API key
export async function POST(request: Request) {
  const headers = request.headers;
  
  try {
    const body = await request.json();
    const { apiKey } = body;
    
    if (!apiKey || apiKey.length < 20) {
      return NextResponse.json({ success: false, error: "Chiave API non valida" }, { status: 400 });
    }
    
    const saved = await saveApiKeyToStorage(apiKey, headers);
    
    if (saved) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Google Sheets non configurato" }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Errore nel salvataggio" }, { status: 500 });
  }
}
