import { NextResponse } from "next/server";

// GET /api/sheets/status - Verifica configurazione Google Sheets
export async function GET(request: Request) {
  const headers = request.headers;
  const hasLocalStorage = headers.get("x-gsheet-configured") === "true";
  
  // Leggi anche le credenziali dagli header (inviate dal client da localStorage)
  const clientEmail = headers.get("x-gsheet-email") || "";
  const privateKey = headers.get("x-gsheet-key") || "";
  const sheetIdFromHeader = headers.get("x-gsheet-id") || "";
  
  const envSheetId = process.env.GOOGLE_SHEET_ID || "";
  const hasEnvCredentials = !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
  
  // Usa i valori dagli header se disponibili, altrimenti usa le env vars
  const effectiveSheetId = sheetIdFromHeader || envSheetId;
  const effectiveHasCredentials = hasEnvCredentials || !!(clientEmail && privateKey);
  
  // Verifica se è configurato (tramite env vars O tramite header/client)
  const configured = hasLocalStorage || hasEnvCredentials;
  
  // Mostra un messaggio più utile
  let message = "";
  if (hasEnvCredentials && envSheetId) {
    message = "Google Sheets configurato con variabili d'ambiente";
  } else if (hasLocalStorage && effectiveSheetId) {
    message = "Google Sheets configurato correttamente";
  } else if (hasEnvCredentials && !envSheetId) {
    message = "Service Account configurato ma manca l'ID del foglio";
  } else if (hasLocalStorage && !effectiveSheetId) {
    message = "Service Account configurato ma manca l'ID del foglio";
  } else {
    message = "Configura Google Sheets per iniziare";
  }
  
  return NextResponse.json({ 
    configured,
    spreadsheetId: effectiveSheetId || null,
    message
  });
}
