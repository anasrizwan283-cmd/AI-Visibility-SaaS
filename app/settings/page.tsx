"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Settings = {
  id: number;
  workspace_name: string;
  default_website: string;
  notifications: boolean;
  enhanced_analysis: boolean;
  created_at: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  const [workspaceName, setWorkspaceName] = useState("");
  const [defaultWebsite, setDefaultWebsite] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/settings"
      );

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      const data = await response.json();

      const loadedSettings = data.settings;

      setSettings(loadedSettings);
      setWorkspaceName(
        loadedSettings.workspace_name || ""
      );
      setDefaultWebsite(
        loadedSettings.default_website || ""
      );
      setNotifications(
        loadedSettings.notifications
      );
      setEnhancedAnalysis(
        loadedSettings.enhanced_analysis
      );
    } catch (err) {
      console.error(err);

      setError(
        "Could not load settings. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspace_name: workspaceName,
            default_website: defaultWebsite,
            notifications,
            enhanced_analysis: enhancedAnalysis,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();

      setSettings(data.settings);

      setMessage(
        "Settings saved successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        "Could not save settings. Make sure the backend is running."
      );
    } finally {
      setSaving(false);
    }
  }

  function resetSettings() {
    setWorkspaceName(
      settings?.workspace_name ||
        "AI Visibility Workspace"
    );

    setDefaultWebsite(
      settings?.default_website || ""
    );

    setNotifications(
      settings?.notifications ?? true
    );

    setEnhancedAnalysis(
      settings?.enhanced_analysis ?? true
    );

    setMessage("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">

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
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              Reports
            </Link>

            <Link
              href="/settings"
              className="rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white shadow-inner"
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

      {/* Content */}

      <section className="relative z-10 mx-auto max-w-5xl px-6 py-10 lg:px-8">

        {/* Heading */}

        <div className="mb-8">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">

            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />

            Workspace Settings

          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">

            Platform{" "}

            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">

              Settings

            </span>

          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">

            Manage your AI Visibility workspace, website preferences
            and analysis settings.

          </p>

        </div>

        {/* Loading */}

        {loading && (

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-12 text-center backdrop-blur-xl">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />

            <p className="mt-4 text-sm text-slate-500">
              Loading settings...
            </p>

          </div>

        )}

        {/* Error */}

        {!loading && error && (

          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">

            {error}

          </div>

        )}

        {/* Settings */}

        {!loading && (

          <div className="space-y-6">

            {/* Workspace */}

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl md:p-8">

              <div className="mb-6">

                <p className="text-sm font-medium text-violet-300">
                  Workspace
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Workspace Information
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Customize the basic information used by your workspace.
                </p>

              </div>

              <div className="space-y-5">

                {/* Workspace Name */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Workspace Name
                  </label>

                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) =>
                      setWorkspaceName(e.target.value)
                    }
                    placeholder="AI Visibility Workspace"
                    className="h-12 w-full rounded-xl border border-white/[0.10] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/60"
                  />

                </div>

                {/* Website */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Default Website
                  </label>

                  <input
                    type="url"
                    value={defaultWebsite}
                    onChange={(e) =>
                      setDefaultWebsite(e.target.value)
                    }
                    placeholder="https://example.com"
                    className="h-12 w-full rounded-xl border border-white/[0.10] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/60"
                  />

                  <p className="mt-2 text-xs text-slate-600">
                    This website can be used as your primary audit target.
                  </p>

                </div>

              </div>

            </div>

            {/* Preferences */}

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl md:p-8">

              <div className="mb-6">

                <p className="text-sm font-medium text-cyan-300">
                  Preferences
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Analysis & Notifications
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Control how your workspace handles analysis and notifications.
                </p>

              </div>

              <div className="space-y-4">

                {/* Notifications */}

                <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

                  <div>

                    <h4 className="font-semibold">
                      Notifications
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Enable workspace notifications and audit updates.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setNotifications(!notifications)
                    }
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      notifications
                        ? "bg-violet-600"
                        : "bg-slate-700"
                    }`}
                  >

                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                        notifications
                          ? "left-6"
                          : "left-1"
                      }`}
                    />

                  </button>

                </div>

                {/* Enhanced Analysis */}

                <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

                  <div>

                    <h4 className="font-semibold">
                      Enhanced Analysis
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Enable deeper website and visibility analysis.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEnhancedAnalysis(!enhancedAnalysis)
                    }
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      enhancedAnalysis
                        ? "bg-cyan-600"
                        : "bg-slate-700"
                    }`}
                  >

                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                        enhancedAnalysis
                          ? "left-6"
                          : "left-1"
                      }`}
                    />

                  </button>

                </div>

              </div>

            </div>

            {/* Status */}

            {message && (

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">

                ✓ {message}

              </div>

            )}

            {/* Actions */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={resetSettings}
                disabled={saving}
                className="rounded-xl border border-white/[0.10] bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3 text-sm font-semibold shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving
                  ? "Saving..."
                  : "Save Settings"}

                {!saving && (
                  <span className="ml-2">
                    →
                  </span>
                )}

              </button>

            </div>

            {/* Database Info */}

            {settings && (

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">

                <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">

                  <span>
                    Settings ID: #{settings.id}
                  </span>

                  <span>
                    Created:{" "}
                    {new Date(
                      settings.created_at
                    ).toLocaleString()}
                  </span>

                </div>

              </div>

            )}

          </div>

        )}

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