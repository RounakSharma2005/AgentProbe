
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Database,
  Clock,
  FileJson,
  Loader2,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type Scenario = "success" | "failure";

type RecordResult = {
  success: boolean;
  message: string;
  recording: {
    scenario: string;
    run_id: string;
    cassette_path: string;
    interaction_count: number;
    integrity_verified: boolean;
    final_output: string;
  };
};

type ReplayResult = {
  success: boolean;
  message: string;
  replay: {
    scenario: string;
    cassette_path: string;
    integrity_verified: boolean;
    total_interactions: number;
    replayed_interactions: {
      sequence: number;
      kind: string;
      method: string;
      status: string;
      response: unknown;
    }[];
    all_interactions_consumed: boolean;
    responses_match: boolean;
    replay_passed: boolean;
  };
};

export default function ReplayPage() {
  const [scenario, setScenario] = useState<Scenario>("success");
  const [recordResult, setRecordResult] = useState<RecordResult | null>(null);
  const [replayResult, setReplayResult] = useState<ReplayResult | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [replayLoading, setReplayLoading] = useState(false);
  const [error, setError] = useState("");

  async function recordExecution() {
    setRecordLoading(true);
    setError("");
    setRecordResult(null);
    setReplayResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/demo/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Recording failed.");
      }

      setRecordResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to record execution."
      );
    } finally {
      setRecordLoading(false);
    }
  }

  async function replayExecution() {
    setReplayLoading(true);
    setError("");
    setReplayResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/demo/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Replay failed.");
      }

      setReplayResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to replay execution."
      );
    } finally {
      setReplayLoading(false);
    }
  }

  const replay = replayResult?.replay;

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <nav className="border-b border-white/10 bg-[#0b0f18]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="rounded-lg bg-violet-500/15 p-2 text-violet-400">
              <Radio size={19} />
            </div>
            AgentProbe
          </Link>

          <div className="flex gap-5 text-sm text-gray-400">
            <Link href="/playground" className="hover:text-white">
              Playground
            </Link>
            <Link href="/evaluations" className="hover:text-white">
              Evaluations
            </Link>
            <Link href="/traces" className="hover:text-white">
              Traces
            </Link>
            <Link href="/replay" className="hover:text-white">
               Record & Replay
            </Link>
            <Link href="/docs" className="hover:text-white">
                Docs
                </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/playground"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Playground
        </Link>

        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-400">
            <Database size={16} />
            AGENT RELIABILITY TOOLING
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Record & Replay
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Capture agent interactions into a cassette, then replay the
            recorded requests and verify that the original responses remain
            consistent.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-2xl border border-white/10 bg-[#101522] p-6">
            <h2 className="text-lg font-semibold">Execution setup</h2>
            <p className="mt-2 text-sm text-gray-400">
              Choose a customer support scenario to record.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  setScenario("success");
                  setRecordResult(null);
                  setReplayResult(null);
                  setError("");
                }}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  scenario === "success"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Successful execution</span>
                  {scenario === "success" && (
                    <CheckCircle2 className="text-violet-400" size={18} />
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Agent uses the tools and returns the expected response.
                </p>
              </button>

              <button
                onClick={() => {
                  setScenario("failure");
                  setRecordResult(null);
                  setReplayResult(null);
                  setError("");
                }}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  scenario === "failure"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Failure scenario</span>
                  {scenario === "failure" && (
                    <XCircle className="text-violet-400" size={18} />
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Agent produces an intentionally incorrect answer.
                </p>
              </button>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={recordExecution}
                disabled={recordLoading || replayLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {recordLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Radio size={18} />
                )}
                {recordLoading ? "Recording..." : "Record execution"}
              </button>

              <button
                onClick={replayExecution}
                disabled={!recordResult || recordLoading || replayLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-medium transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {replayLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Play size={18} />
                )}
                {replayLoading ? "Replaying..." : "Replay recorded execution"}
              </button>
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              Replay becomes available after a successful recording in this
              session. The backend also stores the cassette on disk.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#101522] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Execution results</h2>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                {scenario.toUpperCase()}
              </span>
            </div>

            {!recordResult && !replayResult && !error && (
              <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
                <div className="rounded-2xl bg-violet-500/10 p-4 text-violet-400">
                  <RotateCcw size={30} />
                </div>
                <h3 className="mt-5 font-medium">No execution recorded yet</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Select a scenario and record an execution to see cassette
                  metadata and replay verification.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {recordResult && (
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <CheckCircle2 className="shrink-0 text-emerald-400" />
                  <div>
                    <p className="font-medium text-emerald-300">
                      Recording completed
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {recordResult.message}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.04] p-4">
                    <p className="text-xs text-gray-500">Interactions</p>
                    <p className="mt-2 text-2xl font-bold">
                      {recordResult.recording.interaction_count}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-4">
                    <p className="text-xs text-gray-500">Cassette integrity</p>
                    <p className="mt-2 text-lg font-semibold text-emerald-400">
                      {recordResult.recording.integrity_verified
                        ? "Verified"
                        : "Failed"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileJson size={16} className="text-violet-400" />
                    Cassette details
                  </div>
                  <p className="mt-3 break-all text-xs text-gray-400">
                    {recordResult.recording.cassette_path}
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    Run ID: {recordResult.recording.run_id}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 p-4">
                  <p className="text-sm font-medium">Agent final output</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                    {recordResult.recording.final_output}
                  </p>
                </div>

                <div className="text-xs text-violet-300">
                  Recording is saved. You can now replay this cassette.
                </div>
              </div>
            )}

            {replay && (
              <div className="mt-6 space-y-5">
                <div
                  className={`flex items-center gap-3 rounded-xl border p-4 ${
                    replay.replay_passed
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-red-500/20 bg-red-500/10"
                  }`}
                >
                  {replay.replay_passed ? (
                    <CheckCircle2 className="shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="shrink-0 text-red-400" />
                  )}
                  <div>
                    <p
                      className={`font-medium ${
                        replay.replay_passed
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {replay.replay_passed
                        ? "Replay verification passed"
                        : "Replay verification failed"}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {replayResult?.message}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.04] p-4">
                    <p className="text-xs text-gray-500">Replayed interactions</p>
                    <p className="mt-2 text-2xl font-bold">
                      {replay.total_interactions}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-4">
                    <p className="text-xs text-gray-500">Responses match</p>
                    <p className="mt-2 text-lg font-semibold">
                      {replay.responses_match ? (
                        <span className="text-emerald-400">Yes</span>
                      ) : (
                        <span className="text-red-400">No</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Replay checks</h3>
                  {[
                    ["Cassette integrity", replay.integrity_verified],
                    ["All interactions consumed", replay.all_interactions_consumed],
                    ["Recorded responses match", replay.responses_match],
                  ].map(([label, passed]) => (
                    <div
                      key={String(label)}
                      className="flex items-center justify-between rounded-lg bg-white/[0.04] px-4 py-3 text-sm"
                    >
                      <span className="text-gray-300">{label}</span>
                      {passed ? (
                        <CheckCircle2 size={17} className="text-emerald-400" />
                      ) : (
                        <XCircle size={17} className="text-red-400" />
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold">
                    Replayed interactions
                  </h3>
                  <div className="space-y-2">
                    {replay.replayed_interactions.map((interaction) => (
                      <div
                        key={interaction.sequence}
                        className="rounded-lg border border-white/10 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-violet-300">
                            #{interaction.sequence + 1} · {interaction.kind}
                          </span>
                          <span className="text-xs text-emerald-400">
                            {interaction.status}
                          </span>
                        </div>
                        <p className="mt-2 break-all text-sm text-gray-300">
                          {interaction.method}
                        </p>
                        <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-black/20 p-3 text-xs text-gray-500">
                          {JSON.stringify(interaction.response, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-[#101522] p-5">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck size={18} className="text-violet-400" />
            How replay verification works
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            AgentProbe loads the saved cassette, matches recorded interactions
            in sequence, and checks that every interaction was consumed, the
            responses match, and the cassette integrity hash is valid. This
            demo replays recorded responses; it does not call the live agent
            again.
          </p>
        </div>
      </div>
    </main>
  );
}
