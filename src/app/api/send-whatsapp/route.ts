/**
 * POST /api/send-whatsapp
 *
 * Sends a WhatsApp message via Meta Business API (Cloud API).
 * Requires: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID
 */

import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/multi-tenant";

interface WhatsAppRequest {
  to: string;           // E.164 phone number e.g. +39...
  message: string;      // Plain text message
  type?: "text" | "template";
  templateName?: string;
  templateParams?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body: WhatsAppRequest = await req.json();
    const { to, message, type = "text" } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to, message" },
        { status: 400 }
      );
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || token.startsWith("your_") || !phoneId || phoneId.startsWith("your_")) {
      // Dev mode: simulate success
      console.log("=== WHATSAPP (simulated) ===");
      console.log(`To: ${to}`);
      console.log(`Message: ${message}`);
      console.log("===========================");

      return NextResponse.json({
        success: true,
        simulated: true,
        message: "WhatsApp not configured — message simulated",
        to,
        timestamp: new Date().toISOString(),
      });
    }

    // Normalize phone number
    const normalizedPhone = to.replace(/\s/g, "").replace(/^00/, "+");

    const payload =
      type === "text"
        ? {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: normalizedPhone,
            type: "text",
            text: { preview_url: false, body: message },
          }
        : {
            messaging_product: "whatsapp",
            to: normalizedPhone,
            type: "template",
            template: {
              name: body.templateName ?? "hello_world",
              language: { code: "it" },
              components: body.templateParams
                ? [
                    {
                      type: "body",
                      parameters: body.templateParams.map((p) => ({
                        type: "text",
                        text: p,
                      })),
                    },
                  ]
                : [],
            },
          };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[send-whatsapp] Meta API error:", response.status, data);
      return NextResponse.json(
        { error: "WhatsApp API error", detail: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
      to: normalizedPhone,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[send-whatsapp] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  const configured =
    !!process.env.WHATSAPP_TOKEN &&
    !process.env.WHATSAPP_TOKEN.startsWith("your_");

  return NextResponse.json({
    status: "WhatsApp API is running",
    businessId,
    configured,
    methods: ["POST"],
    usage: {
      to: "+39...",
      message: "Your message text",
      type: "text | template",
    },
  });
}
