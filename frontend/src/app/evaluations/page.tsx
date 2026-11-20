
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  BrainCircuit,
  RefreshCw,
  Workflow,
} from "lucide-react";

type EvaluationResult = {
  scenario?: string;
  run_id?: string;
  trace?: {
    steps?: any[];
    final_output?: string;
  };
  evaluation?: {
    judge?: any;
    reliability?: any;
  };
};

const percentage = (value: number | undefined) =>
  value == null ? "—" : `${(value * 100).toFixed(1)}%`;

export default function EvaluationsPage() {
  const [result, setResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("agentprobe_latest_result");

    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch {
        setResult(null);
      }
    }
  }, []);

  const evaluation = result?.evaluation;
  const judge = evaluation?.judge;
  const reliability = evaluation?.reliability;

  const criteria = judge?.criteria ?? judge?.criterion_scores ?? [];
  const metrics = reliability?.metrics ?? [];

  const reloadResult = () => {
    const saved = sessionStorage.getItem("agentprobe_latest_result");
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch {
        setResult(null);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#090D18] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Agent<span className="text-blue-400">Probe</span>
          </Link>

          <Link
            href="/playground"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Playground
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* PAGE TITLE */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              ANALYTICS
            </p>

            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              Evaluation Dashboard
            </h1>

            <p className="mt-3 text-gray-400">
              Understand how your AI agent performs and where it needs improvement.
            </p>
          </div>

          <button
            onClick={reloadResult}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5"
          >
            <RefreshCw size={15} />
            Refresh results
          </button>
        </div>

        {!result ? (
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#111827] p-10 text-center">
            <Activity className="mx-auto text-blue-400" size={40} />

            <h2 className="mt-5 text-xl font-semibold">
              No evaluation results yet
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-400">
              Run an agent in the Playground first. Your latest execution
              and evaluation results will appear here.
            </p>

            <Link
              href="/playground"
              className="mt-7 inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
            >
              Run Sample Agent
            </Link>
          </div>
        ) : (
          <>
            {/* RUN INFORMATION */}
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-blue-300">
                Scenario: {result.scenario ?? "Unknown"}
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-gray-400">
                Run ID: {result.run_id ?? "Not available"}
              </span>
            </div>

            {/* MAIN SCORE CARDS */}
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Judge Score</p>
                  <BrainCircuit className="text-blue-400" />
                </div>

                <p className="mt-5 text-4xl font-bold text-blue-400">
                  {percentage(judge?.overall)}
                </p>

                <p className="mt-3 text-sm text-gray-400">
                  {judge?.passed == null
                    ? "Evaluation status unavailable"
                    : judge.passed
                      ? "Judge evaluation passed"
                      : "Judge evaluation failed"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Reliability Score</p>
                  <ShieldCheck className="text-violet-400" />
                </div>

                <p className="mt-5 text-4xl font-bold text-violet-400">
                  {percentage(reliability?.overall)}
                </p>

                <p className="mt-3 text-sm text-gray-400">
                  {reliability?.passed == null
                    ? "Evaluation status unavailable"
                    : reliability.passed
                      ? "Reliability checks passed"
                      : "Reliability checks failed"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Execution Steps</p>
                  <Workflow className="text-emerald-400" />
                </div>

                <p className="mt-5 text-4xl font-bold text-white">
                  {result.trace?.steps?.length ?? "—"}
                </p>

                <p className="mt-3 text-sm text-gray-400">
                  Recorded execution steps
                </p>
              </div>
            </div>

            {/* JUDGE EVALUATION */}
            <section className="mt-10 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-blue-400" size={22} />
                <div>
                  <h2 className="text-xl font-semibold">
                    AI Judge Evaluation
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Rubric-based evaluation using an independent LLM judge.
                  </p>
                </div>
              </div>

              {judge ? (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {criteria.map((item: any, index: number) => (
                      <div
                        key={item.criterion_name ?? item.name ?? index}
                        className="rounded-xl border border-white/10 bg-[#090D18] p-5"
                      >
                        <p className="text-sm text-gray-400">
                          {(
                            item.criterion_name ??
                            item.name ??
                            "Criterion"
                          ).replaceAll("_", " ")}
                        </p>

                        <p className="mt-3 text-2xl font-bold">
                          {percentage(
                            item.normalized ??
                            (item.normalized === 0 ? 0 : undefined)
                          )}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-gray-400">
                          {item.reasoning ?? "No reasoning available."}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-xl bg-[#090D18] p-5">
                    <p className="text-sm font-semibold text-gray-300">
                      Judge reasoning
                    </p>

                    <p className="mt-3 text-sm leading-7 text-gray-400">
                      {judge.reasoning ?? "No reasoning provided."}
                    </p>

                    <p className="mt-4 text-xs text-gray-500">
                      Judge model: {judge.model ?? judge.judge_model ?? "Not available"}
                    </p>
                  </div>
                </>
              ) : (
                <p className="mt-6 text-sm text-gray-400">
                  Judge evaluation data was not included in this response.
                </p>
              )}
            </section>

            {/* RELIABILITY METRICS */}
            <section className="mt-8 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <div className="flex items-center gap-3">
                <Activity className="text-violet-400" size={22} />
                <div>
                  <h2 className="text-xl font-semibold">
                    Reliability Metrics
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Deterministic measurements of agent performance.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {metrics.map((metric: any, index: number) => (
                  <div
                    key={metric.name ?? index}
                    className="rounded-xl border border-white/10 bg-[#090D18] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold capitalize">
                          {(metric.name ?? "Metric").replaceAll("_", " ")}
                        </h3>
                        <p className="mt-2 text-sm text-gray-400">
                          {metric.reason}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {percentage(metric.value)}
                        </p>

                        {metric.passed == null ? (
                          <span className="text-xs text-gray-500">
                            Status unavailable
                          </span>
                        ) : metric.passed ? (
                          <span className="flex items-center justify-end gap-1 text-xs text-emerald-400">
                            <CheckCircle2 size={13} /> Passed
                          </span>
                        ) : (
                          <span className="flex items-center justify-end gap-1 text-xs text-red-400">
                            <XCircle size={13} /> Failed
                          </span>
                        )}
                      </div>
                    </div>

                    {metric.threshold != null && (
                      <p className="mt-3 text-xs text-gray-500">
                        Required threshold: {percentage(metric.threshold)}
                      </p>
                    )}
                  </div>
                ))}

                {metrics.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No reliability metrics were included in this response.
                  </p>
                )}
              </div>
            </section>

            {/* FINAL AGENT OUTPUT */}
            <section className="mt-8 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <h2 className="font-semibold">Agent Final Response</h2>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-300">
                {result.trace?.final_output ??
                  "Final output was not included in the trace."}
              </p>
            </section>
          </>
        )}

        {/* FOOTER NAVIGATION */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/playground"
            className="rounded-lg border border-white/10 px-5 py-3 text-sm text-gray-300 hover:bg-white/5"
          >
            Back to Playground
          </Link>

          <Link
            href="/traces"
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
          >
            View Execution Traces
          </Link>
          <Link href="/replay" className="hover:text-white">
            Record & Replay
          </Link>
          <Link href="/docs" className="hover:text-white">
            Docs
           </Link>
        </div>
      </section>
    </main>
  );
}
