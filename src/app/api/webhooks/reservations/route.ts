import { NextRequest, NextResponse } from "next/server";

// In-memory storage for reservations received from webhooks
// This is a temporary solution - in production you'd use a database
let pendingReservations: Array<{
  id: string;
  clientName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  channel: string;
  status: string;
  notes: string;
  createdAt: string;
  source: string;
}> = [];

// POST /api/webhooks/reservations - Receive reservations from Vapi or other sources
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, phone, service, date, time, channel, notes, source } = body;

    const id = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const reservation = {
      id,
      clientName: clientName || "Cliente telefonico",
      phone: phone || "",
      service: service || "Prenotazione",
      date: date || now.split("T")[0],
      time: time || "00:00",
      channel: channel || "telefono",
      status: "in_attesa",
      notes: notes || "",
      createdAt: now,
      source: source || "vapi",
    };

    pendingReservations.push(reservation);
    console.log("[Webhook] Reservation received:", reservation);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ success: false, error: "Errore" }, { status: 500 });
  }
}

// GET /api/webhooks/reservations - Get pending reservations (for polling by client)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");

  // Filter but DON'T delete - keep them in case poll happens before GET
  if (since) {
    const filtered = pendingReservations.filter(
      (r) => new Date(r.createdAt).getTime() > new Date(since).getTime()
    );
    return NextResponse.json({ reservations: filtered });
  }

  // Return all if no 'since' param
  return NextResponse.json({ reservations: [...pendingReservations] });
}

// DELETE /api/webhooks/reservations - Clear all pending reservations
export async function DELETE(req: Request) {
  pendingReservations = [];
  return NextResponse.json({ success: true });
}
