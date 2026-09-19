import { NextResponse } from "next/server";
import { getCollection } from "../../../lib/mongo";
import { rateLimit, clientIp } from "../../../lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  const gate = rateLimit(clientIp(req));
  if (!gate.ok) {
    return NextResponse.json(
      { error: "too many requests" },
      { status: 429, headers: { "Retry-After": String(gate.retryAfter) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const email = String(body?.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const col = await getCollection();
  await col.createIndex({ email: 1 }, { unique: true });

  try {
    await col.insertOne({ email, createdAt: new Date() });
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
