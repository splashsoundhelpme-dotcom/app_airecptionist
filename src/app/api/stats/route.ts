/**
 * GET /api/stats?business_id=twilight-lake-0344
 *
 * Returns real-time AI stats for the dashboard.
 * The dashboard polls this endpoint every 10 seconds.
 *
 * Response:
 * {
 *   "businessId": "twilight-lake-0344",
 *   "aiHandledCount": 42,
 *   "lastUpdatedAt": "2026-02-27T18:00:00.000Z",
 *   "integrations": { "gemini": true, "sendgrid": true, ... }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getBusinessId, getAiStats } from "@/lib/multi-tenant";
import { getConfiguredIntegrations } from "@/lib/env";

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  const stats = getAiStats(businessId);
  const integrations = getConfiguredIntegrations();

  return NextResponse.json(
    {
      businessId,
      aiHandledCount: stats.aiHandledCount,
      lastUpdatedAt: stats.lastUpdatedAt,
      integrations,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        // Allow dashboard to poll frequently
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Business-Id": businessId,
      },
    }
  );
}

// POST to manually set the counter (e.g. sync from localStorage on first load)
export async function POST(req: NextRequest) {
  try {
    const { aiHandledCount } = await req.json();
    const businessId = getBusinessId(req);

    if (typeof aiHandledCount !== "number" || aiHandledCount < 0) {
      return NextResponse.json(
        { error: "aiHandledCount must be a non-negative number" },
        { status: 400 }
      );
    }

    const { setAiHandledCount } = await import("@/lib/multi-tenant");
    const updated = setAiHandledCount(businessId, aiHandledCount);

    return NextResponse.json({
      success: true,
      businessId,
      ...updated,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update stats", detail: String(err) },
      { status: 500 }
    );
  }
}
