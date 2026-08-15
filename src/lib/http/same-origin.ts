export function isSameOriginRequest(
  request: Request,
  configuredSiteUrl?: string,
) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let requestOrigin: string;
  try {
    requestOrigin = new URL(origin).origin;
  } catch {
    return false;
  }

  const urlOrigin = new URL(request.url).origin;
  if (requestOrigin === urlOrigin) return true;

  const host = firstHeaderValue(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );
  const protocol = firstHeaderValue(
    request.headers.get("x-forwarded-proto") ??
      new URL(request.url).protocol.replace(":", ""),
  );

  if (host && protocol) {
    try {
      if (requestOrigin === new URL(`${protocol}://${host}`).origin) return true;
    } catch {
      return false;
    }
  }

  if (configuredSiteUrl) {
    try {
      return requestOrigin === new URL(configuredSiteUrl).origin;
    } catch {
      return false;
    }
  }

  return false;
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim();
}
