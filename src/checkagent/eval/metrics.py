
"""Built-in evaluation metrics for agent runs.

Provides deterministic metrics for evaluating agent performance:
- TaskCompletion: Did the agent achieve the stated goal?
- ToolCorrectness: Were the right tools called? (precision, recall, F1)
- StepEfficiency: How many steps vs. optimal? (ratio)
- TrajectoryMatch: Does the step sequence match expected.

Requirements: F3.1
"""

from __future__ import annotations

from checkagent.core.types import AgentRun, Score


def task_completion(
    run: AgentRun,
    *,
    expected_output_contains: list[str] | None = None,
    expected_output_equals: str | None = None,
    check_no_error: bool = True,
    threshold: float = 1.0,
) -> Score:
    """Score task completion based on output content and success."""

    checks: list[bool] = []

    if check_no_error:
        checks.append(run.succeeded)

    if expected_output_equals is not None:
        if run.final_output is None:
            checks.append(False)
        else:
            checks.append(str(run.final_output) == expected_output_equals)

    if expected_output_contains:
        if run.final_output is None:
            for _substring in expected_output_contains:
                checks.append(False)
        else:
            output_lower = str(run.final_output).lower()
            for substring in expected_output_contains:
                checks.append(substring.lower() in output_lower)

    value = (
        (1.0 if run.succeeded else 0.0)
        if not checks
        else sum(checks) / len(checks)
    )

    return Score(
        name="task_completion",
        value=value,
        threshold=threshold,
        reason=f"{sum(checks)}/{len(checks)} checks passed",
        metadata={"checks": checks},
    )



def tool_correctness(
    run: AgentRun,
    *,
    expected_tools: list[str],
    threshold: float = 0.5,
) -> Score:
    """Score tool usage with duplicate-aware precision, recall, and F1.

    Treats tool calls as a multiset, so repeated calls are counted
    individually rather than being discarded.

    Args:
        run: The AgentRun to evaluate.
        expected_tools: Expected tool calls, including repetitions.
        threshold: F1 score threshold for pass/fail.

    Returns:
        Score with F1 value and detailed call-count metadata.
    """
    from collections import Counter

    actual_tools = [tc.name for tc in run.tool_calls]

    actual_counts = Counter(actual_tools)
    expected_counts = Counter(expected_tools)

    # Match only as many calls as were expected.
    matched_counts = actual_counts & expected_counts

    true_positives = sorted(
        name
        for name, count in matched_counts.items()
        for _ in range(count)
    )

    false_positives = sorted(
        name
        for name, count in (actual_counts - expected_counts).items()
        for _ in range(count)
    )

    false_negatives = sorted(
        name
        for name, count in (expected_counts - actual_counts).items()
        for _ in range(count)
    )

    tp = sum(matched_counts.values())
    actual_total = len(actual_tools)
    expected_total = len(expected_tools)

    if actual_total == 0 and expected_total == 0:
        precision = 1.0
        recall = 1.0

    else:
        precision = tp / actual_total if actual_total else 0.0
        recall = tp / expected_total if expected_total else 0.0

    f1 = (
        2 * precision * recall / (precision + recall)
        if precision + recall > 0
        else 0.0
    )

    return Score(
        name="tool_correctness",
        value=f1,
        threshold=threshold,
        reason=(
            f"P={precision:.2f} R={recall:.2f} F1={f1:.2f} "
            f"(called={sorted(actual_tools)}, "
            f"expected={sorted(expected_tools)})"
        ),
        metadata={
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "actual_tools": sorted(actual_tools),
            "expected_tools": sorted(expected_tools),
            "true_positives": true_positives,
            "false_positives": false_positives,
            "false_negatives": false_negatives,
        },
    )


def step_efficiency(
    run: AgentRun,
    *,
    optimal_steps: int,
    threshold: float = 0.5,
) -> Score:
    """Score step efficiency as ratio of optimal to actual steps.

    A score of 1.0 means the agent used the optimal number of steps.
    Scores decrease as the agent uses more steps than optimal.

    Args:
        run: The agent run to evaluate.
        optimal_steps: The minimum number of steps needed.
        threshold: Efficiency ratio threshold for pass/fail.

    Returns:
        Score with efficiency ratio.

    Raises:
        ValueError: If optimal_steps is negative.
    """

    # Validate input.
    if optimal_steps < 0:
        raise ValueError("optimal_steps cannot be negative")

    actual_steps = len(run.steps)

    # Handle zero-step edge cases.
    if actual_steps == 0:
        ratio = 1.0 if optimal_steps == 0 else 0.0
    else:
        ratio = min(optimal_steps / actual_steps, 1.0)

    return Score(
        name="step_efficiency",
        value=ratio,
        threshold=threshold,
        reason=(
            f"{actual_steps} steps taken, "
            f"{optimal_steps} optimal (ratio={ratio:.2f})"
        ),
        metadata={
            "actual_steps": actual_steps,
            "optimal_steps": optimal_steps,
            "ratio": ratio,
        },
    )




def trajectory_match(
    run: AgentRun,
    *,
    expected_trajectory: list[str],
    mode: str = "ordered",
    threshold: float = 1.0,
) -> Score:
    """Score whether the agent's tool call sequence matches expected.

    Supports three matching modes:
    - strict: Exact sequence match.
    - ordered: Expected tools appear in order, allowing missing or extra tools.
    - unordered: All expected tools were called, regardless of order.

    Args:
        run: The agent run to evaluate.
        expected_trajectory: Expected sequence of tool names.
        mode: Matching mode — strict, ordered, or unordered.
        threshold: Score threshold for pass/fail.

    Returns:
        Score with trajectory matching result.

    Raises:
        ValueError: If mode is invalid.
    """

    if mode not in ("strict", "ordered", "unordered"):
        raise ValueError(
            f"Invalid mode: {mode!r}. "
            "Must be 'strict', 'ordered', or 'unordered'."
        )

    actual_trajectory = [tc.name for tc in run.tool_calls]

    if mode == "strict":
        match = actual_trajectory == expected_trajectory
        value = 1.0 if match else 0.0

        reason = (
            "exact match"
            if match
            else f"expected {expected_trajectory}, got {actual_trajectory}"
        )

    elif mode == "ordered":
        matched = 0
        idx = 0

        for expected_tool in expected_trajectory:
            # Search for the next expected tool.
            found_index = None

            for actual_idx in range(idx, len(actual_trajectory)):
                if actual_trajectory[actual_idx] == expected_tool:
                    found_index = actual_idx
                    break

            # Advance only when a match is found.
            # If missing, preserve the current position so
            # later expected tools can still be matched.
            if found_index is not None:
                matched += 1
                idx = found_index + 1

        value = (
            matched / len(expected_trajectory)
            if expected_trajectory
            else 1.0
        )

        reason = (
            f"{matched}/{len(expected_trajectory)} "
            "tools matched in order"
        )

    else:
        expected_set = set(expected_trajectory)
        actual_set = set(actual_trajectory)

        matched = len(expected_set & actual_set)

        value = (
            matched / len(expected_set)
            if expected_set
            else 1.0
        )

        reason = f"{matched}/{len(expected_set)} expected tools found"

    return Score(
        name="trajectory_match",
        value=value,
        threshold=threshold,
        reason=reason,
        metadata={
            "mode": mode,
            "actual_trajectory": actual_trajectory,
            "expected_trajectory": expected_trajectory,
        },
    )
