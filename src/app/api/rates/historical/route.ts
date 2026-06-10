import { NextResponse } from "next/server";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const histCache: Record<string, { data: any[]; timestamp: number }> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base") || "USD";
  const pair = searchParams.get("target") || "EUR";
  const days = Math.min(parseInt(searchParams.get("days") || "30"), 365) || 30;

  if (!/^[A-Z]{3,4}$/.test(base) || !/^[A-Z]{3,4}$/.test(pair)) {
    return NextResponse.json({ error: "Invalid currency code" }, { status: 400 });
  }

  // Cache key based on base + target + days
  const cacheKey = `${base}-${pair}-${days}`;
  const cached = histCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json({ points: cached.data, cached: true });
  }

  try {
    const points: { date: string; rate: number }[] = [];
    const today = new Date();
    // Batch dates into groups of ~10 free-tier calls to avoid hammering the API
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      try {
        const response = await fetch(
          `https://open.er-api.com/v6/${dateStr}/${base}`
        );
        if (!response.ok) continue;
        const data = await response.json();
        const rates = data.conversion_rates || data.rates;
        if (rates && rates[pair] != null) {
          points.push({ date: dateStr, rate: rates[pair] });
        }
      } catch {
        // Skip failed dates silently — historical free tier is best-effort
      }
    }

    histCache[cacheKey] = { data: points, timestamp: Date.now() };
    return NextResponse.json({ points, cached: false });
  } catch (error) {
    console.error("Failed to fetch historical rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical rates", points: [] },
      { status: 500 }
    );
  }
}
