
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Activity,
  BrainCircuit,
  ShieldCheck,
  Workflow,
  Terminal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
} from "lucide-react";

type Scenario = "success" | "failure";

type DemoResult = {
  success?: boolean;
  scenario?: string;
  agent?: string;
  run_id?: string;
  trace?: {
    input?: {
      query?: string;
    };
    steps?: any[];
    final_output?: string;
    metadata?: Record<string, any>;
  };
  evaluation?: {
    judge?: any;
    reliability?: any;
  };
  judge?: any;
  reliability?: any;
  final_output?: string;
  [key: string]: any;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function PlaygroundPage() {
  const [scenario, setScenario] = useState<Scenario>("success");
  const [result, setResult] = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTrace, setShowTrace] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  const runDemo = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/demo/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scenario }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || `Request failed (${response.status})`
        );
      }

      // Save the real backend response for the Evaluations page.
      sessionStorage.setItem(
        "agentprobe_latest_result",
        JSON.stringify(data)
      );

      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(
        `${message}. Make sure the AgentProbe backend is running and the API URL is correct.`
      );
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError("");
    sessionStorage.removeItem("agentprobe_latest_result");
  };

  // Support both nested and top-level backend evaluation responses.
  const evaluation = result?.evaluation ?? result;
  const judge = evaluation?.judge;
  const reliability = evaluation?.reliability;

  const steps = result?.trace?.steps ?? [];

  const criteria =
    judge?.criteria ?? judge?.criterion_scores ?? [];

  const metrics = reliability?.metrics ?? [];

  const finalOutput =
    result?.trace?.final_output ??
    result?.final_output ??
    result?.output ??
    "";

  const formatPercentage = (value: number | undefined) => {
    if (value == null || Number.isNaN(Number(value))) return "—";
    return `${(Number(value) * 100).toFixed(1)}%`;
  };

  const formatName = (value: string) =>
    value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="min-h-screen bg-[#090D18] text-white">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090D18]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-500/15 p-2">
              <ShieldCheck className="text-blue-400" size={21} />
            </div>
            <span className="text-xl font-bold">
              Agent<span className="text-blue-400">Probe</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-gray-400 md:flex">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/playground" className="text-blue-400">
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
          </nav>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* PAGE INTRODUCTION */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Interactive Agent Testing
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
            Agent Playground
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
            Run a sample AI agent, inspect its execution, and evaluate its
            reliability using AgentProbe.
          </p>
        </div>

        {/* SCENARIO SELECTOR */}
        <section className="mt-9 rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-400" size={22} />
            <div>
              <h2 className="text-lg font-semibold">
                Configure Sample Execution
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Choose a scenario to test the customer support agent.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setScenario("success")}
              disabled={loading}
              className={`rounded-xl border p-5 text-left transition ${
                scenario === "success"
                  ? "border-emerald-500/60 bg-emerald-500/10"
                  : "border-white/10 bg-[#090D18] hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">Successful Scenario</span>
                <CheckCircle2
                  size={21}
                  className={
                    scenario === "success"
                      ? "text-emerald-400"
                      : "text-gray-500"
                  }
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                The agent receives accurate order information and provides
                the correct response to the customer.
              </p>
              <span className="mt-4 inline-block text-xs text-emerald-400">
                Expected: Successful evaluation
              </span>
            </button>

            <button
              onClick={() => setScenario("failure")}
              disabled={loading}
              className={`rounded-xl border p-5 text-left transition ${
                scenario === "failure"
                  ? "border-red-500/60 bg-red-500/10"
                  : "border-white/10 bg-[#090D18] hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">Failure Scenario</span>
                <XCircle
                  size={21}
                  className={
                    scenario === "failure"
                      ? "text-red-400"
                      : "text-gray-500"
                  }
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                The agent receives delayed delivery information but produces
                an incorrect response. AgentProbe should detect the issue.
              </p>
              <span className="mt-4 inline-block text-xs text-red-400">
                Expected: Failed reliability checks
              </span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={runDemo}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  Running Agent...
                </>
              ) : (
                <>
                  <Play size={17} fill="currentColor" />
                  Run {scenario === "success" ? "Success" : "Failure"} Scenario
                </>
              )}
            </button>

            <button
              onClick={clearResult}
              disabled={loading}
              className="rounded-lg border border-white/10 px-5 py-3 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Clear Results
            </button>
          </div>

          {loading && (
            <div className="mt-5 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-300">
              Agent execution and evaluation are in progress. Please wait...
            </div>
          )}

          {error && (
            <div className="mt-5 flex gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle size={19} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>

        {/* RESULTS */}
        {result && (
          <>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                  Execution completed
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Evaluation Results
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400">
                {result.run_id
                  ? `Run: ${result.run_id.slice(0, 12)}...`
                  : "Run ID unavailable"}
              </span>
            </div>

            {/* SCORE CARDS */}
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Judge Score</span>
                  <BrainCircuit className="text-blue-400" />
                </div>
                <p className="mt-5 text-4xl font-bold text-blue-400">
                  {formatPercentage(judge?.overall)}
                </p>
                <p className="mt-3 text-sm text-gray-400">
                  {judge?.passed == null
                    ? "Judge status unavailable"
                    : judge.passed
                      ? "Judge evaluation passed"
                      : "Judge evaluation failed"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Reliability Score
                  </span>
                  <ShieldCheck className="text-violet-400" />
                </div>
                <p className="mt-5 text-4xl font-bold text-violet-400">
                  {formatPercentage(reliability?.overall)}
                </p>
                <p className="mt-3 text-sm text-gray-400">
                  {reliability?.passed == null
                    ? "Reliability status unavailable"
                    : reliability.passed
                      ? "Reliability checks passed"
                      : "Reliability checks failed"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Execution Steps
                  </span>
                  <Workflow className="text-emerald-400" />
                </div>
                <p className="mt-5 text-4xl font-bold">
                  {steps.length}
                </p>
                <p className="mt-3 text-sm text-gray-400">
                  Recorded agent steps
                </p>
              </div>
            </div>

            {/* FINAL OUTPUT */}
            <section className="mt-7 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <h3 className="font-semibold">Agent Final Response</h3>
              <div className="mt-4 rounded-xl bg-[#090D18] p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
                  {finalOutput || "Final output not available in the API response."}
                </p>
              </div>
            </section>

            {/* JUDGE CRITERIA */}
            <section className="mt-7 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-blue-400" size={22} />
                <div>
                  <h3 className="text-lg font-semibold">
                    AI Judge Evaluation
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Rubric-based evaluation powered by your configured Groq model.
                  </p>
                </div>
              </div>

              {judge ? (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {criteria.map((item: any, index: number) => (
                      <div
                        key={item.criterion_name ?? index}
                        className="rounded-xl border border-white/10 bg-[#090D18] p-5"
                      >
                        <p className="text-sm capitalize text-gray-400">
                          {formatName(
                            item.criterion_name ?? item.name ?? "Criterion"
                          )}
                        </p>
                        <p className="mt-3 text-2xl font-bold">
                          {formatPercentage(item.normalized)}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-gray-400">
                          {item.reasoning ?? "No reasoning available."}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl bg-[#090D18] p-5">
                    <p className="text-sm font-semibold text-gray-300">
                      Overall Judge Reasoning
                    </p>
                    <p className="mt-3 text-sm leading-7 text-gray-400">
                      {judge.reasoning ?? "No reasoning available."}
                    </p>
                    <p className="mt-4 text-xs text-gray-500">
                      Model: {judge.model ?? judge.judge_model ?? "Not specified"}
                    </p>
                  </div>
                </>
              ) : (
                <p className="mt-5 text-sm text-gray-400">
                  Judge data was not found in the backend response.
                </p>
              )}
            </section>

            {/* RELIABILITY METRICS */}
            <section className="mt-7 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <div className="flex items-center gap-3">
                <Activity className="text-violet-400" size={22} />
                <div>
                  <h3 className="text-lg font-semibold">
                    Reliability Analysis
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Deterministic metrics calculated by AgentProbe.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {metrics.map((metric: any, index: number) => (
                  <div
                    key={metric.name ?? index}
                    className="rounded-xl border border-white/10 bg-[#090D18] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">
                          {formatName(metric.name ?? "Metric")}
                        </h4>
                        <p className="mt-2 text-sm text-gray-400">
                          {metric.reason ?? "No explanation available."}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {formatPercentage(metric.value)}
                        </p>
                        {metric.passed === true ? (
                          <span className="text-xs text-emerald-400">
                            Passed
                          </span>
                        ) : metric.passed === false ? (
                          <span className="text-xs text-red-400">
                            Failed
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Status unavailable
                          </span>
                        )}
                      </div>
                    </div>

                    {metric.threshold != null && (
                      <p className="mt-3 text-xs text-gray-500">
                        Required threshold: {formatPercentage(metric.threshold)}
                      </p>
                    )}
                  </div>
                ))}

                {metrics.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Reliability metrics are not available in this response.
                  </p>
                )}
              </div>
            </section>

            {/* EXECUTION TRACE */}
            <section className="mt-7 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <button
                onClick={() => setShowTrace(!showTrace)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Workflow className="text-blue-400" size={22} />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Execution Trace
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {steps.length} recorded steps
                    </p>
                  </div>
                </div>

                {showTrace ? (
                  <ChevronUp className="text-gray-400" />
                ) : (
                  <ChevronDown className="text-gray-400" />
                )}
              </button>

              {showTrace && (
                <div className="mt-6 space-y-4">
                  {steps.map((step: any, index: number) => (
                    <div
                      key={step.step_index ?? index}
                      className="rounded-xl border border-white/10 bg-[#090D18] p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          Step {step.step_index ?? index + 1}
                        </span>
                        <Clock size={15} className="text-gray-500" />
                      </div>

                      {step.input_text && (
                        <p className="mt-3 text-sm text-gray-400">
                          Input: {step.input_text}
                        </p>
                      )}

                      {step.output_text && (
                        <p className="mt-2 text-sm text-gray-300">
                          Output: {step.output_text}
                        </p>
                      )}

                      {step.tool_calls?.map((tool: any, toolIndex: number) => (
                        <div
                          key={toolIndex}
                          className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4"
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                            <Terminal size={15} />
                            {tool.name}
                          </div>

                          <p className="mt-2 break-all text-xs text-gray-400">
                            Arguments:{" "}
                            {JSON.stringify(tool.arguments ?? {})}
                          </p>

                          {tool.result != null && (
                            <p className="mt-2 break-all text-xs text-gray-300">
                              Result: {JSON.stringify(tool.result)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}

                  {steps.length === 0 && (
                    <p className="text-sm text-gray-400">
                      No execution steps were included in the trace.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* RAW BACKEND RESPONSE */}
            <section className="mt-7 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="flex w-full items-center justify-between text-left"
              >
                <div>
                  <h3 className="font-semibold">Raw API Response</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Inspect the actual backend JSON response.
                  </p>
                </div>
                {showRaw ? (
                  <ChevronUp className="text-gray-400" />
                ) : (
                  <ChevronDown className="text-gray-400" />
                )}
              </button>

              {showRaw && (
                <pre className="mt-5 max-h-[500px] overflow-auto rounded-xl bg-black/50 p-5 text-xs leading-6 text-emerald-300">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </section>

            {/* NAVIGATION TO EVALUATIONS */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/evaluations"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500"
              >
                View Detailed Evaluation
                <ArrowRight size={17} />
              </Link>

              <button
                onClick={runDemo}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
              >
                <RefreshCw size={16} />
                Run Again
              </button>
            </div>
          </>
        )}

        {/* EMPTY STATE */}
        {!result && !loading && !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <Activity className="mx-auto text-gray-500" size={35} />
            <h3 className="mt-4 text-lg font-semibold">
              Ready to test your agent?
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Select a scenario above and click Run to see real evaluation results.
            </p>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-16 border-t border-white/10 py-7 text-center text-xs text-gray-500">
          AgentProbe · Test your agents. Understand their behavior. Measure reliability.
        </footer>
      </div>
    </main>
  );
}
