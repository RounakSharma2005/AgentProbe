
import Link from "next/link";
import {
  BookOpen,
  Terminal,
  Code2,
  BrainCircuit,
  Activity,
  Database,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const codeBlocks = [
  {
    title: "Install AgentProbe",
    code: `pip install checkagent`,
  },
  {
    title: "Wrap your existing Python agent",
    code: `from checkagent import wrap

def my_agent(query: str) -> str:
    # Connect your existing agent logic here
    return "Your agent response"

adapter = wrap(my_agent)`,
  },
  {
    title: "Run your agent",
    code: `import asyncio
from checkagent import wrap, AgentInput

def my_agent(query: str) -> str:
    return "Your agent response"

async def main():
    adapter = wrap(my_agent)

    run = await adapter.run(
        AgentInput(query="Test my agent")
    )

    print("Output:", run.final_output)
    print("Steps:", len(run.steps))
    print("Duration:", run.duration_ms)

asyncio.run(main())`,
  },
  {
    title: "Evaluate reliability",
    code: `from checkagent import (
    task_completion,
    tool_correctness,
    step_efficiency,
    trajectory_match,
)

completion = task_completion(
    run,
    expected_output_contains=["response"],
)

tools = tool_correctness(
    run,
    expected_tools=[],
)

efficiency = step_efficiency(
    run,
    optimal_steps=1,
)

trajectory = trajectory_match(
    run,
    expected_trajectory=[],
    mode="strict",
)

for score in [completion, tools, efficiency, trajectory]:
    print(score.name, score.value, score.reason)`,
  },
  {
    title: "Record an interaction",
    code: `from checkagent.replay.recorder import CassetteRecorder

recorder = CassetteRecorder(
    test_id="my_agent_test"
)

recorder.record_response(
    prompt="Test my agent",
    response="Your agent response",
)

cassette = recorder.finalize()
cassette.save("cassettes/my_agent.json")

print("Recorded:", recorder.interaction_count)`,
  },
  {
    title: "Replay a recorded interaction",
    code: `from checkagent import Cassette, ReplayEngine
from checkagent.replay.engine import MatchStrategy

cassette = Cassette.load("cassettes/my_agent.json")

engine = ReplayEngine(
    cassette,
    strategy=MatchStrategy.SEQUENCE,
)

for interaction in cassette.interactions:
    matched = engine.match(interaction.request)
    print("Recorded response:", matched.response.body)

print("All interactions consumed:", engine.all_used)`,
  },
];

function CodePanel({
  title,
  code,
}: {
  title: string;
  code: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080d18]">
      <div className="border-b border-white/10 px-5 py-3 text-sm font-medium text-gray-300">
        {title}
      </div>
      <pre className="overflow-x-auto p-5 text-sm leading-7 text-blue-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <nav className="border-b border-white/10 bg-[#0b0f18]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-bold text-lg">
            Agent<span className="text-blue-400">Probe</span>
          </Link>

          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/playground" className="hover:text-white">Playground</Link>
            <Link href="/evaluations" className="hover:text-white">Evaluations</Link>
            <Link href="/traces" className="hover:text-white">Traces</Link>
            <Link href="/replay" className="hover:text-white">Record & Replay</Link>
            <span className="font-medium text-blue-400">Docs</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[230px_1fr]">
        <aside className="h-fit rounded-xl border border-white/10 bg-[#101522] p-5 lg:sticky lg:top-8">
          <div className="mb-5 flex items-center gap-2 font-semibold">
            <BookOpen size={18} className="text-blue-400" />
            Documentation
          </div>

          <div className="space-y-4 text-sm text-gray-400">
            <a href="#introduction" className="block hover:text-white">Introduction</a>
            <a href="#installation" className="block hover:text-white">Installation</a>
            <a href="#integration" className="block hover:text-white">Agent integration</a>
            <a href="#evaluation" className="block hover:text-white">Reliability evaluation</a>
            <a href="#recording" className="block hover:text-white">Recording</a>
            <a href="#replay" className="block hover:text-white">Replay</a>
            <a href="#limitations" className="block hover:text-white">Important notes</a>
          </div>
        </aside>

        <div className="min-w-0">
          <section id="introduction" className="mb-14">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-400">
              <BookOpen size={17} />
              DEVELOPER DOCUMENTATION
            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              Build and test reliable AI agents
            </h1>

            <p className="mt-5 max-w-3xl leading-7 text-gray-400">
              AgentProbe is a Python-based testing framework for evaluating
              AI agent execution, measuring reliability, inspecting traces,
              and recording interactions for deterministic replay.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                { icon: BrainCircuit, title: "AI Judge", text: "Rubric-based evaluation" },
                { icon: Activity, title: "Reliability", text: "Deterministic metrics" },
                { icon: Database, title: "Record & Replay", text: "Reusable interaction cassettes" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-[#101522] p-5">
                  <item.icon className="mb-4 text-blue-400" size={22} />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="installation" className="mb-14 space-y-5">
            <h2 className="text-2xl font-bold">1. Installation</h2>
            <p className="text-gray-400">
              Install the Python package in your development environment.
            </p>
            <CodePanel {...codeBlocks[0]} />
            <p className="text-sm text-gray-500">
              If you are working from the AgentProbe source repository,
              install its local package in editable mode using
              <code className="mx-1 text-blue-300">pip install -e .</code>
              from the repository root.
            </p>
          </section>

          <section id="integration" className="mb-14 space-y-5">
            <h2 className="text-2xl font-bold">2. Connect your Python agent</h2>
            <p className="text-gray-400 leading-7">
              Use the generic adapter to wrap a synchronous or asynchronous
              Python callable. Your function should accept a query string
              and return its response.
            </p>
            <CodePanel {...codeBlocks[1]} />
            <h3 className="pt-3 text-lg font-semibold">Execute your agent</h3>
            <CodePanel {...codeBlocks[2]} />
          </section>

          <section id="evaluation" className="mb-14 space-y-5">
            <h2 className="text-2xl font-bold">3. Evaluate reliability</h2>
            <p className="text-gray-400 leading-7">
              AgentProbe provides four deterministic evaluation metrics.
              Each returns a Score containing its value, threshold,
              reason, and metadata.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Task Completion", "Checks successful execution and expected output."],
                ["Tool Correctness", "Calculates precision, recall, and F1 for tool calls."],
                ["Step Efficiency", "Compares actual steps against optimal steps."],
                ["Trajectory Match", "Checks tool sequences in strict, ordered, or unordered mode."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-xl border border-white/10 bg-[#101522] p-4">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
                </div>
              ))}
            </div>

            <CodePanel {...codeBlocks[3]} />
          </section>

          <section id="recording" className="mb-14 space-y-5">
            <h2 className="text-2xl font-bold">4. Record interactions</h2>
            <p className="text-gray-400 leading-7">
              CassetteRecorder captures request and response interactions.
              You can finalize the recording and save it as a JSON cassette.
            </p>
            <CodePanel {...codeBlocks[4]} />
          </section>

          <section id="replay" className="mb-14 space-y-5">
            <h2 className="text-2xl font-bold">5. Replay interactions</h2>
            <p className="text-gray-400 leading-7">
              Load a saved cassette and use ReplayEngine to match recorded
              requests and retrieve their recorded responses.
            </p>
            <CodePanel {...codeBlocks[5]} />
          </section>

          <section id="limitations" className="mb-14 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <ShieldCheck size={19} />
              Important implementation notes
            </div>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-gray-400">
              <li>
                The generic adapter records a single execution step. It does
                not automatically expose internal tool calls made inside your function.
              </li>
              <li>
                Tool metrics require actual tool-call data in the AgentRun.
              </li>
              <li>
                The simple recording example captures a prompt and response.
                It does not automatically instrument every external API call.
              </li>
              <li>
                Replay returns recorded responses. It does not execute the
                original live agent again.
              </li>
              <li>
                The installation command assumes the package is available
                from your configured Python package index.
              </li>
            </ul>
          </section>

          <div className="flex flex-wrap gap-4 border-t border-white/10 pt-8">
            <Link href="/playground" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500">
              Try the demo <ArrowRight size={16} />
            </Link>
            <Link href="/replay" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-medium hover:bg-white/5">
              Record & Replay
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
