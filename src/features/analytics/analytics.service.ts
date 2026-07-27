import "server-only";

import { createHmac } from "node:crypto";

import { analyticsRepository } from "@/features/analytics/analytics.repository";

export type AnalyticsEventInput = {
  eventType: "PAGE_VIEW";
  pathname: string;
  referrer: string | null;
  sessionId: string;
};

export function analyticsPersistenceIsAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export async function analyticsIsEnabled() {
  const settings = await analyticsRepository.getEnabledSetting();
  return Boolean(settings?.analyticsEnabled);
}

export async function recordAnalyticsEvent(
  input: AnalyticsEventInput,
  secret: string,
) {
  const referrer = input.referrer ? new URL(input.referrer).origin : null;

  return analyticsRepository.createEvent({
    eventType: input.eventType,
    pathname: input.pathname,
    referrer,
    sessionHash: createHmac("sha256", secret)
      .update(input.sessionId)
      .digest("hex"),
  });
}
