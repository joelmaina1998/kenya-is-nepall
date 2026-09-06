const requests = new Map<string, number[]>();

export function isRateLimited(key: string, max = 5, windowMs = 60_000) {
  const now = Date.now();
  const recent = (requests.get(key) || []).filter((time) => now - time < windowMs);
  recent.push(now);
  requests.set(key, recent);
  return recent.length > max;
}

export function requestKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}