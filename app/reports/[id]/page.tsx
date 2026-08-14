"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Recommendation = {
  priority: "critical" | "high" | "medium" | "low" | string;
  category?: string;
  issue: string;
  recommendation: string;
};

type Audit = {
  id: number;
  url: string;
  score: number;
  title: string;
  description: string;
  word_count: number;
  created_at: string;

  analysis: {
    url: string;
    title: string;
    description: string;

    headings: {
      h1: string[];
      h2: string[];
      h3: string[];
    };

    word_count: number;
    paragraph_count: number;
    canonical: string;
    robots: string;
    language: string;

    schema: {
      count: number;
      present: boolean;
      types?: string[];
    };

    images: {
      total: number;
      without_alt: number;
    };

    links: {
      internal: number;
      external: number;
      internal_urls?: string[];
      external_urls?: string[];
    };

    open_graph: {
      title: boolean;
      description: boolean;
      image?: boolean;
    };

    social?: {
      twitter_card: boolean;
      twitter_title: boolean;
    };

    robots_txt: boolean;
    robots_txt_content?: string;
    sitemap: boolean;

    content_signals?: {
      word_count: number;
      paragraph_count: number;
      has_h1: boolean;
      has_h2: boolean;
      has_h3: boolean;
      faq_detected: boolean;
      author_detected: boolean;
      semantic_score: number;
    };

    semantic_html?: {
      elements: {
        main: boolean;
        article: boolean;
        section: boolean;
        nav: boolean;
        header: boolean;
        footer: boolean;
      };
      score: number;
    };

    entity_signals?: {
      author: boolean;
      organization_schema: boolean;
      website_schema: boolean;
      article_schema: boolean;
      faq_schema: boolean;
      breadcrumb_schema: boolean;
    };

    ai_readiness?: {
      clear_title: boolean;
      clear_description: boolean;
      has_h1: boolean;
      structured_content: boolean;
      schema: boolean;
      faq: boolean;
      author: boolean;
      semantic_html: boolean;
      canonical: boolean;
      robots_txt: boolean;
      sitemap: boolean;
    };

    ai_readiness_score?: number;

    technical_signals?: {
      title_present: boolean;
      description_present: boolean;
      canonical_present: boolean;
      language_present: boolean;
      schema_present: boolean;
      open_graph: boolean;
      twitter_card: boolean;
      robots_txt: boolean;
      sitemap: boolean;
    };

    faq_detected: boolean;
    author_detected: boolean;

    crawl?: {
      start_url: string;
      domain: string;
      max_pages: number;
      pages_discovered: number;
      pages_crawled: number;
      failed_pages: unknown[];
      pages: unknown[];
      summary?: {
        pages_with_title: number;
        pages_with_description: number;
        pages_with_h1: number;
        pages_with_schema: number;
        pages_with_canonical: number;
        pages_with_open_graph: number;
        pages_with_faq: number;
        pages_with_author: number;
        average_ai_readiness: number;
        average_word_count: number;
        total_internal_links: number;
        total_external_links: number;
      };
    };
  };

  visibility: {
    score: number;
    level?: string;
    max_score?: number;

    breakdown?: {
      content?: {
        score: number;
        max: number;
      };
      technical?: {
        score: number;
        max: number;
      };
      structured_data?: {
        score: number;
        max: number;
      };
      crawlability?: {
        score: number;
        max: number;
      };
      semantic_html?: {
        score: number;
        max: number;
      };
      entity_authority?: {
        score: number;
        max: number;
      };
      social?: {
        score: number;
        max: number;
      };
      ai_readiness?: {
        score: number;
        max: number;
      };
    };

    checks: Record<string, boolean>;
  };

  recommendations: Recommendation[];

  technical_analysis?: {
    summary?: {
      pages_crawled?: number;
      unique_pages?: number;
      successful_pages?: number;
      failed_pages?: number;
      pages_without_title?: number;
      thin_content_pages?: number;
      total_words?: number;
      average_word_count?: number;
    };

    crawl_metadata?: {
      credits_used?: number;
      duration?: number;
    };
  } | null;

  crawl_metrics?: {
    crawl_pages?: number;
    unique_pages?: number;
    successful_pages?: number;
    failed_pages?: number;
    pages_without_title?: number;
    thin_content_pages?: number;
    total_crawl_words?: number;
    average_crawl_words?: number;
    crawl_credits_used?: number;
    crawl_duration?: number;
  };
};

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id;

  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    loadReport();
  }, [id]);

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/audits/${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to load report");
      }

      const data = await response.json();

      setAudit(data.audit);
    } catch (error) {
      console.error(error);

      setError(
        "Could not load this report. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function scoreStatus(score: number) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    if (score >= 30) return "Poor";

    return "Critical";
  }

  function scoreColor(score: number) {
    if (score >= 80) return "text-emerald-300";
    if (score >= 60) return "text-cyan-300";
    if (score >= 40) return "text-amber-300";
    if (score >= 30) return "orange";
    return "text-red-300";
  }

  function checkLabel(key: string) {
    const labels: Record<string, string> = {
      title: "Page Title",
      description: "Meta Description",
      h1: "H1 Heading",
      h2: "H2 Headings",
      content: "Content Volume",
      schema: "Structured Data",
      canonical: "Canonical URL",
      robots_txt: "Robots.txt",
      sitemap: "XML Sitemap",
      open_graph: "Open Graph",
      semantic_html: "Semantic HTML",
      author: "Author Information",
      faq: "FAQ Content",
      organization: "Organization Entity",
      internal_links: "Internal Links",
    };

    return labels[key] || key.replaceAll("_", " ");
  }

  function priorityClasses(priority: string) {
    switch (priority) {
      case "critical":
        return "border-red-400/20 bg-red-500/[0.08] text-red-300";

      case "high":
        return "border-orange-400/20 bg-orange-500/[0.07] text-orange-300";

      case "medium":
        return "border-amber-400/20 bg-amber-500/[0.06] text-amber-300";

      default:
        return "border-cyan-400/20 bg-cyan-500/[0.05] text-cyan-300";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />

            <p className="mt-4 text-sm text-slate-500">
              Loading report...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !audit) {
    return (
      <main className="min-h-screen bg-[#050816] text-white">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl text-red-400">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Report Not Found
            </h2>

            <p className="mt-2 text-sm text-red-300">
              {error || "This audit does not exist."}
            </p>

            <Link
              href="/reports"
              className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold"
            >
              Back to Reports
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const passedChecks = Object.values(
    audit.visibility.checks || {}
  ).filter(Boolean).length;

  const totalChecks = Object.keys(
    audit.visibility.checks || {}
  ).length;

  const failedChecks = totalChecks - passedChecks;

  const visibilityLevel =
    audit.visibility.level || scoreStatus(audit.score);

  const aiReadinessScore =
    audit.analysis.ai_readiness_score ?? 0;

  const semanticScore =
    audit.analysis.semantic_html?.score ?? 0;

  const technicalSummary =
    audit.technical_analysis?.summary ||
    null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* Background Glow */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />

        <div className="absolute right-[-150px] top-[15%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[130px]" />
      </div>

      {/* Header */}

      <header className="relative z-10 border-b border-white/[0.07] bg-[#070b17]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

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
              className="rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white"
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

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/30 bg-gradient-to-br from-violet-500/30 to-cyan-400/20 text-xs font-bold">
            AR
          </div>

        </div>
      </header>

      {/* Content */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Back */}

        <Link
          href="/reports"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          ← Back to Reports
        </Link>

        {/* Heading */}

        <div className="mb-8">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Website Audit Report
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {audit.title || "Website Audit"}
          </h2>

          <p className="mt-3 break-all text-sm text-slate-500">
            {audit.url}
          </p>

          <p className="mt-2 text-xs text-slate-600">
            Audit #{audit.id} •{" "}
            {new Date(audit.created_at).toLocaleString()}
          </p>

        </div>

        {/* Score Overview */}

        <div className="grid gap-4 lg:grid-cols-3">

          {/* Main Score */}

          <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.12] to-cyan-500/[0.05] p-7">

            <p className="text-sm font-medium text-slate-400">
              AI Visibility Score
            </p>

            <div className="mt-5 flex items-end gap-3">

              <span
                className={`text-6xl font-black ${scoreColor(
                  audit.score
                )}`}
              >
                {audit.score}
              </span>

              <span className="mb-2 text-sm text-slate-500">
                / {audit.visibility.max_score || 100}
              </span>

            </div>

            <p className="mt-3 text-sm font-semibold text-cyan-300">
              {visibilityLevel}
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, audit.score)
                  )}%`,
                }}
              />
            </div>

          </div>

          {/* Passed */}

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.045] p-7">

            <p className="text-sm text-slate-400">
              Checks Passed
            </p>

            <p className="mt-5 text-5xl font-black text-emerald-300">
              {passedChecks}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              out of {totalChecks} visibility checks
            </p>

          </div>

          {/* Failed */}

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.045] p-7">

            <p className="text-sm text-slate-400">
              Improvements Needed
            </p>

            <p className="mt-5 text-5xl font-black text-amber-300">
              {failedChecks}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              areas need attention
            </p>

          </div>

        </div>

        {/* Score Breakdown */}

        {audit.visibility.breakdown && (
          <div className="mt-8">

            <div className="mb-6">
              <p className="text-sm font-medium text-cyan-400">
                Visibility Breakdown
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                AI Visibility Categories
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                How your website performs across the major visibility signals.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              {Object.entries(
                audit.visibility.breakdown
              ).map(([key, value]) => {

                if (!value) return null;

                const percentage =
                  value.max > 0
                    ? Math.round(
                        (value.score / value.max) * 100
                      )
                    : 0;

                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5"
                  >

                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold capitalize">
                        {key.replaceAll("_", " ")}
                      </p>

                      <span className="text-xs text-slate-500">
                        {value.score}/{value.max}
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      {percentage}% performance
                    </p>

                  </div>
                );
              })}

            </div>

          </div>
        )}

        {/* Website Overview */}

        <div className="mt-10">

          <div className="mb-5">
            <p className="text-sm font-medium text-cyan-400">
              Website Overview
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              Page Information
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <p className="text-xs text-slate-600">
                Word Count
              </p>

              <p className="mt-3 text-2xl font-bold">
                {audit.analysis.word_count}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                words
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <p className="text-xs text-slate-600">
                Paragraphs
              </p>

              <p className="mt-3 text-2xl font-bold">
                {audit.analysis.paragraph_count}
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <p className="text-xs text-slate-600">
                Images
              </p>

              <p className="mt-3 text-2xl font-bold">
                {audit.analysis.images.total}
              </p>

              <p className="mt-1 text-xs text-red-400">
                {audit.analysis.images.without_alt} without alt
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <p className="text-xs text-slate-600">
                Language
              </p>

              <p className="mt-3 text-2xl font-bold uppercase">
                {audit.analysis.language || "N/A"}
              </p>
            </div>

          </div>

        </div>

        {/* AI Readiness */}

        <div className="mt-10">

          <div className="mb-6">
            <p className="text-sm font-medium text-cyan-400">
              AI Readiness
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              How Ready Is This Website for AI Systems?
            </h3>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">

            <div className="rounded-3xl border border-violet-400/20 bg-violet-500/[0.06] p-7">

              <p className="text-sm text-slate-400">
                AI Readiness Score
              </p>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-violet-300">
                  {aiReadinessScore}
                </span>

                <span className="mb-1 text-sm text-slate-500">
                  / 100
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, aiReadinessScore)
                    )}%`,
                  }}
                />
              </div>

            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7">

              <p className="text-sm text-slate-400">
                Semantic HTML Score
              </p>

              <p className="mt-4 text-5xl font-black text-cyan-300">
                {semanticScore}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                semantic structure quality
              </p>

            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7">

              <p className="text-sm text-slate-400">
                Entity Signals
              </p>

              <p className="mt-4 text-5xl font-black text-emerald-300">
                {
                  Object.values(
                    audit.analysis.entity_signals || {}
                  ).filter(Boolean).length
                }
              </p>

              <p className="mt-2 text-xs text-slate-500">
                detected authority signals
              </p>

            </div>

          </div>

        </div>

        {/* Visibility Checks */}

        <div className="mt-10">

          <div className="mb-6">
            <p className="text-sm font-medium text-cyan-400">
              Visibility Analysis
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              SEO & AI Visibility Checks
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Technical and content signals detected during the website audit.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">

            {Object.entries(
              audit.visibility.checks || {}
            ).map(([key, passed]) => (
              <div
                key={key}
                className={`flex items-center justify-between rounded-2xl border p-5 ${
                  passed
                    ? "border-emerald-400/15 bg-emerald-500/[0.05]"
                    : "border-red-400/15 bg-red-500/[0.05]"
                }`}
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      passed
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    {passed ? "✓" : "!"}
                  </div>

                  <div>
                    <p className="font-semibold capitalize">
                      {checkLabel(key)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {passed
                        ? "Detected successfully"
                        : "Not detected"}
                    </p>
                  </div>

                </div>

                <span
                  className={`text-xs font-bold ${
                    passed
                      ? "text-emerald-300"
                      : "text-red-300"
                  }`}
                >
                  {passed ? "PASS" : "FAIL"}
                </span>

              </div>
            ))}

          </div>

        </div>

        {/* Technical Details */}

        <div className="mt-10">

          <div className="mb-6">
            <p className="text-sm font-medium text-cyan-400">
              Technical Analysis
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              Website Technical Details
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* Headings */}

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">

              <h4 className="font-semibold">
                Headings
              </h4>

              <div className="mt-5 grid grid-cols-3 gap-4">

                <div>
                  <p className="text-xs text-slate-600">
                    H1
                  </p>

                  <p className="mt-2 text-2xl font-bold text-violet-300">
                    {audit.analysis.headings.h1.length}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-600">
                    H2
                  </p>

                  <p className="mt-2 text-2xl font-bold text-cyan-300">
                    {audit.analysis.headings.h2.length}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-600">
                    H3
                  </p>

                  <p className="mt-2 text-2xl font-bold text-fuchsia-300">
                    {audit.analysis.headings.h3.length}
                  </p>
                </div>

              </div>

            </div>

            {/* Links */}

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">

              <h4 className="font-semibold">
                Links
              </h4>

              <div className="mt-5 grid grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-slate-600">
                    Internal Links
                  </p>

                  <p className="mt-2 text-2xl font-bold text-violet-300">
                    {audit.analysis.links.internal}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-600">
                    External Links
                  </p>

                  <p className="mt-2 text-2xl font-bold text-cyan-300">
                    {audit.analysis.links.external}
                  </p>
                </div>

              </div>

            </div>

            {/* Schema */}

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">

              <h4 className="font-semibold">
                Structured Data
              </h4>

              <p className="mt-5 text-3xl font-bold">
                {audit.analysis.schema.count}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Schema / JSON-LD blocks found
              </p>

              {audit.analysis.schema.types &&
                audit.analysis.schema.types.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {audit.analysis.schema.types.map(
                      (type) => (
                        <span
                          key={type}
                          className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300"
                        >
                          {type}
                        </span>
                      )
                    )}
                  </div>
                )}

            </div>

            {/* Social */}

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">

              <h4 className="font-semibold">
                Social & Open Graph
              </h4>

              <div className="mt-5 space-y-3">

                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">
                    OG Title
                  </span>

                  <span
                    className={
                      audit.analysis.open_graph.title
                        ? "text-emerald-300"
                        : "text-red-300"
                    }
                  >
                    {audit.analysis.open_graph.title
                      ? "Present"
                      : "Missing"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">
                    OG Description
                  </span>

                  <span
                    className={
                      audit.analysis.open_graph.description
                        ? "text-emerald-300"
                        : "text-red-300"
                    }
                  >
                    {audit.analysis.open_graph.description
                      ? "Present"
                      : "Missing"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">
                    OG Image
                  </span>

                  <span
                    className={
                      audit.analysis.open_graph.image
                        ? "text-emerald-300"
                        : "text-red-300"
                    }
                  >
                    {audit.analysis.open_graph.image
                      ? "Present"
                      : "Missing"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">
                    Twitter Card
                  </span>

                  <span
                    className={
                      audit.analysis.social?.twitter_card
                        ? "text-emerald-300"
                        : "text-red-300"
                    }
                  >
                    {audit.analysis.social?.twitter_card
                      ? "Present"
                      : "Missing"}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Semantic + Entity */}

        <div className="mt-10 grid gap-4 lg:grid-cols-2">

          {/* Semantic HTML */}

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6">

            <p className="text-sm font-medium text-cyan-400">
              Semantic Structure
            </p>

            <h3 className="mt-1 text-xl font-bold">
              Semantic HTML Elements
            </h3>

            <div className="mt-6 grid grid-cols-2 gap-3">

              {Object.entries(
                audit.analysis.semantic_html?.elements || {}
              ).map(([element, present]) => (
                <div
                  key={element}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
                >
                  <span className="text-sm capitalize text-slate-300">
                    {element}
                  </span>

                  <span
                    className={
                      present
                        ? "text-emerald-300"
                        : "text-red-300"
                    }
                  >
                    {present ? "✓" : "✕"}
                  </span>
                </div>
              ))}

            </div>

          </div>

          {/* Entity */}

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6">

            <p className="text-sm font-medium text-cyan-400">
              Entity Authority
            </p>

            <h3 className="mt-1 text-xl font-bold">
              Entity Signals
            </h3>

            <div className="mt-6 space-y-3">

              {Object.entries(
                audit.analysis.entity_signals || {}
              ).map(([key, present]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
                >
                  <span className="text-sm capitalize text-slate-300">
                    {key.replaceAll("_", " ")}
                  </span>

                  <span
                    className={
                      present
                        ? "font-semibold text-emerald-300"
                        : "font-semibold text-red-300"
                    }
                  >
                    {present ? "Detected" : "Missing"}
                  </span>
                </div>
              ))}

            </div>

          </div>

        </div>

        {/* URLs */}

        <div className="mt-10">

          <div className="mb-6">
            <p className="text-sm font-medium text-cyan-400">
              Technical URLs
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              Crawlability Signals
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">

              <p className="text-xs text-slate-600">
                Canonical URL
              </p>

              <p className="mt-3 break-all text-sm text-slate-300">
                {audit.analysis.canonical || "Not detected"}
              </p>

            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">

              <p className="text-xs text-slate-600">
                Robots.txt
              </p>

              <p
                className={`mt-3 font-semibold ${
                  audit.analysis.robots_txt
                    ? "text-emerald-300"
                    : "text-red-300"
                }`}
              >
                {audit.analysis.robots_txt
                  ? "Found"
                  : "Not Found"}
              </p>

            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">

              <p className="text-xs text-slate-600">
                Sitemap
              </p>

              <p
                className={`mt-3 font-semibold ${
                  audit.analysis.sitemap
                    ? "text-emerald-300"
                    : "text-red-300"
                }`}
              >
                {audit.analysis.sitemap
                  ? "Found"
                  : "Not Found"}
              </p>

            </div>

          </div>

        </div>

        {/* Firecrawl Technical Crawl */}

        {(technicalSummary || audit.crawl_metrics) && (
          <div className="mt-10">

            <div className="mb-6">
              <p className="text-sm font-medium text-cyan-400">
                Enhanced Crawl
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                Technical Crawl Analysis
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Detailed multi-page crawl metrics from the enhanced analysis.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
                <p className="text-xs text-slate-600">
                  Pages Crawled
                </p>

                <p className="mt-3 text-2xl font-bold">
                  {audit.crawl_metrics?.crawl_pages ??
                    technicalSummary?.pages_crawled ??
                    0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
                <p className="text-xs text-slate-600">
                  Successful Pages
                </p>

                <p className="mt-3 text-2xl font-bold text-emerald-300">
                  {audit.crawl_metrics?.successful_pages ??
                    technicalSummary?.successful_pages ??
                    0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
                <p className="text-xs text-slate-600">
                  Thin Content Pages
                </p>

                <p className="mt-3 text-2xl font-bold text-amber-300">
                  {audit.crawl_metrics?.thin_content_pages ??
                    technicalSummary?.thin_content_pages ??
                    0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
                <p className="text-xs text-slate-600">
                  Total Crawl Words
                </p>

                <p className="mt-3 text-2xl font-bold text-cyan-300">
                  {audit.crawl_metrics?.total_crawl_words ??
                    technicalSummary?.total_words ??
                    0}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* Recommendations */}

        <div className="mt-10">

          <div className="mb-6">
            <p className="text-sm font-medium text-cyan-400">
              Recommendations
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              Recommended Improvements
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Prioritized actions that can improve your website's AI visibility.
            </p>
          </div>

          {audit.recommendations.length === 0 ? (

            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.05] p-6 text-sm text-emerald-300">
              Great! No recommendations were generated for this audit.
            </div>

          ) : (

            <div className="space-y-4">

              {audit.recommendations.map(
                (recommendation, index) => (

                  <div
                    key={index}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5"
                  >

                    <div className="flex gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-sm font-bold text-violet-300">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase ${priorityClasses(
                              recommendation.priority
                            )}`}
                          >
                            {recommendation.priority}
                          </span>

                          {recommendation.category && (
                            <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-500">
                              {recommendation.category.replaceAll(
                                "_",
                                " "
                              )}
                            </span>
                          )}

                        </div>

                        <h4 className="mt-3 text-base font-semibold">
                          {recommendation.issue}
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {recommendation.recommendation}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* Approval Notice */}

        <div className="mt-8 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-5">

          <div className="flex gap-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              !
            </div>

            <div>

              <h4 className="text-sm font-semibold text-amber-300">
                Human approval is required
              </h4>

              <p className="mt-1 text-sm leading-6 text-amber-200/60">
                Recommendations are provided for review.
                No publishing or execution happens automatically.
              </p>

            </div>

          </div>

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