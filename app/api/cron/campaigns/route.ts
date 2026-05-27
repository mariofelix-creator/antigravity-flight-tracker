import { NextResponse } from "next/server";
import { checkAndSendUrgencyReminders } from "@/lib/campaigns/scheduler";

// Vercel Cron: runs every hour
// vercel.json → { "crons": [{ "path": "/api/cron/campaigns", "schedule": "0 * * * *" }] }

export async function GET(request: Request) {
  // Verify cron secret (Vercel sets Authorization header automatically)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkAndSendUrgencyReminders();

    return NextResponse.json({
      data: {
        ...result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[cron/campaigns] Error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
