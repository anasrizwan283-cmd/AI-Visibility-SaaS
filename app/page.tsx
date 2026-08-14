  "use client";

  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";

  type Audit = {
    id: number;
    url: string;
    score: number;
    title: string;
    description: string;
    word_count: number;
    created_at: string;
  };

  export default function Home() {
    const router = useRouter();

    const [audits, setAudits] = useState<Audit[]>([]);
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const latestAudit = audits.length > 0 ? audits[0] : null;

    useEffect(() => {
      loadAudits();
    }, []);

    async function loadAudits() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/audits"
        );

        if (!response.ok) {
          throw new Error("Failed to load audits");
        }

        const data = await response.json();

        setAudits(data.audits || []);
      } catch (error) {
        console.error(error);
      }
    }

    async function analyzeWebsite() {
      if (!url.trim()) {
        setMessage("Please enter a website URL.");
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/analyze",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: url.trim(),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Website analysis failed");
        }

        const data = await response.json();

        if (!data.audit_id) {
          throw new Error("Audit ID was not returned by backend");
        }

        setUrl("");

        await loadAudits();

        router.push(`/reports/${data.audit_id}`);
      } catch (error) {
        console.error(error);

        setMessage(
          "Could not analyze the website. Make sure the backend is running and the URL is valid."
        );
      } finally {
        setLoading(false);
      }
    }

    function scoreLabel(score: number) {
      if (score >= 80) return "Excellent";
      if (score >= 60) return "Good";
      if (score >= 40) return "Needs Improvement";
      return "Poor";
    }

    return (
      <main className="min-h-screen overflow-hidden bg-[#050816] text-white">

        {/* Background Glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />

          <div className="absolute right-[-150px] top-[15%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[130px]" />
        </div>

        {/* Navigation */}
        <header className="relative z-10 border-b border-white/[0.07] bg-[#070b17]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-400 shadow-lg shadow-violet-500/20">
                <span className="text-xl font-black">
                  AI
                </span>
              </div>

              <div>
                <h1 className="text-sm font-bold tracking-wide">
                  AI Visibility
                </h1>

                <p className="text-[11px] text-slate-500">
                  Visibility & Growth Platform
                </p>
              </div>
            </a>

            {/* Navigation */}
            <nav className="hidden items-center gap-1 md:flex">

              <a
                href="/"
                className="rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white"
              >
                Dashboard
              </a>

              <a
                href="/audits"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                Audits
              </a>

              <a
                href="/reports"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                Reports
              </a>

              <a
                href="/settings"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                Settings
              </a>

            </nav>

            {/* Profile */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/30 bg-gradient-to-br from-violet-500/30 to-cyan-400/20 text-xs font-bold">
              AR
            </div>

          </div>
        </header>

        {/* Dashboard */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">

          {/* Welcome */}
          <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                Workspace Overview
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                AI Visibility{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Monitor your website, content, search presence and AI visibility
                from one central workspace.
              </p>

            </div>

            <button
              onClick={() => {
                document
                  .getElementById("audit-section")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5"
            >
              <span className="mr-2">+</span>
              Start New Audit
            </button>

          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* AI Visibility */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-400">
                  AI Visibility Score
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                  ✦
                </div>

              </div>

              <div className="mt-5 text-4xl font-bold">
                {latestAudit ? latestAudit.score : "—"}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {latestAudit
                  ? scoreLabel(latestAudit.score)
                  : "Run your first audit"}
              </p>

            </div>

            {/* Technical Health */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-400">
                  Technical Health
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                  ⌁
                </div>

              </div>

              <div className="mt-5 text-4xl font-bold">
                {latestAudit ? latestAudit.score : "—"}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Based on latest audit
              </p>

            </div>

            {/* Content */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-400">
                  Content Score
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  ◈
                </div>

              </div>

              <div className="mt-5 text-4xl font-bold">
                {latestAudit
                  ? Math.min(
                      100,
                      Math.round(
                        (latestAudit.word_count / 1000) * 100
                      )
                    )
                  : "—"}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Based on content volume
              </p>

            </div>

            {/* Audits */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-400">
                  Total Audits
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300">
                  ◎
                </div>

              </div>

              <div className="mt-5 text-4xl font-bold">
                {audits.length}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Saved website audits
              </p>

            </div>

          </div>

          {/* New Audit */}
          <div
            id="audit-section"
            className="relative mt-6 overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.10] via-white/[0.04] to-cyan-500/[0.06] shadow-2xl shadow-violet-950/20"
          >

            <div className="relative p-8 md:p-10">

              <div className="max-w-3xl">

                <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                  ✦ Get Started
                </span>

                <h3 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                  Start a new website audit
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Enter any website URL to analyze its technical health,
                  content quality and AI visibility signals.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                  <input
                    type="url"
                    value={url}
                    onChange={(e) =>
                      setUrl(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        analyzeWebsite();
                      }
                    }}
                    placeholder="https://example.com"
                    className="h-13 flex-1 rounded-xl border border-white/[0.10] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/60"
                  />

                  <button
                    onClick={analyzeWebsite}
                    disabled={loading}
                    className="h-13 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 text-sm font-semibold shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Analyzing..."
                      : "Analyze Website"}

                    {!loading && (
                      <span className="ml-2">
                        →
                      </span>
                    )}
                  </button>

                </div>

                {message && (
                  <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {message}
                  </div>
                )}

                <p className="mt-3 text-xs text-slate-600">
                  Your audit will automatically be saved to the database.
                </p>

              </div>

            </div>

          </div>

          {/* Latest Audit */}
          {latestAudit && (
            <div className="mt-10">

              <div className="mb-5">

                <p className="text-sm font-medium text-cyan-400">
                  Latest Audit
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  {latestAudit.title || "Website Audit"}
                </h3>

              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl">

                <div className="grid gap-6 md:grid-cols-4">

                  <div>
                    <p className="text-xs text-slate-500">
                      Website
                    </p>

                    <p className="mt-2 break-all text-sm font-medium text-white">
                      {latestAudit.url}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Visibility Score
                    </p>

                    <p className="mt-2 text-2xl font-bold text-violet-300">
                      {latestAudit.score}/100
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Content
                    </p>

                    <p className="mt-2 text-2xl font-bold text-emerald-300">
                      {latestAudit.word_count}
                    </p>

                    <p className="text-xs text-slate-500">
                      words
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Audit ID
                    </p>

                    <p className="mt-2 text-2xl font-bold text-cyan-300">
                      #{latestAudit.id}
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Audit History */}
          <div className="mt-12">

            <div className="mb-6">

              <p className="text-sm font-medium text-cyan-400">
                Audit History
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                Previous Website Audits
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                All website audits saved in your workspace.
              </p>

            </div>

            {audits.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 text-center text-sm text-slate-500">
                No audits yet. Run your first website audit above.
              </div>
            ) : (
              <div className="space-y-3">

                {audits.map((audit) => (

                  <div
                    key={audit.id}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-xl transition hover:border-violet-400/20 hover:bg-white/[0.06]"
                  >

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                      <div>

                        <div className="flex items-center gap-3">

                          <span className="rounded-lg bg-violet-500/10 px-2 py-1 text-xs font-bold text-violet-300">
                            #{audit.id}
                          </span>

                          <h4 className="font-semibold text-white">
                            {audit.title || "Untitled Website"}
                          </h4>

                        </div>

                        <p className="mt-2 break-all text-sm text-slate-500">
                          {audit.url}
                        </p>

                      </div>

                      <div className="flex flex-wrap items-center gap-6">

                        <div>
                          <p className="text-xs text-slate-600">
                            Score
                          </p>

                          <p className="mt-1 text-xl font-bold text-violet-300">
                            {audit.score}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600">
                            Words
                          </p>

                          <p className="mt-1 text-xl font-bold text-slate-300">
                            {audit.word_count}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600">
                            Date
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(
                              audit.created_at
                            ).toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            router.push(
                              `/reports/${audit.id}`
                            )
                          }
                          className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-violet-400/30 hover:bg-violet-500/10"
                        >
                          View Report →
                        </button>

                      </div>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </div>

          {/* Platform Modules */}
          <div className="mt-12">

            <div className="mb-6">

              <p className="text-sm font-medium text-cyan-400">
                Platform Modules
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                Visibility & Growth Analysis
              </h3>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              {[
                [
                  "01",
                  "Website Audit",
                  "Technical performance, crawlability, metadata and website health.",
                ],
                [
                  "02",
                  "AI Visibility",
                  "Track how your brand appears across AI-powered search experiences.",
                ],
                [
                  "03",
                  "Content Analysis",
                  "Identify content gaps and opportunities for better visibility.",
                ],
                [
                  "04",
                  "Competitor Analysis",
                  "Compare your website visibility against relevant competitors.",
                ],
              ].map(([number, title, description]) => (

                <div
                  key={number}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-violet-400/20"
                >

                  <div className="flex items-start gap-5">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-violet-300">
                      {number}
                    </div>

                    <div>

                      <h4 className="font-semibold">
                        {title}
                      </h4>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {description}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* Approval Notice */}
          <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-5">

            <div className="flex gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                !
              </div>

              <div>

                <h4 className="text-sm font-semibold text-amber-300">
                  Human approval is required
                </h4>

                <p className="mt-1 text-sm leading-6 text-amber-200/60">
                  Recommended actions will be reviewed before any execution or
                  publishing workflow takes place.
                </p>

              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-slate-600 sm:flex-row">
            <p>AI Visibility Platform</p>
            <p>Monitor • Analyze • Grow</p>
          </div>

        </section>
      </main>
    );
  }