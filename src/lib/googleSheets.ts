import { google } from "googleapis";

// Google Sheets configuration
// Supporta sia variabili d'ambiente che localStorage (per configurazione lato client)

function getSpreadsheetIdFromEnv(): string {
  return process.env.GOOGLE_SHEET_ID || "";
}

function getSpreadsheetIdFromStorage(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("gsheet_id") || "";
}

export function getSpreadsheetId(): string {
  return getSpreadsheetIdFromEnv() || getSpreadsheetIdFromStorage();
}

// Crea l'auth client per il service account
function getAuth() {
  // Prova prima le variabili d'ambiente
  let credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  // Se non ci sono env vars, prova localStorage
  if (!credentials.client_email || !credentials.private_key) {
    if (typeof window !== "undefined") {
      credentials = {
        client_email: localStorage.getItem("gsheet_email") || undefined,
        private_key: localStorage.getItem("gsheet_key") || undefined,
      };
    }
  }

  if (!credentials.client_email || !credentials.private_key) {
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth;
}

// Ottieni l'istanza di Google Sheets
export async function getSheets() {
  const auth = getAuth();
  if (!auth) {
    return null;
  }
  return google.sheets({ version: "v4", auth });
}

// Leggi dati da un foglio
export async function readSheet(sheetName: string): Promise<string[][]> {
  const sheets = await getSheets();
  const sheetId = getSpreadsheetId();
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
export async function writeSheet(sheetName: string, values: string[][]): Promise<boolean> {
  const sheets = await getSheets();
  const sheetId = getSpreadsheetId();
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
export async function appendSheet(sheetName: string, values: string[]): Promise<boolean> {
  const sheets = await getSheets();
  const sheetId = getSpreadsheetId();
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
export function isSheetsConfigured(): boolean {
  const sheetId = getSpreadsheetId();
  const hasCredentials = !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
  const hasLocalStorage = typeof window !== "undefined" && !!(
    localStorage.getItem("gsheet_email") && 
    localStorage.getItem("gsheet_key")
  );
  return !!(sheetId && (hasCredentials || hasLocalStorage));
}
