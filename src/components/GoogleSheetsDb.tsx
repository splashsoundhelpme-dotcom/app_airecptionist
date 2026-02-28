"use client";

import { useState, useEffect } from "react";

interface GoogleSheetsDbProps {
  onConfigured?: (configured: boolean) => void;
}

export default function GoogleSheetsDb({ onConfigured }: GoogleSheetsDbProps) {
  const [sheetId, setSheetId] = useState("10FYP5nopSgLc6_NTi9PsmLRnDiu62wswNqPh4vFXe2I");
  const [serviceEmail, setServiceEmail] = useState("sheets-access@plenary-chalice-487415-g7.iam.gserviceaccount.com");
  const [privateKey, setPrivateKey] = useState("-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCbEG4HaTJFBWCh\n8pSeN5SwNDjFbZR7j0VcYcqmECtKsuvlA6o+U3EfLilGNdkGFOCW4tpU7Pt0X5F\npPXdgIgnDL3f9fDEVHyAcBY2PTJkyR3XmiD0VAeCQyWxia5rc1PpBGanAkZjk06T\nRQMul6eEVC7Q/v4EVFQ9HPP9nayz5lUj5pNjLIxJNYQA3hgWw8baRe90+8PMf94+\n8iaqKV+S1KK6pH/CH2FRuGp2dtqdK4CiKxA2mOPm7YyImX/l2xhT/QL/rg0dICxA\nJBBJGHCj+WN29sz+XvtlEs7pZ7JoHk1HqdS3HEfrF8Bk7Wx1ZOd6XnhC7OyfTbr5\nfJVsUaI1AgMBAAECggEACLV3xIVJPDyk1HkDVjXxIJsxMCvSQVA80IU/huolqcQf\nS/VoDF/yGPC7SxR11mqSWB4tmoUHtDnhmmY9I8tZ+j16NYeh1dj75BfHe5TczXHJ\nMgh3RNmqUUvVpF678892nT3wyPz0+Jc3oMhNuTJtx14WAglsOVCGKaeEYZBXOIRH\nC+1T+9zBFzojYwXjtZdzpFP3Lg4ydX9uSp2rVjhzi8/VH9e3KQG3yRyJu0MYkPs7\nr6VZzcEe+oRgqNEjb8qxIHGxT6OK8HnF93CUuNFreNvZ7PtN8JEKrTHaaCMc0eoM\nfKqmnFXS9APWAHzeAqaSQOLuONPCwyEAaMpmTPG92QKBgQDN7yOJmuNicodcmgzD\nhTBgiZ7T6OELTUK1PAEAbubw0OQGLvGuRoRIDgVzu2B4dntmVaCURPkIGQHBke6/\nQdLORq7DikECg18rCZogubQMV4KjcKtfmb7Ms9CspKblKUxNdfbX+NgmZ+TnW8ud\nSWpWkYe+GdRN8MMwMso8JnspeQKBgQDAw0NmnqkK9Y/6bPicS2M4JgKwOoMdpT0j\n3Ij//G9TobqTJOVUXMksXjpJSM9Hhmvlctf3r2rGY/PiHEpxAnlH1ZK0AND/imum\n+R83QcNpwab7OWGaKHuU5gumpGtTlNRNJRlCm7QsynxYPUl8/vk73nILZUbCwG6m\nQ2XIuMkLnQKBgQCIYibr/As5aNYiytdHKc8XMC1i9GkOPhW+x0V2jvwdYoqRWcev\nfn4e5kJQGjlSrk0dQfo+F8vBxCX4l3hBbAt7ly4ozEgvrOd7LjnIEJSgU9ht+7FT\neBP3p+K8Y7MwM4CYEFbxQ5mLHeVoH9Aik7t8J5d5m8uR7rCmHAz5dxa8KQKBgCqL\nrpe60zLBCntKjADrPsYI1bUR5Rio/PqqVW6yx9ucqbKKhTd+l0R8s76zHFT8HVpy\nY6qehCGvtAenGOMimaQ6RnwGZhrQ8XvUJoiqsjfobzOp8Zn173jo4Y9xYOL8yXMR\niibCeR0dwB41wL+fA2Gscl2Dh/+6O3HlFFUeO/mdAoGAINOWpGstMsYM0kw118W8\n6rQHqb+xgqJCz4zy8zosQcWB+VJIO/qk6tUZRhPhU9nF4xPWi4T6tIu8LOCtp02K\niDv12G2wk/snXgjZ1E+F5qOmOPl2qfQqZ0XYRSvceGDD+v7vZiRwjaoZT1+VrC+u\nE/RzHZsBaMikXQFpOFWTuMU=\n-----END PRIVATE KEY-----");
  const [status, setStatus] = useState<{
    configured: boolean;
    checking: boolean;
    message: string;
  }>({ configured: false, checking: true, message: "" });

  // Check if Google Sheets is already configured on mount
  useEffect(() => {
    let mounted = true;
    
    const checkStatus = async () => {
      setStatus(prev => ({ ...prev, checking: true }));
      try {
        const res = await fetch("/api/sheets/status");
        const data = await res.json();
        if (mounted) {
          setStatus({
            configured: data.configured,
            checking: false,
            message: data.message,
          });
          onConfigured?.(data.configured);
        }
      } catch (error) {
        if (mounted) {
          setStatus({
            configured: false,
            checking: false,
            message: "Errore nella verifica della configurazione",
          });
        }
      }
    };
    
    checkStatus();
    
    return () => { mounted = false; };
  }, [onConfigured]);

  const handleSave = async () => {
    if (!sheetId || !serviceEmail || !privateKey) {
      setStatus(prev => ({
        ...prev,
        message: "Compila tutti i campi richiesti",
      }));
      return;
    }

    setStatus(prev => ({ ...prev, checking: true, message: "Salvataggio..." }));

    try {
      // Salva la configurazione nel localStorage (per demo - in produzione usa env)
      localStorage.setItem("gsheet_id", sheetId);
      localStorage.setItem("gsheet_email", serviceEmail);
      localStorage.setItem("gsheet_key", privateKey);

      setStatus({
        configured: true,
        checking: false,
        message: "Configurazione salvata!",
      });
      onConfigured?.(true);
    } catch (error) {
      setStatus({
        configured: false,
        checking: false,
        message: "Errore nel salvataggio",
      });
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("gsheet_id");
    localStorage.removeItem("gsheet_email");
    localStorage.removeItem("gsheet_key");
    setSheetId("");
    setServiceEmail("");
    setPrivateKey("");
    setStatus({
      configured: false,
      checking: false,
      message: "Disconnesso da Google Sheets",
    });
    onConfigured?.(false);
  };

  if (status.checking && !status.message) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Database Google Sheets</h3>
        </div>
        <div className="card-body">
          <p className="text-muted">Verifica configurazione...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">📊 Database Google Sheets</h3>
        <span className={`badge ${status.configured ? "badge-success" : "badge-warning"}`}>
          {status.configured ? "✅ Connesso" : "⚠️ Non configurato"}
        </span>
      </div>
      <div className="card-body">
        <p className="text-sm text-muted mb-4">
          Collega un foglio Google Sheets come database per le tue prenotazioni.
          I dati saranno salvati nel foglio invece che nel browser.
        </p>

        {status.message && (
          <div className={`alert ${status.configured ? "alert-success" : "alert-warning"} mb-4`}>
            {status.message}
          </div>
        )}

        {!status.configured && (
          <div className="form-group">
            <label className="form-label">ID Foglio Google</label>
            <input
              type="text"
              className="form-input"
              placeholder="es: 1abc123..."
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
            />
            <p className="text-xs text-muted mt-1">
              Trova l&apos;ID nell&apos;URL del tuo foglio: docs.google.com/spreadsheets/d/[ID]/edit
            </p>
          </div>
        )}

        {!status.configured && (
          <div className="form-group">
            <label className="form-label">Email Service Account</label>
            <input
              type="email"
              className="form-input"
              placeholder="es: nome@ progetto.iam.gserviceaccount.com"
              value={serviceEmail}
              onChange={(e) => setServiceEmail(e.target.value)}
            />
          </div>
        )}

        {!status.configured && (
          <div className="form-group">
            <label className="form-label">Chiave Privata</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="-----BEGIN PRIVATE KEY-----..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
            <p className="text-xs text-muted mt-1">
              Scaricala dalla console Google Cloud - IAM - Service Accounts
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {status.configured ? (
            <button className="btn btn-error" onClick={handleDisconnect}>
              Disconnetti
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSave}>
              Salva Configurazione
            </button>
          )}
        </div>

        {status.configured && (
          <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded">
            <p className="text-sm text-success">
              ✅ Google Sheets configurato! Le prenotazioni verranno salvate nel foglio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
