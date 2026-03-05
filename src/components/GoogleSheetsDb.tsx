"use client";

import { useState, useEffect } from "react";

interface GoogleSheetsDbProps {
  onConfigured?: (configured: boolean) => void;
}

export default function GoogleSheetsDb({ onConfigured }: GoogleSheetsDbProps) {
  const [sheetId, setSheetId] = useState("");
  const [serviceEmail, setServiceEmail] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [status, setStatus] = useState<{
    configured: boolean;
    checking: boolean;
    message: string;
  }>({ configured: false, checking: true, message: "" });

  // Check
  useEffect(() => {
    let mounted = true;
    
    const checkStatus = async () => {
      setStatus(prev => ({ ...prev, checking: true }));
      try {
        // Check if localStorage has credentials
        const hasLocalStorage = typeof window !== "undefined" && !!(
          localStorage.getItem("gsheet_id") &&
          localStorage.getItem("gsheet_email") && 
          localStorage.getItem("gsheet_key")
        );
        
        // Build headers with localStorage values
        const headers: Record<string, string> = {};
        if (hasLocalStorage) {
          headers["x-gsheet-configured"] = "true";
          headers["x-gsheet-id"] = localStorage.getItem("gsheet_id") || "";
          headers["x-gsheet-email"] = localStorage.getItem("gsheet_email") || "";
          headers["x-gsheet-key"] = localStorage.getItem("gsheet_key") || "";
        }
        
        const res = await fetch("/api/sheets/status", { headers });
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

    // Test credentials by making an API call
    try {
      const testHeaders: Record<string, string> = {
        "x-gsheet-configured": "true",
        "x-gsheet-id": sheetId,
        "x-gsheet-email": serviceEmail,
        "x-gsheet-key": privateKey,
      };
      
      const testRes = await fetch("/api/sheets/status", { headers: testHeaders });
      const testData = await testRes.json();
      
      console.log("[GoogleSheetsDb] Status response:", testData);
      
      if (!testData.configured) {
        setStatus({
          configured: false,
          checking: false,
          message: testData.message || testData.error || "Credenziali non valide",
        });
        return;
      }
      
      // Salva la configurazione nel localStorage solo se le credenziali funzionano
      localStorage.setItem("gsheet_id", sheetId);
      localStorage.setItem("gsheet_email", serviceEmail);
      localStorage.setItem("gsheet_key", privateKey);

      setStatus({
        configured: true,
        checking: false,
        message: "Configurazione salvata e verificata!",
      });
      onConfigured?.(true);
    } catch (error: any) {
      console.error("[GoogleSheetsDb] Error testing credentials:", error);
      setStatus({
        configured: false,
        checking: false,
        message: error?.message || "Errore nella verifica delle credenziali",
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
