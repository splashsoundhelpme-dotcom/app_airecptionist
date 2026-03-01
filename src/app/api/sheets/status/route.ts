import { NextResponse } from "next/server";

// GET /api/sheets/status - Verifica configurazione Google Sheets
export async function GET(request: Request) {
  // Prova a leggere i parametri dal localStorage tramite header custom
  const headers = request.headers;
  const hasLocalStorage = headers.get("x-gsheet-configured") === "true";
  
  const sheetId = process.env.GOOGLE_SHEET_ID || "";
  const hasEnvCredentials = !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
  
  const configured = hasLocalStorage || hasEnvCredentials;
  
  return NextResponse.json({ 
    configured,
    spreadsheetId: sheetId || null,
    message: configured 
      ? "Google Sheets configurato correttamente"
      : "Configura le variabili d'ambiente per usare Google Sheets"
  });
}
