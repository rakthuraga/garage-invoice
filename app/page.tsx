"use client";

import { useState } from "react";

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; emailed: boolean }
  | { type: "email-error"; message: string }
  | { type: "error"; message: string };

export default function Home() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "loading" });

    if (!url.trim()) {
      setStatus({ type: "error", message: "Please enter a listing URL." });
      return;
    }

    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          email: email.trim() || undefined,
        }),
      });

      // Partial success: PDF generated but email failed
      if (res.status === 207) {
        const data = await res.json();
        downloadBase64PDF(data.pdf, data.filename);
        setStatus({
          type: "email-error",
          message: data.emailError ?? "Failed to send email.",
        });
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setStatus({ type: "error", message: data.error ?? "Something went wrong." });
        return;
      }

      triggerDownload(await res.blob(), res.headers.get("Content-Disposition"));
      setStatus({ type: "success", emailed: !!email.trim() });
    } catch {
      setStatus({ type: "error", message: "Network error — please try again." });
    }
  }

  function triggerDownload(blob: Blob, disposition: string | null) {
    const filename =
      disposition?.match(/filename="(.+)"/)?.[1] ?? "garage-invoice.pdf";
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  function downloadBase64PDF(base64: string, filename: string) {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  const isLoading = status.type === "loading";

  return (
    <main className="min-h-screen bg-[#0F0F0F] flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-orange-500 font-bold text-xl tracking-widest">
            GARAGE
          </span>
          <span className="text-white/40 text-sm">Invoice Generator</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-xl">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-orange-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              PDF Invoice Generator
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white text-center leading-tight mb-4">
            Get a PDF invoice for
            <br />
            <span className="text-orange-500">any fire truck</span>
          </h1>
          <p className="text-white/50 text-center text-base mb-10">
            Paste a Garage listing URL below and download a board-ready invoice
            in seconds.
          </p>

          {/* Form card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-white/70 mb-2"
                >
                  Listing URL
                </label>
                <input
                  id="url"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (status.type !== "idle") setStatus({ type: "idle" });
                  }}
                  placeholder="https://www.shopgarage.com/listing/..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/70 mb-2"
                >
                  Email{" "}
                  <span className="text-white/30 font-normal">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="firechief@department.gov"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition"
                  disabled={isLoading}
                />
                <p className="text-white/25 text-xs mt-1.5">
                  Also send a copy to this address
                </p>
              </div>

              {/* Status messages */}
              {status.type === "error" && (
                <StatusBanner variant="error" message={status.message} />
              )}
              {status.type === "email-error" && (
                <StatusBanner
                  variant="warning"
                  message={`Invoice downloaded, but email failed: ${status.message}`}
                />
              )}
              {status.type === "success" && (
                <StatusBanner
                  variant="success"
                  message={
                    status.emailed
                      ? `Invoice downloaded and sent to ${email}`
                      : "Invoice downloaded successfully!"
                  }
                />
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-150 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating Invoice…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {email.trim() ? "Download & Send Invoice" : "Download PDF Invoice"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Example listings */}
          <div className="mt-6">
            <p className="text-white/30 text-xs text-center mb-3">
              Try an example listing
            </p>
            <div className="flex flex-col gap-2">
              {EXAMPLE_LISTINGS.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    setUrl(ex.url);
                    setStatus({ type: "idle" });
                  }}
                  className="group flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 transition text-left"
                >
                  <div>
                    <p className="text-white/80 text-xs font-medium group-hover:text-white transition">
                      {ex.name}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">{ex.price}</p>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-white/20 group-hover:text-orange-400 transition"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Garage. All rights reserved.
          </p>
          <a
            href="https://www.shopgarage.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/25 hover:text-orange-400 text-xs transition"
          >
            shopgarage.com →
          </a>
        </div>
      </footer>
    </main>
  );
}

function StatusBanner({
  variant,
  message,
}: {
  variant: "success" | "error" | "warning";
  message: string;
}) {
  const styles = {
    success: "bg-green-500/10 border-green-500/20 text-green-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  };

  return (
    <div className={`flex items-start gap-2.5 border rounded-xl px-4 py-3 ${styles[variant]}`}>
      <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {variant === "success" ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : variant === "warning" ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )}
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

const EXAMPLE_LISTINGS = [
  {
    id: "1",
    name: "2025 Toyne Freightliner 4x4 Pumper",
    price: "$800,000",
    url: "https://www.shopgarage.com/listing/2025-Toyne-Freightliner-4x4-Pumper-11653dfc-46ea-4c03-9f10-f9f6065909b1",
  },
  {
    id: "2",
    name: "2013 Spartan Sirius MFD 105",
    price: "$450,000",
    url: "https://www.shopgarage.com/listing/2013-Spartan-Sirius-MFD-105-5481a92e-6259-4ae7-b024-53af68b99848",
  },
  {
    id: "3",
    name: "2021 Pierce Rescue Pumper",
    price: "$549,000",
    url: "https://www.shopgarage.com/listing/2021-Pierce-Rescue-Pumper-599afbf6-9a59-4d02-8583-c4f411394eb2",
  },
];
