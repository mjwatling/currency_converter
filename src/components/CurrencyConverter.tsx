"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import CurrencySelector from "./CurrencySelector";
import { currencyMap, currencies as staticCurrencies, type Currency } from "@/lib/currencies";

interface RatesResponse {
  rates: Record<string, number>;
  base: string;
  lastUpdated: string;
  cached?: boolean;
  error?: string;
}

interface CurrencyConverterProps {
  fromProp?: string;
  toProp?: string;
  onPairChange?: (from: string, to: string) => void;
}

export default function CurrencyConverter({
  fromProp,
  toProp,
  onPairChange,
}: CurrencyConverterProps = {}) {
  const [amount, setAmount] = useState("1");

  // Use external props when provided, otherwise internal state
  const [_internalFrom, _setInternalFrom] = useState("USD");
  const [_internalTo, _setInternalTo] = useState("EUR");

  const fromCurrency = fromProp ?? _internalFrom;
  const toCurrency = toProp ?? _internalTo;

  const setFromCurrency = (code: string) => {
    if (!fromProp) _setInternalFrom(code);
    onPairChange?.(code, toCurrency);
  };
  const setToCurrency = (code: string) => {
    if (!toProp) _setInternalTo(code);
    onPairChange?.(fromCurrency, code);
  };
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const skipNextFetchRef = useRef(false);

  // Derive the full currency list from rate keys once rates are loaded.
  // Falls back to the static list during the initial load.
  const availableCurrencies = useMemo<Currency[]>(() => {
    if (!rates) return staticCurrencies;
    return Object.keys(rates)
      .sort()
      .map((code) => currencyMap.get(code) ?? { code, name: code, symbol: code, flag: "🌐" });
  }, [rates]);

  const fetchRates = useCallback(async () => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rates?base=${fromCurrency}`, {
        signal: controller.signal,
      });
      const data: RatesResponse = await res.json();
      if (data.error) throw new Error(data.error);
      setRates(data.rates);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Failed to fetch rates:", err);
      setError("Unable to load exchange rates. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fromCurrency]);

  useEffect(() => {
    fetchRates();
    return () => abortControllerRef.current?.abort();
  }, [fetchRates]);

  const swapCurrencies = () => {
    if (rates) {
      const newBase = toCurrency;
      const baseRate = rates[newBase];
      if (baseRate) {
        // Rebase all rates to the new currency — avoids a network round-trip.
        const rebased: Record<string, number> = {};
        for (const [code, rate] of Object.entries(rates)) {
          rebased[code] = rate / baseRate;
        }
        setRates(rebased);
        skipNextFetchRef.current = true;
      }
    }
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const numericAmount = parseFloat(amount) || 0;
  const rate = rates?.[toCurrency] ?? 0;
  const convertedAmount = numericAmount * rate;

  // --- Intl.NumberFormatters for proper currency display ---
  const toCurrencyFormatter = useMemo(
    () => new Intl.NumberFormat("default", { style: "currency", currency: toCurrency }),
    [toCurrency],
  );

  const fromCurrencyFormatter = useMemo(
    () => new Intl.NumberFormat("default", { style: "currency", currency: fromCurrency }),
    [fromCurrency],
  );

  // Fallback for currencies not supported by the local Intl impl
  const formattedAmount = useMemo(() => {
    try {
      return fromCurrencyFormatter.format(numericAmount);
    } catch {
      return `${numericAmount.toLocaleString()} ${fromCurrency}`;
    }
  }, [fromCurrencyFormatter, numericAmount, fromCurrency]);

  const formattedConverted = useMemo(() => {
    try {
      return toCurrencyFormatter.format(convertedAmount);
    } catch {
      return `${convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })} ${toCurrency}`;
    }
  }, [toCurrencyFormatter, convertedAmount, toCurrency]);

  const formattedRate = useMemo(() => {
    try {
      return rate?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    } catch {
      return String(rate);
    }
  }, [rate]);

  // --- Copy-to-clipboard ---
  const handleCopy = useCallback(() => {
    const textToCopy = `${formattedAmount} = ${formattedConverted}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [formattedAmount, formattedConverted]);

  const fromSymbol = currencyMap.get(fromCurrency)?.symbol ?? fromCurrency;
  const toSymbol = currencyMap.get(toCurrency)?.symbol ?? toCurrency;

  return (
    <div
      className="rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg mx-auto"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      {/* Amount Input */}
      <div className="mb-6">
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--secondary)" }}
        >
          Amount
        </label>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium"
            style={{ color: "var(--secondary)" }}
          >
            {fromSymbol}
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="any"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-lg font-semibold outline-none transition-all duration-200"
            style={{
              backgroundColor: "var(--input-bg)",
              border: "2px solid var(--input-border)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--input-focus)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--input-border)")
            }
          />
        </div>
      </div>

      {/* Currency Selectors with Swap */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end mb-6">
        <CurrencySelector
          value={fromCurrency}
          onChange={setFromCurrency}
          label="From"
          currencies={availableCurrencies}
        />

        <button
          onClick={swapCurrencies}
          className="mb-1 p-2.5 rounded-full transition-all duration-200 cursor-pointer hover:scale-110"
          style={{
            backgroundColor: "var(--primary)",
            color: "white",
          }}
          title="Swap currencies"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </button>

        <CurrencySelector
          value={toCurrency}
          onChange={setToCurrency}
          label="To"
          currencies={availableCurrencies}
        />
      </div>

      {/* Result */}
      <div
        className="rounded-xl p-5 text-center"
        style={{ backgroundColor: "var(--primary-light)" }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <div
              className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
            />
            <span style={{ color: "var(--secondary)" }}>
              Fetching latest rates...
            </span>
          </div>
        ) : error ? (
          <div className="py-2">
            <p className="text-sm mb-2" style={{ color: "var(--secondary)" }}>
              {error}
            </p>
            <button
              onClick={fetchRates}
              className="text-sm font-medium underline cursor-pointer"
              style={{ color: "var(--primary)" }}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div
              className="text-sm mb-2"
              style={{ color: "var(--secondary)" }}
            >
              {fromCurrency} &rarr; {toCurrency}
            </div>

            {/* Main result */}
            <div
              className="text-3xl sm:text-4xl font-bold break-all"
              style={{ color: "var(--primary)" }}
            >
              {formattedConverted}
            </div>

            {/* Copy button (appears on desktop) */}
            <button
              onClick={handleCopy}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                         transition-all duration-200 border cursor-pointer"
              style={{
                color: copied ? "var(--success, #22c55e)" : "var(--primary)",
                borderColor: copied ? "var(--success, #22c55e)" : "var(--primary)",
                backgroundColor: copied
                  ? "color-mix(in srgb, var(--success, #22c55e) 10%, transparent)"
                  : "transparent",
              }}
              title="Copy conversion result"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 6.5H9" />
                  </svg>
                  Copy
                </>
              )}
            </button>

            {/* Exchange rate line */}
            <div
              className="text-xs mt-3 pt-3"
              style={{
                color: "var(--secondary)",
                borderTop: "1px solid var(--card-border)",
              }}
            >
              1 {fromCurrency} = {formattedRate} {toCurrency}
            </div>

            {/* Human-readable amount line */}
            <div
              className="text-xs mt-1"
              style={{ color: "var(--secondary)" }}
            >
              {numericAmount.toLocaleString()} {fromCurrency} = {convertedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })} {toCurrency}
            </div>
          </>
        )}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div
          className="text-xs text-center mt-4"
          style={{ color: "var(--secondary)" }}
        >
          Rates updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}
