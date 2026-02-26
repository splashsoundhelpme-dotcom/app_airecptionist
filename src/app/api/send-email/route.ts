import { NextResponse } from "next/server";

// This is a demo email service - in production, integrate with SendGrid, Resend, etc.
// For now, we'll simulate email sending and log the emails

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  type: "new_reservation" | "reservation_confirmed" | "reservation_cancelled" | "reminder";
}

export async function POST(request: Request) {
  try {
    const { to, subject, body, type }: EmailRequest = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    // In production, integrate with a real email service:
    // 
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to, subject, html: body, from: 'noreply@yourdomain.com' });
    //
    // Example with Resend:
    // const { Resend } = require('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ to, subject, html: body, from: 'noreply@yourdomain.com' });

    // For demo, we'll log the email and return success
    console.log("=== EMAIL SENT ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Type: ${type}`);
    console.log(`Body: ${body}`);
    console.log("==================");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: `email_${Date.now()}`,
      type,
      to,
      subject,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

// Handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    status: "Email API is running",
    methods: ["POST"],
    usage: {
      to: "email@example.com",
      subject: "Email Subject",
      body: "HTML email body",
      type: "new_reservation | reservation_confirmed | reservation_cancelled | reminder"
    }
  });
}
