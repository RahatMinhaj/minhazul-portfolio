import { NextResponse } from "next/server";
import { z } from "zod";

import {
  analyticsIsEnabled,
  analyticsPersistenceIsAvailable,
  recordAnalyticsEvent,
} from "@/features/analytics/analytics.service";

const analyticsEventSchema = z.object({
  eventType: z.enum(["PAGE_VIEW"]),
  pathname: z
    .string()
    .min(1)
    .max(500)
    .regex(/^\/(?!\/)/),
  referrer: z.union([z.url(), z.null()]),
  sessionId: z.uuid(),
});

export async function POST(request: Request) {
  if (!analyticsPersistenceIsAvailable()) {
    return new NextResponse(null, { status: 204 });
  }

  if (!(await analyticsIsEnabled())) {
    return new NextResponse(null, { status: 204 });
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = analyticsEventSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid event." }, { status: 400 });
  }

  await recordAnalyticsEvent(parsed.data, secret);

  return new NextResponse(null, { status: 204 });
}
