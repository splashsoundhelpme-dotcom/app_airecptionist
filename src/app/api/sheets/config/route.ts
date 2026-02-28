import { NextResponse } from "next/server";
import { readSheet, writeSheet, isSheetsConfigured } from "@/lib/googleSheets";

// GET /api/sheets/config - Leggi la configurazione
export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ 
      error: "Google Sheets non configurato",
      configured: false 
    }, { status: 503 });
  }

  try {
    const data = await readSheet("Configurazione!A:B");
    
    if (data.length === 0) {
      return NextResponse.json({ config: null, configured: true });
    }

    // La prima riga è l'header
    const config: Record<string, string> = {};
    data.slice(1).forEach((row) => {
      if (row[0]) {
        config[row[0]] = row[1] || "";
      }
    });

    return NextResponse.json({ config, configured: true });
  } catch (error) {
    console.error("Errore lettura configurazione:", error);
    return NextResponse.json({ error: "Errore nella lettura" }, { status: 500 });
  }
}

// POST /api/sheets/config - Salva la configurazione
export async function POST(request: Request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ 
      error: "Google Sheets non configurato",
      configured: false 
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    
    // Crea header
    const headers = ["chiave", "valore"];
    const rows = [headers];

    // Converti l'oggetto config in righe
    Object.entries(body).forEach(([key, value]) => {
      rows.push([key, typeof value === "string" ? value : JSON.stringify(value)]);
    });

    const success = await writeSheet("Configurazione!A:Z", rows);
    
    if (success) {
      return NextResponse.json({ success: true, configured: true });
    } else {
      return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
    }
  } catch (error) {
    console.error("Errore salvataggio configurazione:", error);
    return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
  }
}
