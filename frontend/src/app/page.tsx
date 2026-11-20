
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  Layers3,
  Play,
  Radar,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Radar,
    title: "Trace-aware evaluation",
    description:
      "Inspect agent execution traces, reasoning steps, tool calls and outputs to understand what happened during a run.",
  },
  {
    icon: ShieldCheck,
    title: "AI-as-a-Judge",
    description:
      "Evaluate agent responses against customizable rubrics using an independent LLM judge.",
  },
  {
    icon: Activity,
    title: "Reliability scoring",
    description:
      "Measure task completion, tool correctness, step efficiency and trajectory matching with deterministic metrics.",
  },
  {
    icon: Database,
    title: "Record and replay",
    description:
      "Capture agent interactions and replay previous executions without repeating live API calls.",
  },
];

const developerSteps = [
  {
    number: "01",
    title: "Install AgentProbe",
    description:
      "Install the Python package in your existing agent project.",
    command: "pip install checkagent",
  },
  {
    number: "02",
    title: "Connect your agent",
    description:
      "Use a supported adapter or convert your execution into AgentProbe's AgentRun format.",
    command: "from checkagent import AgentRun",
  },
  {
    number: "03",
    title: "Run an evaluation",
    description:
      "Configure evaluation metrics and a judge rubric to test your agent.",
    command: "pytest -v",
  },
  {
    number: "04",
    title: "Inspect the results",
    description:
      "Review execution traces, scores, failures and recorded interactions.",
    command: "Analyze your evaluation report",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090D18] text-white">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#090D18]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="rounded-xl bg-blue-500/15 p-2">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Agent<span className="text-blue-400">Probe</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-white">
              How it works
            </a>
            <a href="#developer-guide" className="transition hover:text-white">
              Documentation
            </a>
          </div>

          <Link
            href="/playground"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
          >
            Try Demo <ArrowUpRight size={16} />
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative px-6 pb-20 pt-24 md:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/[0.09] blur-[140px]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/[0.08] px-4 py-2 text-xs font-medium text-blue-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            A testing framework for AI agents
          </div>

          <h1 className="text-5xl font-bold leading-[1.12] tracking-tight sm:text-6xl md:text-7xl">
            Don't just build AI agents.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Test their reliability.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-gray-400 md:text-lg">
            Evaluate agent behavior, inspect execution traces and measure
            reliability. Find out what your AI agent gets right — and where
            it fails.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/playground"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
            >
              <Play size={18} fill="currentColor" />
              Try Interactive Demo
              <ArrowRight size={17} />
            </Link>

            <a
              href="#developer-guide"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-4 font-semibold transition hover:border-white/30 hover:bg-white/[0.08]"
            >
              <Code2 size={18} />
              Test Your Agent
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              Python integrations
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              Trace-aware evaluation
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              Deterministic metrics
            </span>
          </div>
        </div>

        {/* PRODUCT PREVIEW */}
        <div className="relative mx-auto mt-20 max-w-5xl rounded-2xl border border-white/10 bg-[#111827] p-2 shadow-2xl shadow-black/40">
          <div className="rounded-xl border border-white/[0.06] bg-[#0C1220] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div>
                <h2 className="font-semibold">Agent Evaluation</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Customer Support Agent · Sample execution
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                Sample preview
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/[0.07] bg-[#111827] p-5">
                <p className="text-sm text-gray-400">Judge evaluation</p>
                <p className="mt-3 text-3xl font-bold text-blue-400">
                  94.4%
                </p>
                <p className="mt-2 text-xs text-emerald-400">
                  Sample result
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-[#111827] p-5">
                <p className="text-sm text-gray-400">Reliability</p>
                <p className="mt-3 text-3xl font-bold text-violet-400">
                  100%
                </p>
                <p className="mt-2 text-xs text-emerald-400">
                  Sample result
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-[#111827] p-5">
                <p className="text-sm text-gray-400">Tool calls</p>
                <p className="mt-3 text-3xl font-bold text-white">3</p>
                <p className="mt-2 text-xs text-gray-500">
                  Recorded interactions
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.07] bg-[#111827] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Workflow size={17} className="text-blue-400" />
                <h3 className="text-sm font-semibold">Execution trace</h3>
              </div>

              <div className="space-y-3">
                {["get_order", "check_payment", "track_delivery"].map(
                  (tool, index) => (
                    <div
                      key={tool}
                      className="flex items-center gap-3 rounded-lg bg-[#090D18] px-4 py-3"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-xs text-blue-400">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm text-gray-300">
                        {tool}()
                      </span>
                      <span className="text-xs text-emerald-400">
                        Completed
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-gray-500">
              Illustrative sample preview. Run the interactive demo to see
              live backend evaluation results.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-white/[0.06] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Core capabilities
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Everything you need to test AI agents.
            </h2>
            <p className="mt-4 leading-7 text-gray-400">
              Go beyond checking the final response. Understand the complete
              execution and evaluate how reliably your agent performs.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/[0.08] bg-[#111827] p-6 transition hover:-translate-y-1 hover:border-blue-500/40"
                >
                  <div className="inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-6 font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="border-t border-white/[0.06] bg-[#0C1220] px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              The workflow
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              From agent execution to evaluation.
            </h2>
            <p className="mt-4 leading-7 text-gray-400">
              AgentProbe helps developers understand agent behavior through
              a structured testing workflow.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-4">
            {[
              {
                icon: Bot,
                title: "Execute",
                description: "Run your AI agent against a test scenario.",
              },
              {
                icon: Workflow,
                title: "Capture",
                description: "Collect execution steps and tool interactions.",
              },
              {
                icon: ShieldCheck,
                title: "Evaluate",
                description: "Apply judge rubrics and deterministic metrics.",
              },
              {
                icon: Activity,
                title: "Improve",
                description: "Inspect failures and replay previous runs.",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/[0.08] bg-[#111827] p-6"
                >
                  <div className="flex items-center justify-between">
                    <Icon size={25} className="text-blue-400" />
                    <span className="text-sm text-gray-600">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DEVELOPER GUIDE */}
      <section
        id="developer-guide"
        className="border-t border-white/[0.06] px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                For developers
              </p>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                Bring your own AI agent.
              </h2>
              <p className="mt-5 leading-8 text-gray-400">
                The sample playground is only a demonstration. AgentProbe is
                designed to help developers test their own Python agents
                using its evaluation and replay capabilities.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/playground"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
                >
                  Try the sample <ArrowRight size={16} />
                </Link>
                <a
                  href="#integration-steps"
                  className="rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/[0.05]"
                >
                  View integration steps
                </a>
              </div>
            </div>

            <div
              id="integration-steps"
              className="space-y-4"
            >
              {developerSteps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-xl border border-white/[0.08] bg-[#111827] p-5"
                >
                  <div className="flex gap-4">
                    <span className="text-sm font-bold text-blue-400">
                      {step.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        {step.description}
                      </p>
                      <div className="mt-4 overflow-x-auto rounded-lg bg-[#090D18] px-4 py-3">
                        <code className="whitespace-nowrap text-xs text-emerald-300">
                          {step.command}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs leading-6 text-gray-500">
                Integration examples are introductory guidance. Actual
                integration depends on your agent framework and the
                supported AgentProbe adapter or trace format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/15 to-violet-600/10 px-7 py-16 text-center md:px-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15">
            <Zap size={27} className="text-blue-400" />
          </div>

          <h2 className="mt-7 text-3xl font-bold md:text-4xl">
            Ready to test your AI agent?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-400">
            Start with our interactive customer support demo and discover
            how AgentProbe evaluates agent reliability.
          </p>

          <Link
            href="/playground"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold transition hover:bg-blue-500"
          >
            Launch Playground <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <ShieldCheck size={20} className="text-blue-400" />
            AgentProbe
          </Link>

          <p className="text-center text-xs text-gray-500">
            A testing framework for reliable AI agents.
          </p>

          <div className="flex items-center gap-5 text-sm text-gray-400">
            <a
              href="https://github.com/RounakSharma2005/AgentProbe"
              target="_blank"
              rel="noreferrer"
              aria-label="AgentProbe GitHub repository"
              className="transition hover:text-white"
            >
              <Code2 size={19} />
            </a>
            <Link
              href="/playground"
              className="transition hover:text-white"
            >
              Playground
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
