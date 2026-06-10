"use client";

import { useState, useEffect, useMemo } from "react";
import CurrencySelector from "./CurrencySelector";
import { currencyMap, currencies as staticCurrencies } from "@/lib/currencies";

/**
 * Multi-currency comparison: one base amount converted to up to 4 target
 * currencies side by side.
 */
export default function MultiCurrencyView() {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [amount, setAmount] = useState("1");
  const [targets, setTargets] = useState<string[]>(["EUR", "GBP", "JPY"]);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/rates?base=${baseCurrency}`)
      .then((r) => r.json())
      .then((d: { rates?: Record<string, number> }) => {
        if (!cancelled && d.rates) setRates(d.rates);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [baseCurrency]);

  const handleBaseChange = (code: string) => {
    setLoading(true);
    setBaseCurrency(code);
  };

  const addSlot = () => {
    if (targets.length < 4) setTargets([...targets, "EUR"]);
  };

  const removeSlot = (idx: number) => {
    if (targets.length > 1) setTargets(targets.filter((_, i) => i !== idx));
  };

  const numericAmount = parseFloat(amount) || 0;

  const baseSymbol = currencyMap.get(baseCurrency)?.symbol ?? baseCurrency;

  return (
    <div
      className="rounded-2xl shadow-xl p-6 w-full max-w-lg mx-auto mt-8"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      <h3 className="text-base font-semibold mb-4">Multi-Currency Compare</h3>

      {/* Base amount */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-lg font-medium flex-shrink-0 w-8 text-right"
          style={{ color: "var(--secondary)" }}
        >
          {baseSymbol}
        </span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="any"
          className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: "var(--input-bg)",
            border: "2px solid var(--input-border)",
          }}
        />
        <div className="w-28">
          <CurrencySelector
            value={baseCurrency}
            onChange={handleBaseChange}
            label=""
            currencies={staticCurrencies}
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <span style={{ color: "var(--secondary)" }}>Loading rates...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {targets.map((targetCode, idx) => {
            const rate = rates?.[targetCode] ?? 0;
            const converted = numericAmount * rate;
            const tSymbol = currencyMap.get(targetCode)?.symbol ?? targetCode;
            const tFlag = currencyMap.get(targetCode)?.flag ?? "";
            try {
              const fmt = new Intl.NumberFormat("default", {
                style: "currency",
                currency: targetCode,
              });
              return (
                <div
                  key={`${targetCode}-${idx}`}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ backgroundColor: "var(--input-bg)" }}
                >
                  <span className="text-xl">{tFlag}</span>
                  <span className="flex-1 text-sm font-medium">
                    {targetCode}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--primary)" }}
                  >
                    {fmt.format(converted)}
                  </span>
                  {targets.length > 1 && (
                    <button
                      onClick={() => removeSlot(idx)}
                      className="p-1 cursor-pointer opacity-50 hover:opacity-100"
                      style={{ color: "var(--secondary)" }}
                      title="Remove"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              );
            } catch {
              return (
                <div
                  key={`${targetCode}-${idx}`}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ backgroundColor: "var(--input-bg)" }}
                >
                  <span className="text-xl">{tFlag}</span>
                  <span className="flex-1 text-sm font-medium">
                    {targetCode}
                  </span>
                  <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                    {converted.toFixed(4)} {tSymbol}
                  </span>
                </div>
              );
            }
          })}

          {/* Add button */}
          {targets.length < 4 && (
            <button
              onClick={addSlot}
              className="w-full py-2 rounded-lg text-sm font-medium border-dashed border-2 cursor-pointer transition-colors"
              style={{ borderColor: "var(--card-border)", color: "var(--secondary)" }}
            >
              + Add currency
            </button>
          )}
        </div>
      )}
    </div>
  );
}
