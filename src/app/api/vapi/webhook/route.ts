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
  
  const phoneMatch = fullText.match(/(\+?39\s?3\d{2}[.\s]?\d{6,8})/);
  const dateMatch = fullText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  const timeMatch = fullText.match(/ore?(\d{1,2})[:.](\d{2})/);
  
  let clientName = "Cliente telefonico";
  const nameMatches = transcript.filter(t => t.toLowerCase().includes("mi chiamo") || t.toLowerCase().includes("sono"));
  if (nameMatches.length > 0) {
    const namePart = nameMatches[0].replace(/mi chiamo|sono/i, "").trim();
    if (namePart.length > 2 && namePart.length < 50) {
      clientName = namePart.replace(/[^\w\s]/g, "").trim();
    }
  }

  if (!phoneMatch && !dateMatch) {
    return null;
  }

  return {
    clientName,
    phone: phoneMatch ? phoneMatch[1].replace(/\s/g, "") : undefined,
    date: dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : undefined,
    time: timeMatch ? `${timeMatch[2]}:${timeMatch[3]}` : undefined,
    notes: `Transcrizione: ${transcript.join(" | ")}`,
  };
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
        const transcript = message.transcript || [];
        const fullText = transcript.map((t: { role: string; content: string }) => `${t.role}: ${t.content}`).join("\n");
        console.log("[Vapi Webhook] Call ended. Transcript:", fullText);
        
        const transcriptContents = transcript.map((t: { content: string }) => t.content);
        const reservationData = extractReservationFromTranscript(transcriptContents);
        
        if (reservationData) {
          console.log("[Vapi Webhook] Saving reservation from transcript:", reservationData);
          
          try {
            await fetch(req.url.replace("/api/vapi/webhook", "/api/webhooks/reservations"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...reservationData,
                source: "vapi-call",
              }),
            });
          } catch (fetchError) {
            console.error("[Vapi Webhook] Failed to save reservation:", fetchError);
          }
        }
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
