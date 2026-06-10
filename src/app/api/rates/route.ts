import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "../rateLimit";
import { getCached, setCached } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const breach = rateLimit(request);
  if (breach) return breach;

  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base") || "USD";
  const maxAge = Number(searchParams.get("maxAge")) || 60 * 60 * 1000;
  const useCache = searchParams.get("skipCache") !== "true";

  if (!/^[A-Z]{3,4}$/.test(base)) {
    return NextResponse.json({ error: "Invalid currency code" }, { status: 400 });
  }

  // Try file cache first
  if (useCache) {
    const cachedEntry = getCached(base);
    if (cachedEntry) {
      return NextResponse.json({
        rates: cachedEntry.rates,
        base,
        cached: true,
        lastUpdated: new Date(cachedEntry.timestamp).toISOString(),
        source: cachedEntry.source,
        history: cachedEntry.history || [], // Expose history to the client
      });
    }
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    let url: string;
    let source: string;

    if (apiKey) {
      url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`;
      source = "exchangerate-api";
    } else {
      url = `https://open.er-api.com/v6/latest/${base}`;
      source = "er-api";
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result === "error") {
      throw new Error(data["error-type"] || "API error");
    }

    const rates = data.conversion_rates || data.rates;

    // Write to file cache (which now accumulates history)
    setCached(base, rates, source);

    return NextResponse.json({
      rates,
      base,
      cached: false,
      lastUpdated: new Date().toISOString(),
      source,
      history: getCached(base)?.history || [], // Ensure even fresh fetches return the full history
    });
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    
    // Fall back to file cache even if stale
    const staleEntry = getCached(base);
    if (staleEntry) {
      return NextResponse.json({
        rates: staleEntry.rates,
        base,
        cached: true,
        stale: true,
        lastUpdated: new Date(staleEntry.timestamp).toISOString(),
        source: staleEntry.source,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 },
    );
  }
}
