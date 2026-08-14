"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Audit = {
  id: number;
  url: string;
  score: number;
  title: string;
  description: string;
  word_count: number;
  created_at: string;
};

type Filter = "all" | "excellent" | "good" | "needs" | "poor";

export default function ReportsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/audits"
      );

      if (!response.ok) {
        throw new Error("Failed to load reports");
      }

      const data = await response.json();

      setAudits(data.audits || []);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load reports. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function getScoreStatus(score: number) {
    if (score >= 80) {
      return {
        label: "Excellent",
        className:
          "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
      };
    }

    if (score >= 60) {
      return {
        label: "Good",
        className:
          "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
      };
    }

    if (score >= 40) {
      return {
        label: "Needs Improvement",
        className:
          "border-amber-400/20 bg-amber-500/10 text-amber-300",
      };
    }

    return {
      label: "Poor",
      className:
        "border-red-400/20 bg-red-500/10 text-red-300",
    };
  }

  const averageScore = useMemo(() => {
    if (audits.length === 0) return 0;

    const total = audits.reduce(
      (sum, audit) => sum + audit.score,
      0
    );

    return Math.round(total / audits.length);
  }, [audits]);

  const bestScore = useMemo(() => {
    if (audits.length === 0) return 0;

    return Math.max(
      ...audits.map((audit) => audit.score)
    );
  }, [audits]);

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        audit.url.toLowerCase().includes(query) ||
        audit.title.toLowerCase().includes(query);

      let matchesFilter = true;

      if (filter === "excellent") {
        matchesFilter = audit.score >= 80;
      }

      if (filter === "good") {
        matchesFilter =
          audit.score >= 60 && audit.score < 80;
      }

      if (filter === "needs") {
        matchesFilter =
          audit.score >= 40 && audit.score < 60;
      }

      if (filter === "poor") {
        matchesFilter = audit.score < 40;
      }

      return matchesSearch && matchesFilter;
    });
  }, [audits, search, filter]);

  const latestAudit =
    audits.length > 0 ? audits[0] : null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />

        <div className="absolute right-[-150px] top-[15%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[130px]" />

      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.07] bg-[#070b17]/80 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          {/* Logo */}
          <Link
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

          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">

            <Link
              href="/"
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/audits"
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              Audits
            </Link>

            <Link
              href="/reports"
              className="rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white shadow-inner"
            >
              Reports
            </Link>

            <Link
              href="/settings"
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              Settings
            </Link>

          </nav>

          {/* Profile */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/30 bg-gradient-to-br from-violet-500/30 to-cyan-400/20 text-xs font-bold">
            AR
          </div>

        </div>

      </header>

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">

              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />

              Reports Center

            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">

              Website{" "}

              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Reports
              </span>

            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Review your website visibility performance,
              audit scores and detailed analysis reports.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={() => loadReports(true)}
              disabled={refreshing}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            <Link
              href="/"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5"
            >
              + New Audit
            </Link>

          </div>

        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">

            <p className="text-sm text-slate-400">
              Total Reports
            </p>

            <p className="mt-3 text-3xl font-bold">
              {loading ? "—" : audits.length}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Saved website audits
            </p>

          </div>

          {/* Average */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">

            <p className="text-sm text-slate-400">
              Average Score
            </p>

            <p className="mt-3 text-3xl font-bold text-violet-300">
              {loading
                ? "—"
                : audits.length > 0
                  ? `${averageScore}/100`
                  : "—"}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Across all reports
            </p>

          </div>

          {/* Best */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">

            <p className="text-sm text-slate-400">
              Best Score
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-300">
              {loading
                ? "—"
                : audits.length > 0
                  ? `${bestScore}/100`
                  : "—"}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Highest visibility score
            </p>

          </div>

          {/* Latest */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl">

            <p className="text-sm text-slate-400">
              Latest Website
            </p>

            <p className="mt-3 truncate text-sm font-semibold text-white">
              {loading
                ? "Loading..."
                : latestAudit
                  ? latestAudit.url
                  : "No reports yet"}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Most recently analyzed
            </p>

          </div>

        </div>

        {/* Search + Filters */}
        {!loading && !error && audits.length > 0 && (
          <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* Search */}
              <div className="relative flex-1">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by website or title..."
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                />

              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">

                {[
                  ["all", "All"],
                  ["excellent", "Excellent"],
                  ["good", "Good"],
                  ["needs", "Needs Work"],
                  ["poor", "Poor"],
                ].map(([value, label]) => (

                  <button
                    key={value}
                    onClick={() =>
                      setFilter(value as Filter)
                    }
                    className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                      filter === value
                        ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/20"
                        : "bg-white/[0.04] text-slate-500 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {label}
                  </button>

                ))}

              </div>

            </div>

          </div>
        )}

        {/* Reports */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl">

          <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] p-6 sm:flex-row sm:items-center">

            <div>

              <h3 className="text-xl font-bold">
                All Reports
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your generated website visibility reports.
              </p>

            </div>

            {!loading && !error && audits.length > 0 && (
              <div className="text-xs text-slate-600">
                Showing {filteredAudits.length} of{" "}
                {audits.length}
              </div>
            )}

          </div>

          {/* Loading */}
          {loading && (
            <div className="p-12 text-center">

              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />

              <p className="mt-4 text-sm text-slate-500">
                Loading reports...
              </p>

            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-xl text-red-400">
                !
              </div>

              <h3 className="mt-5 font-semibold">
                Reports unavailable
              </h3>

              <p className="mt-2 text-sm text-red-300">
                {error}
              </p>

              <button
                onClick={() => loadReports(true)}
                className="mt-6 rounded-xl bg-white/[0.06] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.1]"
              >
                Try Again
              </button>

            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            audits.length === 0 && (
              <div className="p-12 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-400">
                  ◈
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No reports yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Run your first website audit to generate
                  a detailed visibility report.
                </p>

                <Link
                  href="/"
                  className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5"
                >
                  Start Website Audit
                </Link>

              </div>
            )}

          {/* No Search Results */}
          {!loading &&
            !error &&
            audits.length > 0 &&
            filteredAudits.length === 0 && (
              <div className="p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-xl text-slate-500">
                  ⌕
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No matching reports
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search term or score filter.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="mt-5 rounded-xl bg-white/[0.06] px-5 py-3 text-sm font-semibold hover:bg-white/[0.1]"
                >
                  Clear Filters
                </button>

              </div>
            )}

          {/* Report List */}
          {!loading &&
            !error &&
            filteredAudits.length > 0 && (
              <div className="divide-y divide-white/[0.06]">

                {filteredAudits.map((audit, index) => {

                  const status =
                    getScoreStatus(audit.score);

                  return (
                    <div
                      key={audit.id}
                      className="group p-6 transition hover:bg-white/[0.035]"
                    >

                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        {/* Website */}
                        <div className="min-w-0 flex-1">

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-violet-300 ring-1 ring-white/[0.08]">
                              ◈
                            </div>

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <h4 className="truncate font-semibold text-white">
                                  {audit.title ||
                                    "Untitled Website"}
                                </h4>

                                {index === 0 && (
                                  <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                                    Latest
                                  </span>
                                )}

                              </div>

                              <p className="mt-1 truncate text-sm text-slate-500">
                                {audit.url}
                              </p>

                            </div>

                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">

                            <span className="rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                              Audit #{audit.id}
                            </span>

                            <span className="rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                              {audit.word_count} words
                            </span>

                            <span className="rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                              {new Date(
                                audit.created_at
                              ).toLocaleString()}
                            </span>

                          </div>

                        </div>

                        {/* Score + Status + Action */}
                        <div className="flex flex-wrap items-center gap-5">

                          {/* Status */}
                          <span
                            className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${status.className}`}
                          >
                            {status.label}
                          </span>

                          {/* Score */}
                          <div className="min-w-[70px] text-center">

                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                              Visibility
                            </p>

                            <p className="mt-1 text-2xl font-bold text-violet-300">
                              {audit.score}
                            </p>

                            <p className="text-[10px] text-slate-600">
                              / 100
                            </p>

                          </div>

                          {/* Action */}
                          <Link
                            href={`/reports/${audit.id}`}
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-violet-600/10 transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-fuchsia-500"
                          >
                            View Report
                            <span className="ml-2">
                              →
                            </span>
                          </Link>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-slate-600 sm:flex-row">

          <p>
            AI Visibility Platform
          </p>

          <p>
            Monitor • Analyze • Grow
          </p>

        </div>

      </section>

    </main>
  );
}