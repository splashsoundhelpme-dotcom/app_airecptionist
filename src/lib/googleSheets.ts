import { google } from "googleapis";

// Google Sheets configuration
// Supporta sia variabili d'ambiente che headers (passati dal client)

function getSpreadsheetIdFromEnv(): string {
  return process.env.GOOGLE_SHEET_ID || "";
}

// Estrai spreadsheet ID da headers (inviati dal client)
export function getSpreadsheetIdFromHeaders(headers: Headers): string {
  return headers.get("x-gsheet-id") || getSpreadsheetIdFromEnv();
}

function getSpreadsheetIdFromStorage(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("gsheet_id") || "";
}

export function getSpreadsheetId(): string {
  return getSpreadsheetIdFromEnv() || getSpreadsheetIdFromStorage();
}

// Crea l'auth client per il service account
export function getAuth(headers?: Headers) {
  console.log("[googleSheets getAuth] Starting...");
  
  // Prova prima le variabili d'ambiente
  let credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
  
  console.log("[googleSheets getAuth] Env credentials:", credentials.client_email ? "SET" : "EMPTY");

  // Se non ci sono env vars, prova gli header (passati dal client)
  if (!credentials.client_email || !credentials.private_key) {
    if (headers) {
      const emailFromHeader = headers.get("x-gsheet-email");
      const keyFromHeader = headers.get("x-gsheet-key");
      console.log("[googleSheets getAuth] Header credentials:", emailFromHeader ? "SET" : "EMPTY", "| key:", keyFromHeader ? "SET (" + keyFromHeader.length + ")" : "EMPTY");
      if (emailFromHeader && keyFromHeader) {
        credentials = {
          client_email: emailFromHeader,
          private_key: keyFromHeader.replace(/\\n/g, "\n"),
        };
      }
    }
  }

  // Se non ci sono env vars, prova localStorage (solo lato client)
  if (!credentials.client_email || !credentials.private_key) {
    if (typeof window !== "undefined") {
      const lsEmail = localStorage.getItem("gsheet_email");
      const lsKey = localStorage.getItem("gsheet_key");
      console.log("[googleSheets getAuth] localStorage credentials:", lsEmail ? "SET" : "EMPTY", "| key:", lsKey ? "SET (" + lsKey.length + ")" : "EMPTY");
      credentials = {
        client_email: lsEmail || undefined,
        private_key: lsKey || undefined,
      };
    }
  }

  if (!credentials.client_email || !credentials.private_key) {
    console.log("[googleSheets getAuth] NO CREDENTIALS FOUND - returning null");
    return null;
  }
  
  console.log("[googleSheets getAuth] Creating auth with email:", credentials.client_email);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth;
}

// Ottieni l'istanza di Google Sheets
export async function getSheets(headers?: Headers) {
  const auth = getAuth(headers);
  if (!auth) {
    return null;
  }
  return google.sheets({ version: "v4", auth });
}

// Leggi dati da un foglio
export async function readSheet(sheetName: string, headers?: Headers): Promise<string[][]> {
  const sheets = await getSheets(headers);
  const sheetId = getSpreadsheetIdFromHeaders(headers || new Headers()) || getSpreadsheetId();
  if (!sheets || !sheetId) {
    return [];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetName,
    });
    return response.data.values || [];
  } catch (error) {
    console.error(`Errore nella lettura del foglio ${sheetName}:`, error);
    return [];
  }
}

// Scrivi dati in un foglio
export async function writeSheet(sheetName: string, values: string[][], headers?: Headers): Promise<boolean> {
  const sheets = await getSheets(headers);
  const sheetId = getSpreadsheetIdFromHeaders(headers || new Headers()) || getSpreadsheetId();
  if (!sheets || !sheetId) {
    return false;
  }

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: sheetName,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
    return true;
  } catch (error) {
    console.error(`Errore nella scrittura del foglio ${sheetName}:`, error);
    return false;
  }
}

// Aggiungi una riga al foglio
export async function appendSheet(sheetName: string, values: string[], headers?: Headers): Promise<boolean> {
  const sheets = await getSheets(headers);
  const sheetId = getSpreadsheetIdFromHeaders(headers || new Headers()) || getSpreadsheetId();
  if (!sheets || !sheetId) {
    return false;
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: sheetName,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    });
    return true;
  } catch (error) {
    console.error(`Errore nell'aggiunta al foglio ${sheetName}:`, error);
    return false;
  }
}

// Verifica se Google Sheets è configurato
export function isSheetsConfigured(headers?: Headers): boolean {
  const sheetId = getSpreadsheetIdFromHeaders(headers || new Headers()) || getSpreadsheetId();
  const hasEnvCredentials = !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
  
  // Check headers for credentials
  const hasHeaderCredentials = !!(headers?.get("x-gsheet-email") && headers?.get("x-gsheet-key"));
  
  // Check localStorage for credentials
  const hasLocalStorage = typeof window !== "undefined" && !!(
    localStorage.getItem("gsheet_email") && 
    localStorage.getItem("gsheet_key")
  );
  
  return !!(sheetId && (hasEnvCredentials || hasHeaderCredentials || hasLocalStorage));
}
