"use client";

import { useState } from "react";
import { currencyMap } from "@/lib/currencies";

const FAV_KEY = "cx-favorites";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveFavorites(list: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
}

interface FavoritesBarProps {
  currentFrom: string;
  currentTo: string;
  onSelectCurrency: (code: string) => void;
  target?: boolean;
}

export default function FavoritesBar({
  currentFrom,
  currentTo,
  onSelectCurrency,
  target = false,
}: FavoritesBarProps) {
  // Use lazy initialization to prevent cascading renders on mount
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  return (
    <div className="flex flex-wrap gap-2 justify-center w-full px-2">
      {favorites.map((code) => {
        const c = currencyMap.get(code);
        if (!c) return null;
        const isActive = target ? code === currentTo : code === currentFrom;
        return (
          <button
            key={code}
            type="button"
            onClick={() => onSelectCurrency(code)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border cursor-pass"
            style={{
              backgroundColor: isActive ? "var(--primary)" : "var(--input-bg)",
              color: isActive ? "#fff" : "var(--foreground)",
              borderColor: isActive ? "var(--primary)" : "var(--card-border)",
            }}
          >
            <span className="text-base">{c.flag}</span>
            <span className="font-medium">{code}</span>
          </button>
        );
      })}

      {favorites.length === 0 && (
        <div className="text-xs py-2" style={{ color: "var(--secondary)" }}>
          Click the star on currency selectors to add favorites
        </div>
      )}
    </div>
  );
}
