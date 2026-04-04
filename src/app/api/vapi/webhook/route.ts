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

      case "function-call": {
        const { functionCall } = message;
        if (functionCall?.name === "create_reservation") {
          const args = typeof functionCall.arguments === "string"
            ? JSON.parse(functionCall.arguments)
            : functionCall.arguments;
          
          const headers = req.headers;
          if (isSheetsConfigured(headers)) {
            await saveReservationFromCall({
              clientName: args.clientName,
              phone: args.phone,
              service: args.service,
              date: args.date,
              time: args.time,
              notes: args.notes,
            }, headers);
          }
          
          return NextResponse.json({
            result: `Prenotazione confermata per ${args.clientName} il ${args.date} alle ${args.time}. Grazie!`,
          });
        }
        return NextResponse.json({ result: "Funzione non riconosciuta" });
      }

      case "end-of-call-report":
      case "call.ended": {
        const transcript = message.transcript || [];
        const fullText = transcript.map((t: { role: string; content: string }) => `${t.role}: ${t.content}`).join("\n");
        console.log("[Vapi Webhook] Call ended. Transcript:", fullText);
        
        const transcriptContents = transcript.map((t: { content: string }) => t.content);
        const reservationData = extractReservationFromTranscript(transcriptContents);
        
        if (reservationData && isSheetsConfigured(req.headers)) {
          console.log("[Vapi Webhook] Saving reservation from transcript:", reservationData);
          await saveReservationFromCall(reservationData, req.headers);
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
