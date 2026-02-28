import { NextResponse } from "next/server";
import { isSheetsConfigured, getSpreadsheetId } from "@/lib/googleSheets";

// GET /api/sheets/status - Verifica configurazione Google Sheets
export async function GET() {
  const configured = isSheetsConfigured();
  const spreadsheetId = getSpreadsheetId();
  
  return NextResponse.json({ 
    configured,
    spreadsheetId: spreadsheetId || null,
    message: configured 
      ? "Google Sheets configurato correttamente"
      : "Configura le variabili d'ambiente per usare Google Sheets"
  });
}
