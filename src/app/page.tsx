import ConverterShell from "@/components/ConverterShell";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="border-b"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: "var(--primary)" }}
            >
              CX
            </div>
            <span className="text-xl font-bold">
              Currency
              <span style={{ color: "var(--primary)" }}>Xchange</span>
            </span>
          </div>
          <nav className="hidden sm:flex gap-6 text-sm" style={{ color: "var(--secondary)" }}>
            <a href="#converter" className="hover:underline">Converter</a>
            <a href="#rates" className="hover:underline">Rates</a>
          </nav>
        </div>
      </header>

      {/* Top Ad */}
      <div className="max-w-5xl mx-auto px-4 mt-4 w-full">
        <AdBanner slot="top-banner" format="horizontal" className="w-full" />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Currency Converter
          </h1>
          <p
            className="text-base sm:text-lg max-w-md mx-auto"
            style={{ color: "var(--secondary)" }}
          >
            Convert between 160+ currencies with live exchange rates
          </p>
        </div>

        <div id="converter">
          <ConverterShell />
        </div>

        {/* Mid-page Ad */}
        <div className="w-full max-w-lg mx-auto mt-8">
          <AdBanner slot="mid-content" format="rectangle" className="w-full" />
        </div>

        {/* Features Section */}
        <section id="rates" className="w-full max-w-lg mx-auto mt-12">
          <h2 className="text-xl font-bold mb-4 text-center">
            Why CurrencyXchange?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Real-Time Rates",
                desc: "Live exchange rates updated hourly from trusted sources",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
              {
                title: "160+ Currencies",
                desc: "Support for all major world currencies and more",
                icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Fast & Free",
                desc: "Instant conversions with no registration required",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl p-5 text-center"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: "var(--primary-light)" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: "var(--primary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--secondary)" }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Ad */}
      <div className="max-w-5xl mx-auto px-4 mb-4 w-full">
        <AdBanner slot="bottom-banner" format="horizontal" className="w-full" />
      </div>

      {/* Footer */}
      <footer
        className="border-t py-6"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div
          className="max-w-5xl mx-auto px-4 text-center text-sm"
          style={{ color: "var(--secondary)" }}
        >
          <p>
            CurrencyXchange &mdash; Real-time currency conversion powered by
            ExchangeRate-API
          </p>
          <p className="mt-1">
            Exchange rates are for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
