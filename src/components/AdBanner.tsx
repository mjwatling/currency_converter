"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export default function AdBanner({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdBannerProps) {
  const initialized = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || initialized.current) return;
    initialized.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded or blocked
    }
  }, [clientId]);

  if (!clientId) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed ${className}`}
        style={{
          borderColor: "var(--card-border)",
          backgroundColor: "var(--input-bg)",
          minHeight: "90px",
        }}
      >
        <span
          className="text-sm"
          style={{ color: "var(--secondary)" }}
        >
          Ad Space — Set NEXT_PUBLIC_ADSENSE_CLIENT_ID to enable
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
