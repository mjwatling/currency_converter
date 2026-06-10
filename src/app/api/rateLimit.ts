import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const trackers: Map<string, number[]> = new Map();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "client";
}

export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIp(request);
  const timestamps = trackers.get(ip) ?? [];

  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  while (timestamps.length && timestamps[0] < cutoff) {
    timestamps.shift();
  }

  if (timestamps.length >= RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  timestamps.push(Date.now());
  trackers.set(ip, timestamps);
  return null;
}
