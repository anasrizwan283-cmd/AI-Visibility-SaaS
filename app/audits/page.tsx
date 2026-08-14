"use client";

import { useEffect, useState } from "react";

type Audit = {
  id: number;
  url: string;
  score: number;
  title: string;
  description: string;
  word_count: number;
  created_at: string;
};

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAudits();
  }, []);

  async function loadAudits() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/audits"
      );

      if (!response.ok) {
        throw new Error("Failed to load audits");
      }

      const data = await response.json();

      setAudits(data.audits || []);
    } catch (err) {
      console.error(err);
      setError(
        "Could not load audits. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function getScoreStatus(score: number) {
    if (score >= 80) {
      return "Excellent";
    }

    if (score >= 60) {
      return "Good";
    }

    if (score >= 40) {
      return "Needs Improvement";
    }

    return "Poor";
  }

  return (
    <main className="min-h-screen bg-[#070b17] text-white">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />

        <div className="absolute right-[-150px] top-[15%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[130px]" />
      </div>

      {/* Header */}
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
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              Dashboard
            </a>

            <a
              href="/audits"
              className="rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white"
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

      {/* Content */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Heading */}
        <div className="mb-8">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Audit Workspace
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Website{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Audits
            </span>
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            View and manage all website audits saved in your AI Visibility workspace.
          </p>

        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">
            <p className="text-sm text-slate-500">
              Total Audits
            </p>

            <p className="mt-3 text-3xl font-bold">
              {audits.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">
            <p className="text-sm text-slate-500">
              Latest Score
            </p>

            <p className="mt-3 text-3xl font-bold text-violet-300">
              {audits.length > 0
                ? audits[0].score
                : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">
            <p className="text-sm text-slate-500">
              Latest Website
            </p>

            <p className="mt-3 truncate text-sm font-semibold text-white">
              {audits.length > 0
                ? audits[0].url
                : "No audit yet"}
            </p>
          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />

            <p className="mt-4 text-sm text-slate-500">
              Loading audits...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          audits.length === 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-300">
                ✦
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No audits yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Run your first website audit from the dashboard.
              </p>

              <a
                href="/"
                className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold"
              >
                Go to Dashboard
              </a>

            </div>
          )}

        {/* Audit List */}
        {!loading &&
          !error &&
          audits.length > 0 && (
            <div className="space-y-4">

              {audits.map((audit) => (
                <div
                  key={audit.id}
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.06]"
                >

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* Website */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-3">

                        <span className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-300">
                          #{audit.id}
                        </span>

                        <h3 className="truncate font-semibold text-white">
                          {audit.title || "Untitled Website"}
                        </h3>

                      </div>

                      <p className="mt-3 truncate text-sm text-slate-500">
                        {audit.url}
                      </p>

                      <p className="mt-2 text-xs text-slate-600">
                        {new Date(
                          audit.created_at
                        ).toLocaleString()}
                      </p>

                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-8">

                      <div>
                        <p className="text-xs text-slate-600">
                          Score
                        </p>

                        <p className="mt-1 text-2xl font-bold text-violet-300">
                          {audit.score}
                        </p>

                        <p className="text-xs text-slate-500">
                          {getScoreStatus(audit.score)}
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

                      {/* View */}
                      <a
                      href={`/reports/${audit.id}`} 
                        className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-violet-400/30 hover:bg-violet-500/10"
                      >
                        View Report →
                      </a>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

      </section>

    </main>
  );
}