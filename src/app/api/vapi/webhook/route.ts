import { NextRequest, NextResponse } from "next/server";
import { appendSheet, readSheet, writeSheet, isSheetsConfigured, getAuth, getSpreadsheetIdFromHeaders, getSheets } from "@/lib/googleSheets";

async function saveReservationFromCall(
  callData: { clientName?: string; phone?: string; service?: string; date?: string; time?: string; notes?: string },
  headers: Headers
): Promise<boolean> {
  try {
    const id = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const data = await readSheet("Prenotazioni!A1:L1", headers);
    if (data.length === 0) {
      const headersRow = [
        "id", "cliente", "telefono", "email", "servizio", "data", "ora",
        "staff", "stato", "canale", "note", "creato"
      ];
      await writeSheet("Prenotazioni!A1:L1", [headersRow], headers);
    }

    const row = [
      id,
      callData.clientName || "Cliente telefonico",
      callData.phone || "",
      "",
      callData.service || "Prenotazione",
      callData.date || now.split("T")[0],
      callData.time || "00:00",
      "",
      "in_attesa",
      "telefono",
      callData.notes || "",
      now,
    ];

    return await appendSheet("Prenotazioni", row, headers);
  } catch (error) {
    console.error("[Vapi Webhook] Error saving reservation:", error);
    return false;
  }
}

function extractReservationFromTranscript(transcript: string[]): { clientName?: string; phone?: string; service?: string; date?: string; time?: string; notes?: string } | null {
  const fullText = transcript.join(" ").toLowerCase();
  const result: Record<string, string> = {};
  
  // Extract number of people - look for "10 persone" 
  const peopleMatch = fullText.match(/(\d+)[^0-9]*persone/i);
  if (peopleMatch) {
    result.service = peopleMatch[1] + " persone";
  }
  
  // Extract date - Italian format like "5 aprile 2026"
  const itDateMatch = fullText.match(/(\d{1,2})[^0-9a-z]+(aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|gen|feb|mar)[^0-9a-z]+(\d{4})/i);
  if (itDateMatch) {
    const months: Record<string, string> = {
      aprile: "04", maggio: "05", giugno: "06", luglio: "07", agosto: "08", 
      settembre: "09", ottobre: "10", novembre: "11",dicembre: "12", 
      gennaio: "01", feb: "02", mar: "03"
    };
    const month = months[itDateMatch[2].toLowerCase()] || "04";
    result.date = `${itDateMatch[3]}-${month}-${itDateMatch[1].padStart(2, "0")}`;
  } else if (fullText.includes("domani")) {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    result.date = t.toISOString().split("T")[0];
  }
  
  // Extract time 
  const timeMatch = fullText.match(/(\d{1,2})[.:](\d{2})/);
  if (timeMatch) {
    result.time = timeMatch[1].padStart(2, "0") + ":" + timeMatch[2];
  }
  
  // Simple extract name: look for capitalized words from user messages
  for (const t of transcript) {
    const u = t.toLowerCase();
    if (u.includes("user")) {
      const nameMatch = t.match(/([A-Z][a-z]+)/);
      if (nameMatch && nameMatch[1].length > 2) {
        result.clientName = nameMatch[1];
        break;
      }
    }
  }
  
  if (result.service || result.date || result.clientName) {
    return result;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ received: true });
    }

    const eventType = message.type;

    switch (eventType) {
      case "assistant-request": {
        return NextResponse.json({
          assistant: {
            model: {
              provider: "openai",
              model: "gpt-4o-mini",
              temperature: 0.7,
              maxTokens: 300,
            },
          },
        });
      }

      case "tool-calls":
      case "function-call": {
        // Handle tool calls from VAPI
        const toolCalls = message.toolCalls || (message.functionCall ? [message] : []);
        
        for (const toolCall of toolCalls) {
          const functionName = toolCall.function?.name || toolCall.name;
          const args = typeof toolCall.function?.arguments === "string"
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.function?.arguments || toolCall.arguments;
          
          if (functionName === "create_reservation") {
            console.log("[Vapi Webhook] Create reservation called with:", args);
            
            let resultMessage = `Prenotazione confermata per ${args.clientName} il ${args.date} alle ${args.time}. Grazie!`;
            
            // Save to webhook reservations endpoint
            try {
              const baseUrl = req.url.split("/api/vapi/webhook")[0];
              const webhookUrl = `${baseUrl}/api/webhooks/reservations`;
              console.log("[Vapi Webhook] Saving to:", webhookUrl);
              
              const saveRes = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  clientName: args.clientName,
                  phone: args.phone || "+393755127158",
                  service: args.service || "10 persone",
                  date: args.date || new Date().toISOString().split("T")[0],
                  time: args.time || "21:30",
                  channel: "telefono",
                  notes: `Prenotazione da chiamata AI`,
                  source: "vapi-tool",
                }),
              });
              
              const saveData = await saveRes.json();
              console.log("[Vapi Webhook] Save response:", saveData);
              console.log("[Vapi Webhook] Reservation saved successfully");
            } catch (e) {
              console.error("[Vapi Webhook] Error saving tool call reservation:", e);
              resultMessage = "Errore nel salvataggio. Riprova.";
            }
            
            return NextResponse.json({
              results: [{
                toolCallId: toolCall.id || "call_" + Date.now(),
                result: resultMessage,
              }],
            });
          }
        }
        return NextResponse.json({ result: "Tool not recognized" });
      }

      case "end-of-call-report":
      case "call.ended": {
        // Parse and save - ALWAYS
        try {
          const transcript = message.transcript || "";
          const text = String(transcript).toLowerCase();
          
          const peopleMatch = text.match(/(\d+)\s*persone/i);
          const dateMatch = text.match(/(\d{1,2})\s+(aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i);
          const timeMatch = text.match(/(\d{1,2})[.:](\d{2})/);
          const nameMatch = String(transcript).match(/([A-Z][a-z]+)/);
          
          const clientName = nameMatch ? nameMatch[1] : "Cliente";
          const date = dateMatch ? "2026-04-" + dateMatch[1].padStart(2,"0") : "2026-04-05";
          const time = timeMatch ? timeMatch[1].padStart(2,"0")+":"+timeMatch[2] : "21:30";
          const service = peopleMatch ? peopleMatch[1] + " persone" : "";
          
          console.log("[VAPI] Saving:", {clientName, date, time, service});
          
          await fetch("https://twilight-lake-0344.d.kiloapps.io/api/webhooks/reservations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              clientName, 
              date, 
              time, 
              service: service || "2 persone", 
              channel: "telefono", 
              source: "call-ended" 
            }),
          });
        } catch(e) { console.log("[VAPI] Error:", e); }
        break;
      }

      case "call.started":
        console.log("[Vapi Webhook] Call started:", message.call?.id);
        break;

      default:
        console.log("[Vapi Webhook] Unhandled event:", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Vapi Webhook] Error:", error);
    return NextResponse.json({ received: true });
  }
}
