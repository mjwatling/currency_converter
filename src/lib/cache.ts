import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache", "rates");

function ensureDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

interface CacheEntry {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
  source: string;
  history?: Array<{
    timestamp: number;
    rates: Record<string, number>;
  }>;
}

export function getCached(base: string): CacheEntry | null {
  try {
    const filePath = path.join(CACHE_DIR, `${base}.json`);
    if (!fs.existsSync(filePath)) return null;

    const raw = fs.readFileSync(filePath, "utf-8");
    const entry: CacheEntry = JSON.parse(raw);

    // Return cached data only if within 1 hour TTL
    if (Date.now() - entry.timestamp < 60 * 60 * 1000) {
      return entry;
    }
    return null; // expired
  } catch {
    return null;
  }
}

export function setCached(base: string, rates: Record<string, number>, source: string): void {
  ensureDir();
  const filePath = path.join(CACHE_DIR, `${base}.json`);
  let entry: CacheEntry;

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      entry = JSON.parse(raw);
    } catch {
      // If corrupt, start fresh
      entry = { base, rates: {}, timestamp: 0, source: "" };
    }
  } else {
    entry = { base, rates: {}, timestamp: 0, source: "" };
  }

  const now = Date.now();
  const newHistoryPoint = {
    timestamp: now,
    rates: { ...rates }
  };

  // Update history: append new point and keep only last 30 entries
  const updatedHistory = [
    ...(entry.history || []).filter(h => h.timestamp !== now), // Prevent duplicates
    newHistoryPoint
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 30);

  entry.rates = rates;
  entry.timestamp = now;
  entry.source = source;
  entry.history = updatedHistory;

  fs.writeFileSync(filePath, JSON.stringify(entry), "utf-8");
}

export function cleanupStale(): void {
  ensureDir();
  const maxAge = 60 * 60 * 1000; // 1 hour
  try {
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);
      const stats = fs.statSync(filePath);
      if (Date.now() - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
      }
    }
  } catch {
    // silent fail - cache cleanup is not critical
  }
}
