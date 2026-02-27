/**
 * Client-side real-time polling utilities.
 *
 * Polls /api/stats every POLL_INTERVAL_MS to get live AI stats.
 * Used by DashboardView to show the "Gestite da AI" counter in real-time.
 */

"use client";

export const POLL_INTERVAL_MS = 10_000; // 10 seconds

export interface RealtimeStats {
  businessId: string;
  aiHandledCount: number;
  lastUpdatedAt: string;
  integrations: {
    gemini: boolean;
    elevenLabs: boolean;
    twilio: boolean;
    sendgrid: boolean;
    whatsapp: boolean;
  };
  timestamp: string;
}

/**
 * Fetches the latest AI stats for a business from the server.
 */
export async function fetchRealtimeStats(businessId: string): Promise<RealtimeStats | null> {
  try {
    const url = `/api/stats?business_id=${encodeURIComponent(businessId)}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "x-business-id": businessId },
    });

    if (!res.ok) {
      console.warn("[realtime] Stats fetch failed:", res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn("[realtime] Stats fetch error:", err);
    return null;
  }
}

/**
 * Syncs the local localStorage AI count to the server.
 * Call this on app mount so the server counter matches localStorage.
 */
export async function syncAiCountToServer(
  businessId: string,
  aiHandledCount: number
): Promise<void> {
  try {
    await fetch("/api/stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-business-id": businessId,
      },
      body: JSON.stringify({ aiHandledCount }),
    });
  } catch (err) {
    console.warn("[realtime] Sync error:", err);
  }
}

/**
 * Starts a polling loop and calls `onUpdate` with fresh stats.
 * Returns a cleanup function to stop polling.
 *
 * Usage:
 *   const stop = startPolling("twilight-lake-0344", (stats) => setAiCount(stats.aiHandledCount));
 *   // later:
 *   stop();
 */
export function startPolling(
  businessId: string,
  onUpdate: (stats: RealtimeStats) => void,
  intervalMs = POLL_INTERVAL_MS
): () => void {
  let active = true;

  const poll = async () => {
    if (!active) return;
    const stats = await fetchRealtimeStats(businessId);
    if (stats && active) {
      onUpdate(stats);
    }
  };

  // Immediate first fetch
  poll();

  const timer = setInterval(poll, intervalMs);

  return () => {
    active = false;
    clearInterval(timer);
  };
}
