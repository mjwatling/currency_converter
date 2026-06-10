"use client";

import { useState } from "react";
import CurrencyConverter from "@/components/CurrencyConverter";
import HistoricalChart from "@/components/HistoricalChart";

/**
 * Parent shell that lifts fromCurrency / toCurrency state so the chart
 * can follow whatever pair the user selects in the converter.
 */
export default function ConverterShell() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");

  return (
    <>
      <CurrencyConverter
        fromProp={from}
        toProp={to}
        onPairChange={(f: string, t: string) => {
          setFrom(f);
          setTo(t);
        }}
      />

      {/* Historical rate chart — renders right below the converter */}
      <div className="w-full max-w-lg mx-auto mt-6">
        <HistoricalChart base={from} target={to} />
      </div>
    </>
  );
}
