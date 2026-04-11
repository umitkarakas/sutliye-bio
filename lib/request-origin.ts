function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getRequestOrigin(request: Request) {
  const configuredOrigin = process.env.APP_BASE_URL?.trim();

  if (configuredOrigin) {
    return trimTrailingSlash(configuredOrigin);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

export function buildAbsoluteUrl(request: Request, path: string) {
  return new URL(path, `${getRequestOrigin(request)}/`);
}
