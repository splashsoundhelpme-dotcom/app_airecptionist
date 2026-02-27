/**
 * POST /api/webhook-voice
 *
 * Receives booking data from ElevenLabs voice AI.
 * On each booking:
 *   1. Increments the "Gestite da AI" counter for the business.
 *   2. Sends a confirmation email via SendGrid.
 *   3. Sends a confirmation WhatsApp message via Meta Business API.
 *   4. Returns updated stats so the dashboard can refresh in real-time.
 *
 * Expected payload from ElevenLabs:
 * {
 *   "business_id": "twilight-lake-0344",   // optional, falls back to header/env
 *   "event": "booking_created",
 *   "reservation": {
 *     "clientName": "Mario Rossi",
 *     "clientPhone": "+39...",
 *     "clientEmail": "mario@example.com",
 *     "service": "Taglio Capelli",
 *     "dateTime": "2026-03-01T10:00:00.000Z",
 *     "duration": 45,
 *     "notes": "...",
 *     "aiTranscript": "..."
 *   },
 *   "businessName": "Salone Bella",
 *   "businessEmail": "info@salone.it"
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getBusinessId,
  isValidBusinessId,
  createFiduciaryMandate,
  incrementAiHandled,
  getAiStats,
  evaluateClientRisk,
  getNoShowPenaltyMessage,
} from "@/lib/multi-tenant";
import { getConfiguredIntegrations } from "@/lib/env";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VoiceWebhookPayload {
  business_id?: string;
  event: "booking_created" | "booking_cancelled" | "no_show" | "inquiry";
  reservation?: {
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    service: string;
    dateTime: string;
    duration?: number;
    covers?: number;
    notes?: string;
    aiTranscript?: string;
  };
  businessName?: string;
  businessEmail?: string;
  // ElevenLabs may send these fields
  call_id?: string;
  agent_id?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sendConfirmationEmail(params: {
  to: string;
  clientName: string;
  service: string;
  dateTime: string;
  businessName: string;
  businessEmail: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "noreply@ai-booking.app";
  const fromName = process.env.SENDGRID_FROM_NAME ?? "AI Booking Assistant";

  if (!apiKey || apiKey.startsWith("your_")) {
    console.warn("[webhook-voice] SendGrid not configured — skipping email");
    return { success: false, error: "SendGrid not configured" };
  }

  const dateFormatted = new Date(params.dateTime).toLocaleString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const htmlBody = `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Conferma Prenotazione</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">✅ Prenotazione Confermata</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Gestita dal tuo Assistente AI</p>
  </div>
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Gentile <strong>${params.clientName}</strong>,</p>
    <p>La tua prenotazione presso <strong>${params.businessName}</strong> è stata confermata con successo dall'assistente AI vocale.</p>
    
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px; color: #667eea;">📋 Dettagli Prenotazione</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #6b7280; width: 40%;">Servizio:</td><td style="padding: 6px 0; font-weight: 600;">${params.service}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;">Data e Ora:</td><td style="padding: 6px 0; font-weight: 600;">${dateFormatted}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;">Attività:</td><td style="padding: 6px 0; font-weight: 600;">${params.businessName}</td></tr>
      </table>
    </div>

    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        ⚠️ <strong>Politica No-Show:</strong> In caso di mancata presentazione senza preavviso, 
        verrà applicata una penale di €30. Ti preghiamo di disdire almeno 24 ore prima.
      </p>
    </div>

    <p style="color: #6b7280; font-size: 14px;">Per modifiche o cancellazioni, contatta direttamente ${params.businessName}.</p>
    <p style="color: #6b7280; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
      Questa email è stata generata automaticamente dall'Assistente AI di ${params.businessName}.
    </p>
  </div>
</body>
</html>`;

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to, name: params.clientName }] }],
        from: { email: fromEmail, name: fromName },
        reply_to: { email: params.businessEmail },
        subject: `✅ Prenotazione confermata — ${params.service} @ ${params.businessName}`,
        content: [{ type: "text/html", value: htmlBody }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[webhook-voice] SendGrid error:", response.status, errorText);
      return { success: false, error: `SendGrid ${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (err) {
    console.error("[webhook-voice] SendGrid fetch error:", err);
    return { success: false, error: String(err) };
  }
}

async function sendWhatsAppConfirmation(params: {
  to: string; // E.164 format e.g. +39...
  clientName: string;
  service: string;
  dateTime: string;
  businessName: string;
}): Promise<{ success: boolean; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || token.startsWith("your_") || !phoneId || phoneId.startsWith("your_")) {
    console.warn("[webhook-voice] WhatsApp not configured — skipping");
    return { success: false, error: "WhatsApp not configured" };
  }

  const dateFormatted = new Date(params.dateTime).toLocaleString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const messageText =
    `✅ *Prenotazione Confermata*\n\n` +
    `Ciao ${params.clientName}! 👋\n\n` +
    `La tua prenotazione presso *${params.businessName}* è confermata:\n\n` +
    `📋 *Servizio:* ${params.service}\n` +
    `📅 *Data:* ${dateFormatted}\n\n` +
    `⚠️ _Ricorda: in caso di no-show verrà applicata una penale di €30._\n\n` +
    `Per disdire o modificare, contatta direttamente il negozio. Grazie! 🙏`;

  // Normalize phone number (remove spaces, ensure +)
  const normalizedPhone = params.to.replace(/\s/g, "").replace(/^00/, "+");

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: normalizedPhone,
          type: "text",
          text: { preview_url: false, body: messageText },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[webhook-voice] WhatsApp error:", response.status, errorText);
      return { success: false, error: `WhatsApp ${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (err) {
    console.error("[webhook-voice] WhatsApp fetch error:", err);
    return { success: false, error: String(err) };
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Parse body
    let payload: VoiceWebhookPayload;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // 2. Resolve business_id (payload > header > env)
    const businessId = payload.business_id ?? getBusinessId(req);

    if (!isValidBusinessId(businessId)) {
      return NextResponse.json(
        { error: `Invalid business_id: "${businessId}"` },
        { status: 400 }
      );
    }

    // 3. Establish Fiduciary Mandate
    const mandate = createFiduciaryMandate(businessId);
    console.log(`[webhook-voice] Mandate issued for ${mandate.businessId} — event: ${payload.event}`);

    // 4. Handle events
    const results: Record<string, unknown> = {
      businessId,
      event: payload.event,
      mandate: mandate.version,
      timestamp: new Date().toISOString(),
    };

    if (payload.event === "booking_created" && payload.reservation) {
      const res = payload.reservation;
      const businessName = payload.businessName ?? businessId;
      const businessEmail = payload.businessEmail ?? process.env.SENDGRID_FROM_EMAIL ?? "";

      // 4a. Increment AI-handled counter
      const stats = incrementAiHandled(businessId);
      results.aiHandledCount = stats.aiHandledCount;
      results.lastUpdatedAt = stats.lastUpdatedAt;

      // 4b. Send email confirmation (if client email provided)
      if (res.clientEmail) {
        const emailResult = await sendConfirmationEmail({
          to: res.clientEmail,
          clientName: res.clientName,
          service: res.service,
          dateTime: res.dateTime,
          businessName,
          businessEmail,
        });
        results.emailSent = emailResult.success;
        if (!emailResult.success) results.emailError = emailResult.error;
      } else {
        results.emailSent = false;
        results.emailError = "No client email provided";
      }

      // 4c. Send WhatsApp confirmation (if client phone provided)
      if (res.clientPhone) {
        const waResult = await sendWhatsAppConfirmation({
          to: res.clientPhone,
          clientName: res.clientName,
          service: res.service,
          dateTime: res.dateTime,
          businessName,
        });
        results.whatsappSent = waResult.success;
        if (!waResult.success) results.whatsappError = waResult.error;
      } else {
        results.whatsappSent = false;
        results.whatsappError = "No client phone provided";
      }

      // 4d. Log the reservation data for dashboard
      results.reservation = {
        clientName: res.clientName,
        service: res.service,
        dateTime: res.dateTime,
        channel: "ai",
        aiHandled: true,
        aiTranscript: res.aiTranscript,
      };

      console.log(
        `[webhook-voice] Booking created for ${businessId}: ${res.clientName} — ${res.service} @ ${res.dateTime}`
      );
    } else if (payload.event === "no_show" && payload.reservation) {
      const res = payload.reservation;
      const businessName = payload.businessName ?? businessId;

      // Evaluate risk and generate penalty message
      // In production, look up actual no-show count from DB
      const noShowCount = 1; // placeholder — replace with DB lookup
      const riskLevel = evaluateClientRisk(noShowCount);
      const penaltyMsg = getNoShowPenaltyMessage(
        res.clientName,
        businessName,
        noShowCount,
        noShowCount * 30
      );

      results.noShow = {
        clientName: res.clientName,
        riskLevel,
        penaltyEur: noShowCount * 30,
        message: penaltyMsg,
      };

      // Send penalty notification via WhatsApp if phone available
      if (res.clientPhone) {
        const waResult = await sendWhatsAppConfirmation({
          to: res.clientPhone,
          clientName: res.clientName,
          service: res.service ?? "Prenotazione",
          dateTime: res.dateTime ?? new Date().toISOString(),
          businessName,
        });
        results.penaltyNotificationSent = waResult.success;
      }

      console.log(`[webhook-voice] No-show recorded for ${businessId}: ${res.clientName}`);
    } else if (payload.event === "inquiry") {
      // Just log — no booking created
      results.message = "Inquiry received — no booking created";
      console.log(`[webhook-voice] Inquiry for ${businessId}`);
    }

    // 5. Include integration status for debugging
    results.integrations = getConfiguredIntegrations();

    return NextResponse.json({ success: true, ...results }, { status: 200 });
  } catch (err) {
    console.error("[webhook-voice] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}

// ── GET — health check & current stats ───────────────────────────────────────

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  const stats = getAiStats(businessId);
  const integrations = getConfiguredIntegrations();

  return NextResponse.json({
    status: "webhook-voice endpoint is running",
    businessId,
    stats,
    integrations,
    supportedEvents: ["booking_created", "booking_cancelled", "no_show", "inquiry"],
    usage: {
      method: "POST",
      headers: { "x-business-id": "your-business-id (optional)" },
      body: {
        business_id: "twilight-lake-0344 (optional)",
        event: "booking_created",
        reservation: {
          clientName: "Mario Rossi",
          clientPhone: "+39...",
          clientEmail: "mario@example.com",
          service: "Taglio Capelli",
          dateTime: "2026-03-01T10:00:00.000Z",
        },
        businessName: "Salone Bella",
        businessEmail: "info@salone.it",
      },
    },
  });
}
