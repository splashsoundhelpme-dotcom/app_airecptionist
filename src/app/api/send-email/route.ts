/**
 * POST /api/send-email
 *
 * Sends transactional emails via SendGrid.
 * Falls back to console logging in development when SENDGRID_API_KEY is not set.
 */

import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/multi-tenant";

interface EmailRequest {
  to: string;
  toName?: string;
  subject: string;
  body: string; // HTML
  replyTo?: string;
  type: "new_reservation" | "reservation_confirmed" | "reservation_cancelled" | "reminder" | "no_show_penalty";
  // Multi-tenant
  business_id?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { to, toName, subject, body, replyTo, type, business_id }: EmailRequest =
      await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    const businessId = business_id ?? getBusinessId(req);
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "noreply@ai-booking.app";
    const fromName = process.env.SENDGRID_FROM_NAME ?? "AI Booking Assistant";

    // ── Development / unconfigured: simulate ──────────────────────────────────
    if (!apiKey || apiKey.startsWith("your_")) {
      console.log("=== EMAIL (simulated — SendGrid not configured) ===");
      console.log(`Business: ${businessId}`);
      console.log(`To: ${to}${toName ? ` <${toName}>` : ""}`);
      console.log(`Subject: ${subject}`);
      console.log(`Type: ${type}`);
      console.log(`Body (truncated): ${body.slice(0, 200)}...`);
      console.log("===================================================");

      await new Promise((resolve) => setTimeout(resolve, 200));

      return NextResponse.json({
        success: true,
        simulated: true,
        message: "SendGrid not configured — email simulated",
        emailId: `sim_${Date.now()}`,
        type,
        to,
        subject,
        businessId,
        timestamp: new Date().toISOString(),
      });
    }

    // ── Production: send via SendGrid ─────────────────────────────────────────
    const sgPayload = {
      personalizations: [
        {
          to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        },
      ],
      from: { email: fromEmail, name: fromName },
      ...(replyTo ? { reply_to: { email: replyTo } } : {}),
      subject,
      content: [{ type: "text/html", value: body }],
      // Custom args for tracking
      custom_args: {
        business_id: businessId,
        email_type: type,
      },
    };

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sgPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[send-email] SendGrid error:", response.status, errorText);
      return NextResponse.json(
        { error: "SendGrid API error", detail: errorText },
        { status: response.status }
      );
    }

    // SendGrid returns 202 with no body on success
    const messageId = response.headers.get("x-message-id") ?? `sg_${Date.now()}`;

    return NextResponse.json({
      success: true,
      emailId: messageId,
      type,
      to,
      subject,
      businessId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[send-email] Error:", err);
    return NextResponse.json(
      { error: "Failed to send email", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  const configured =
    !!process.env.SENDGRID_API_KEY &&
    !process.env.SENDGRID_API_KEY.startsWith("your_");

  return NextResponse.json({
    status: "Email API is running",
    businessId,
    configured,
    provider: "SendGrid",
    methods: ["POST"],
    usage: {
      to: "email@example.com",
      toName: "Mario Rossi (optional)",
      subject: "Email Subject",
      body: "HTML email body",
      replyTo: "reply@example.com (optional)",
      type: "new_reservation | reservation_confirmed | reservation_cancelled | reminder | no_show_penalty",
      business_id: "twilight-lake-0344 (optional)",
    },
  });
}
