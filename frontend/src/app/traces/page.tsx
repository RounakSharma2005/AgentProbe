
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  Workflow,
  Terminal,
  Database,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  FileJson,
} from "lucide-react";

type TraceToolCall = {
  name?: string;
  arguments?: Record<string, any>;
  result?: any;
  error?: string | null;
  duration_ms?: number | null;
};

type TraceStep = {
  step_index?: number;
  input_text?: string | null;
  output_text?: string | null;
  tool_calls?: TraceToolCall[];
  model?: string | null;
  duration_ms?: number | null;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  metadata?: Record<string, any>;
};

type TraceResult = {
  scenario?: string;
  run_id?: string;
  agent?: string;
  trace?: {
    input?: {
      query?: string;
      context?: Record<string, any>;
    };
    steps?: TraceStep[];
    final_output?: any;
    error?: string | null;
    duration_ms?: number | null;
    metadata?: Record<string, any>;
  };
  [key: string]: any;
};

export default function TracesPage() {
  const [result, setResult] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number[]>([]);
  const [showRaw, setShowRaw] = useState(false);

  const loadTrace = () => {
    setLoading(true);
    setError("");

    try {
      const saved = sessionStorage.getItem("agentprobe_latest_result");

      if (!saved) {
        setResult(null);
        setError("No execution trace found. Run an agent in the Playground first.");
        return;
      }

      const parsed = JSON.parse(saved);
      setResult(parsed);

      const steps = parsed?.trace?.steps ?? [];
      setExpanded(steps.map((_: any, index: number) => index));
    } catch {
      setResult(null);
      setError("Unable to read the saved execution trace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrace();
  }, []);

  const trace = result?.trace;
  const steps: TraceStep[] = trace?.steps ?? [];

  const totalTools = steps.reduce(
    (total, step) => total + (step.tool_calls?.length ?? 0),
    0
  );

  const successfulTools = steps.reduce(
    (total, step) =>
      total +
      (step.tool_calls ?? []).filter((tool) => !tool.error).length,
    0
  );

  const toggleStep = (index: number) => {
    setExpanded((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index]
    );
  };

  const formatDuration = (value?: number | null) => {
    if (value == null) return "Not available";
    return `${value.toFixed(2)} ms`;
  };

  const formatJSON = (value: any) => {
    if (value == null) return "Not available";
    return typeof value === "string"
      ? value
      : JSON.stringify(value, null, 2);
  };

  return (
    <main className="min-h-screen bg-[#090D18] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090D18]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Agent<span className="text-blue-400">Probe</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-gray-400 md:flex">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/playground" className="hover:text-white">Playground</Link>
            <Link href="/evaluations" className="hover:text-white">Evaluations</Link>
            <Link href="/traces" className="text-blue-400">Traces</Link>
            <Link href="/replay" className="hover:text-white">
                  Record & Replay </Link>
          </nav>

          <Link
            href="/playground"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Playground
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* TITLE */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              OBSERVABILITY
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              Execution Trace Explorer
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
              Inspect the execution history of your AI agent, including its
              steps, tool calls, outputs and errors.
            </p>
          </div>

          <button
            onClick={loadTrace}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={15} />
            Refresh Trace
          </button>
        </div>

        {/* ERROR / EMPTY STATE */}
        {loading ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#111827] p-10 text-center">
            <RefreshCw className="mx-auto animate-spin text-blue-400" size={30} />
            <p className="mt-4 text-sm text-gray-400">Loading execution trace...</p>
          </div>
        ) : !result ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#111827] p-10 text-center">
            <AlertCircle className="mx-auto text-amber-400" size={35} />
            <h2 className="mt-5 text-xl font-semibold">No trace available</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-400">
              {error || "Run an agent in the Playground to generate an execution trace."}
            </p>
            <Link
              href="/playground"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold hover:bg-blue-500"
            >
              Run Sample Agent <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* RUN DETAILS */}
            <section className="mt-8 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-3">
                    <Bot className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {result.agent ?? "Customer Support Agent"}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Scenario: {result.scenario ?? "Not specified"}
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                  Trace loaded
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Execution steps", value: steps.length },
                  { label: "Tool calls", value: totalTools },
                  { label: "Successful tools", value: successfulTools },
                  {
                    label: "Duration",
                    value: formatDuration(trace?.duration_ms),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl bg-[#090D18] p-4"
                  >
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="mt-3 text-xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-xs text-gray-500">Run ID</p>
                <p className="mt-2 break-all font-mono text-xs text-gray-300">
                  {result.run_id ?? "Not available"}
                </p>
              </div>
            </section>

            {/* AGENT INPUT */}
            <section className="mt-7 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <div className="flex items-center gap-3">
                <Terminal className="text-blue-400" size={20} />
                <h2 className="font-semibold">Agent Input</h2>
              </div>

              <div className="mt-4 rounded-xl bg-[#090D18] p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
                  {trace?.input?.query ?? "Input query not available."}
                </p>
              </div>
            </section>

            {/* TIMELINE */}
            <section className="mt-7 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Workflow className="text-blue-400" size={22} />
                  <div>
                    <h2 className="text-lg font-semibold">Execution Timeline</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      Chronological view of recorded agent activity.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setExpanded(
                      expanded.length === steps.length
                        ? []
                        : steps.map((_, index) => index)
                    )
                  }
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {expanded.length === steps.length ? "Collapse all" : "Expand all"}
                </button>
              </div>

              {steps.length > 0 ? (
                <div className="mt-8 space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.step_index ?? index} className="relative">
                      <div className="rounded-xl border border-white/10 bg-[#090D18]">
                        <button
                          onClick={() => toggleStep(index)}
                          className="flex w-full items-center justify-between gap-4 p-5 text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-400">
                              {index + 1}
                            </div>

                            <div>
                              <h3 className="font-semibold">
                                Step {step.step_index ?? index + 1}
                              </h3>
                              <p className="mt-1 text-xs text-gray-500">
                                {(step.tool_calls ?? []).length} tool calls
                                {step.model ? ` · ${step.model}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="hidden text-xs text-gray-500 sm:block">
                              {formatDuration(step.duration_ms)}
                            </span>
                            {expanded.includes(index) ? (
                              <ChevronUp size={18} className="text-gray-400" />
                            ) : (
                              <ChevronDown size={18} className="text-gray-400" />
                            )}
                          </div>
                        </button>

                        {expanded.includes(index) && (
                          <div className="space-y-5 border-t border-white/10 p-5">
                            {step.input_text && (
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Step Input
                                </p>
                                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
                                  {step.input_text}
                                </p>
                              </div>
                            )}

                            {step.output_text && (
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Step Output
                                </p>
                                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
                                  {step.output_text}
                                </p>
                              </div>
                            )}

                            {(step.tool_calls ?? []).map((tool, toolIndex) => (
                              <div
                                key={toolIndex}
                                className="rounded-xl border border-white/10 bg-[#111827] p-5"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <Database size={17} className="text-blue-400" />
                                    <h4 className="font-semibold">
                                      {tool.name ?? "Unnamed tool"}
                                    </h4>
                                  </div>

                                  {tool.error ? (
                                    <span className="flex items-center gap-1 text-xs text-red-400">
                                      <XCircle size={14} /> Failed
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                                      <CheckCircle2 size={14} /> Completed
                                    </span>
                                  )}
                                </div>

                                <div className="mt-5">
                                  <p className="mb-2 text-xs text-gray-500">
                                    Arguments
                                  </p>
                                  <pre className="overflow-x-auto rounded-lg bg-[#090D18] p-4 text-xs leading-6 text-blue-200">
                                    {formatJSON(tool.arguments ?? {})}
                                  </pre>
                                </div>

                                {tool.result !== undefined && (
                                  <div className="mt-4">
                                    <p className="mb-2 text-xs text-gray-500">
                                      Tool Result
                                    </p>
                                    <pre className="overflow-x-auto rounded-lg bg-[#090D18] p-4 text-xs leading-6 text-emerald-200">
                                      {formatJSON(tool.result)}
                                    </pre>
                                  </div>
                                )}

                                {tool.error && (
                                  <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                                    <p className="text-xs text-red-400">
                                      {tool.error}
                                    </p>
                                  </div>
                                )}

                                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock size={13} />
                                    {formatDuration(tool.duration_ms)}
                                  </span>
                                </div>
                              </div>
                            ))}

                            {step.model && (
                              <p className="text-xs text-gray-500">
                                Model: {step.model}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              {step.prompt_tokens != null && (
                                <span>Prompt tokens: {step.prompt_tokens}</span>
                              )}
                              {step.completion_tokens != null && (
                                <span>
                                  Completion tokens: {step.completion_tokens}
                                </span>
                              )}
                            </div>

                            {!step.input_text &&
                              !step.output_text &&
                              !(step.tool_calls?.length) && (
                                <p className="text-sm text-gray-500">
                                  No detailed step information was recorded.
                                </p>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-gray-400">
                  No execution steps were included in this trace.
                </p>
              )}
            </section>

            {/* FINAL OUTPUT */}
            <section className="mt-7 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-400" size={21} />
                <h2 className="font-semibold">Final Agent Output</h2>
              </div>

              <div className="mt-4 rounded-xl bg-[#090D18] p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
                  {trace?.final_output != null
                    ? formatJSON(trace.final_output)
                    : "Final output not available."}
                </p>
              </div>

              {trace?.error && (
                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm text-red-400">
                    Execution error: {trace.error}
                  </p>
                </div>
              )}
            </section>

            {/* RAW TRACE */}
            <section className="mt-7 rounded-2xl border border-white/10 bg-[#111827] p-6">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <FileJson className="text-blue-400" size={20} />
                  <div>
                    <h2 className="font-semibold">Raw Trace Data</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Original response data from the backend.
                    </p>
                  </div>
                </div>
                {showRaw ? <ChevronUp /> : <ChevronDown />}
              </button>

              {showRaw && (
                <pre className="mt-5 max-h-[500px] overflow-auto rounded-xl bg-black/50 p-5 text-xs leading-6 text-emerald-300">
                  {JSON.stringify(trace, null, 2)}
                </pre>
              )}
            </section>
          </>
        )}

        {/* NAVIGATION */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/playground"
            className="rounded-lg border border-white/10 px-5 py-3 text-sm text-gray-300 hover:bg-white/5"
          >
            Back to Playground
          </Link>

          <Link
            href="/evaluations"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
          >
            View Evaluations <ArrowRight size={16} />
          </Link>
        </div>

        <footer className="mt-16 border-t border-white/10 py-7 text-center text-xs text-gray-500">
          AgentProbe · Inspect every step. Understand every execution.
        </footer>
      </div>
    </main>
  );
}
