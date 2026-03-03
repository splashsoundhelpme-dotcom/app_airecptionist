import { NextResponse } from "next/server";
import { google } from "googleapis";

// GET /api/sheets/status - Verifica configurazione Google Sheets
export async function GET(request: Request) {
  const headers = request.headers;
  const hasLocalStorage = headers.get("x-gsheet-configured") === "true";
  
  // Leggi le credenziali dagli header (inviate dal client da localStorage)
  const clientEmail = headers.get("x-gsheet-email") || "";
  const privateKey = headers.get("x-gsheet-key") || "";
  const sheetIdFromHeader = headers.get("x-gsheet-id") || "";
  
  console.log("[sheets/status] Request received:");
  console.log("  - hasLocalStorage:", hasLocalStorage);
  console.log("  - clientEmail:", clientEmail ? "SET" : "EMPTY");
  console.log("  - privateKey:", privateKey ? "SET (length: " + privateKey.length + ")" : "EMPTY");
  console.log("  - sheetIdFromHeader:", sheetIdFromHeader ? sheetIdFromHeader.substring(0, 20) + "..." : "EMPTY");
  console.log("  - all headers:", Object.fromEntries(headers.entries()));
  
  const envSheetId = process.env.GOOGLE_SHEET_ID || "";
  const hasEnvCredentials = !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
  
  // Usa i valori dagli header se disponibili, altrimenti usa le env vars
  const effectiveSheetId = sheetIdFromHeader || envSheetId;
  
  // Determina le credenziali da usare
  let credentials = null;
  if (hasEnvCredentials) {
    credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };
  } else if (clientEmail && privateKey) {
    credentials = {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
    };
  }
  
  // Verifica se è configurato (solo se abbiamo credenziali)
  const hasCredentials = hasEnvCredentials || !!(clientEmail && privateKey);
  const hasSheetId = !!effectiveSheetId;
  
  // Prova a fare una chiamata API reale per verificare che le credenziali funzionino
  let configured = false;
  let message = "";
  
  if (hasCredentials && hasSheetId && credentials) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      
      const sheets = google.sheets({ version: "v4", auth });
      
      // Prova a leggere il foglio per verificare l'accesso
      await sheets.spreadsheets.get({
        spreadsheetId: effectiveSheetId,
      });
      
      configured = true;
      message = "Google Sheets configurato e funzionante!";
    } catch (error: any) {
      console.error("Errore verifica Google Sheets:", error);
      
      if (error.response?.status === 404) {
        message = "Foglio Google non trovato. Verifica l'ID del foglio.";
      } else if (error.response?.status === 403) {
        message = "Accesso negato. Assicurati di aver condiviso il foglio con il Service Account.";
      } else if (error.message?.includes("invalid")) {
        message = "Credenziali non valide. Controlla l'email e la chiave privata.";
      } else {
        message = `Errore: ${error.message || "Impossibile connettersi a Google Sheets"}`;
      }
    }
  } else if (hasCredentials && !hasSheetId) {
    message = "Service Account configurato ma manca l'ID del foglio";
  } else if (!hasCredentials && hasSheetId) {
    message = "ID foglio presente ma mancano le credenziali del Service Account";
  } else {
    message = "Configura Google Sheets per iniziare";
  }
  
  return NextResponse.json({ 
    configured,
    spreadsheetId: effectiveSheetId || null,
    message
  });
}
