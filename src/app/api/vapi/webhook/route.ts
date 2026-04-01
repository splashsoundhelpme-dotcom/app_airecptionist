import { NextRequest, NextResponse } from "next/server";

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
