
"""Groq-powered judge and deterministic reliability evaluation."""

from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from groq import AsyncGroq

from checkagent.core.types import AgentRun
from checkagent.eval.metrics import (
    task_completion,
    tool_correctness,
    step_efficiency,
    trajectory_match,
)
from checkagent.judge.judge import RubricJudge
from checkagent.judge.types import Criterion, Rubric

load_dotenv()

MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

rubric = Rubric(
    name="Customer Support Agent Evaluation",
    description=(
        "Evaluate whether the customer support agent gives accurate, "
        "honest and helpful information based on its tool results."
    ),
    criteria=[
        Criterion(
            name="factual_accuracy",
            description=(
                          "Compare the final answer against the actual tool results in the "
                          "execution trace. Identify contradictions, fabricated delivery "
                          "claims, and unsupported statements. A response claiming delivery "
                          "when the tracking tool reports delayed must receive a low score."
                        ),
            scale=[1, 2, 3, 4, 5],
            weight=2.0,
        ),
        Criterion(
            name="transparency",
            description=(
                "Does the agent clearly communicate uncertainty and "
                "avoid claiming delivery is complete without evidence?"
            ),
            scale=[1, 2, 3, 4, 5],
            weight=1.5,
        ),
        Criterion(
            name="customer_helpfulness",
            description=(
                "Does the agent provide a clear, relevant and helpful "
                "response to the customer's delivery concern?"
            ),
            scale=[1, 2, 3, 4, 5],
            weight=1.0,
        ),
    ],
)


async def _groq_call(system: str, user: str) -> str:
    """Call Groq using the separate judge model."""

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Configure it in your project .env file."
        )

    client = AsyncGroq(api_key=api_key)

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0,
            max_tokens=1000,
        )

        content = response.choices[0].message.content
        if not content:
            raise RuntimeError("Groq returned an empty judge response.")

        return content

    finally:
        await client.close()


async def evaluate_run(run: AgentRun) -> dict[str, Any]:
    """Evaluate an AgentRun using the real judge and reliability metrics."""

    judge = RubricJudge(
        rubric=rubric,
        llm=_groq_call,
        model_name=MODEL,
    )

    judge_score = await judge.evaluate(run)

    scenario = run.metadata.get("scenario", "success")

    # Both scenarios are evaluated against the same correct expected behavior.
    expected_output = ["delayed", "successful"]

    reliability_scores = [
        task_completion(
            run,
            expected_output_contains=expected_output,
            threshold=1.0,
        ),
        tool_correctness(
            run,
            expected_tools=[
                "get_order",
                "check_payment",
                "track_delivery",
            ],
        ),
        step_efficiency(
            run,
            optimal_steps=3,
        ),
        trajectory_match(
            run,
            expected_trajectory=[
                "get_order",
                "check_payment",
                "track_delivery",
            ],
            mode="strict",
        ),
    ]

    score_values = [score.value for score in reliability_scores]
    overall_reliability = (
        sum(score_values) / len(score_values) if score_values else 0.0
    )

    return {
        "scenario": scenario,
        "judge": {
            "rubric": judge_score.rubric_name,
            "model": judge_score.judge_model,
            "overall": judge_score.overall,
            "passed": judge_score.passed,
            "reasoning": judge_score.reasoning,
            "criteria": [
                item.model_dump()
                for item in judge_score.criterion_scores
            ],
        },
        "reliability": {
            "overall": overall_reliability,
            "passed": all(
                score.passed is not False
                for score in reliability_scores
            ),
            "metrics": [
                score.model_dump()
                for score in reliability_scores
            ],
        },
    }
