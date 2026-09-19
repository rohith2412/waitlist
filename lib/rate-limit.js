const WINDOW_MS = 60_000;
const MAX_HITS = 5;

const hits = global._waitlistHits || (global._waitlistHits = new Map());

export function rateLimit(key) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);

  if (arr.length >= MAX_HITS) {
    hits.set(key, arr);
    const retryAfter = Math.ceil((WINDOW_MS - (now - arr[0])) / 1000);
    return { ok: false, retryAfter };
  }

  arr.push(now);
  hits.set(key, arr);

  if (hits.size > 10_000) {
    for (const [k, v] of hits) {
      if (!v.length || now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
    }
  }

  return { ok: true };
}

export function clientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
