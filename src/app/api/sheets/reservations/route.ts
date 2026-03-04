import { NextResponse } from "next/server";
import { readSheet, writeSheet, appendSheet, updateSheetRow, deleteSheetRow, isSheetsConfigured, getSpreadsheetIdFromHeaders } from "@/lib/googleSheets";

// GET /api/sheets/reservations - Leggi tutte le prenotazioni
export async function GET(request: Request) {
  const headers = request.headers;
  
  console.log("[sheets/reservations GET] Request received");
  const hasLocalStorage = headers.get("x-gsheet-configured") === "true";
  console.log("  - x-gsheet-configured:", hasLocalStorage);
  console.log("  - x-gsheet-id:", headers.get("x-gsheet-id")?.substring(0, 20) + "...");
  console.log("  - x-gsheet-email:", headers.get("x-gsheet-email"));
  
  if (!isSheetsConfigured(headers)) {
    console.log("  - isSheetsConfigured: FALSE");
    return NextResponse.json({ 
      error: "Google Sheets non configurato",
      configured: false 
    }, { status: 503 });
  }

  try {
    const data = await readSheet("Prenotazioni!A:L", headers);
    
    if (data.length === 0) {
      return NextResponse.json({ reservations: [], configured: true });
    }

    // La prima riga è l'header
    const headersRow = data[0];
    const reservations = data.slice(1).map((row) => {
      const obj: Record<string, string> = {};
      headersRow.forEach((header, i) => {
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
  const headers = request.headers;
  
  console.log("[sheets/reservations POST] Request received");
  const hasLocalStorage = headers.get("x-gsheet-configured") === "true";
  console.log("  - x-gsheet-configured:", hasLocalStorage);
  console.log("  - x-gsheet-id:", headers.get("x-gsheet-id")?.substring(0, 20) + "...");
  
  if (!isSheetsConfigured(headers)) {
    console.log("  - isSheetsConfigured: FALSE");
    return NextResponse.json({ 
      error: "Google Sheets non configurato",
      configured: false 
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    
    // Inizializza il foglio se vuoto
    const data = await readSheet("Prenotazioni!A1:L1", headers);
    if (data.length === 0) {
      // Crea header
      const headersRow = [
        "id", "cliente", "telefono", "email", "servizio", "data", "ora",
        "staff", "stato", "canale", "note", "creato"
      ];
      await writeSheet("Prenotazioni!A1:L1", [headersRow], headers);
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

    const success = await appendSheet("Prenotazioni", row, headers);
    
    if (success) {
      console.log("[sheets/reservations POST] Successfully wrote row to sheet");
      return NextResponse.json({ success: true, configured: true });
    } else {
      console.log("[sheets/reservations POST] FAILED to write row - check server logs");
      return NextResponse.json({ error: "Errore nell'inserimento", configured: true }, { status: 500 });
    }
  } catch (error) {
    console.error("Errore inserimento prenotazione:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Errore nell'inserimento", details: errorMessage, configured: true }, { status: 500 });
  }
}

// PUT /api/sheets/reservations - Aggiorna una prenotazione esistente
export async function PUT(request: Request) {
  const headers = request.headers;

  console.log("[sheets/reservations PUT] Request received");

  if (!isSheetsConfigured(headers)) {
    console.log("  - isSheetsConfigured: FALSE");
    return NextResponse.json({
      error: "Google Sheets non configurato",
      configured: false
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID prenotazione mancante" }, { status: 400 });
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

    const success = await updateSheetRow("Prenotazioni", id, row, headers);

    if (success) {
      console.log("[sheets/reservations PUT] Successfully updated row");
      return NextResponse.json({ success: true, configured: true });
    } else {
      console.log("[sheets/reservations PUT] FAILED to update row");
      return NextResponse.json({ error: "Errore nell'aggiornamento", configured: true }, { status: 500 });
    }
  } catch (error) {
    console.error("Errore aggiornamento prenotazione:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Errore nell'aggiornamento", details: errorMessage, configured: true }, { status: 500 });
  }
}

// DELETE /api/sheets/reservations - Cancella una prenotazione
export async function DELETE(request: Request) {
  const headers = request.headers;

  console.log("[sheets/reservations DELETE] Request received");

  if (!isSheetsConfigured(headers)) {
    console.log("  - isSheetsConfigured: FALSE");
    return NextResponse.json({
      error: "Google Sheets non configurato",
      configured: false
    }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID prenotazione mancante" }, { status: 400 });
    }

    const success = await deleteSheetRow("Prenotazioni", id, headers);

    if (success) {
      console.log("[sheets/reservations DELETE] Successfully deleted row");
      return NextResponse.json({ success: true, configured: true });
    } else {
      console.log("[sheets/reservations DELETE] FAILED to delete row");
      return NextResponse.json({ error: "Errore nella cancellazione", configured: true }, { status: 500 });
    }
  } catch (error) {
    console.error("Errore cancellazione prenotazione:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Errore nella cancellazione", details: errorMessage, configured: true }, { status: 500 });
  }
}
