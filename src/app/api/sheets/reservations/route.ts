import { NextResponse } from "next/server";
import { readSheet, writeSheet, appendSheet, isSheetsConfigured, getSheets } from "@/lib/googleSheets";

// GET /api/sheets/reservations - Leggi tutte le prenotazioni
export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ 
      error: "Google Sheets non configurato",
      configured: false 
    }, { status: 503 });
  }

  try {
    const data = await readSheet("Prenotazioni!A:L");
    
    if (data.length === 0) {
      return NextResponse.json({ reservations: [], configured: true });
    }

    // La prima riga è l'header
    const headers = data[0];
    const reservations = data.slice(1).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || "";
      });
      return obj;
    });

    return NextResponse.json({ reservations, configured: true });
  } catch (error) {
    console.error("Errore lettura prenotazioni:", error);
    return NextResponse.json({ error: "Errore nella lettura" }, { status: 500 });
  }
}

// POST /api/sheets/reservations - Aggiungi una prenotazione
export async function POST(request: Request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ 
      error: "Google Sheets non configurato",
      configured: false 
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    
    // Inizializza il foglio se vuoto
    const data = await readSheet("Prenotazioni!A1:L1");
    if (data.length === 0) {
      // Crea header
      const headers = [
        "id", "cliente", "telefono", "email", "servizio", "data", "ora",
        "staff", "stato", "canale", "note", "creato"
      ];
      await writeSheet("Prenotazioni!A1:L1", [headers]);
    }

    // Formatta i dati per la riga
    const row = [
      body.id || "",
      body.cliente || "",
      body.telefono || "",
      body.email || "",
      body.servizio || "",
      body.data || "",
      body.ora || "",
      body.staff || "",
      body.stato || "in_attesa",
      body.canale || "manuale",
      body.note || "",
      body.creato || new Date().toISOString(),
    ];

    const success = await appendSheet("Prenotazioni", row);
    
    if (success) {
      return NextResponse.json({ success: true, configured: true });
    } else {
      return NextResponse.json({ error: "Errore nell'inserimento" }, { status: 500 });
    }
  } catch (error) {
    console.error("Errore inserimento prenotazione:", error);
    return NextResponse.json({ error: "Errore nell'inserimento" }, { status: 500 });
  }
}
