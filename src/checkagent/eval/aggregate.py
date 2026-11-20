
"""Aggregate scoring and regression detection for evaluation runs.

Computes summary statistics across multiple scored test cases and
compares against baseline runs to detect performance regressions.

Requirements: F3.4
"""

from __future__ import annotations

import json
import math
import statistics
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class AggregateResult:
    """Summary statistics for a collection of scores."""

    metric_name: str
    count: int
    mean: float
    median: float
    stdev: float
    min_value: float
    max_value: float
    pass_rate: float | None = None

    def to_dict(self) -> dict[str, Any]:
        d: dict[str, Any] = {
            "metric_name": self.metric_name,
            "count": self.count,
            "mean": round(self.mean, 4),
            "median": round(self.median, 4),
            "stdev": round(self.stdev, 4),
            "min": round(self.min_value, 4),
            "max": round(self.max_value, 4),
        }
        if self.pass_rate is not None:
            d["pass_rate"] = round(self.pass_rate, 4)
        return d


@dataclass
class StepStats:
    """Step count statistics across test cases."""

    count: int
    mean: float
    p50: float
    p95: float
    min_steps: int
    max_steps: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "count": self.count,
            "mean": round(self.mean, 2),
            "p50": self.p50,
            "p95": self.p95,
            "min": self.min_steps,
            "max": self.max_steps,
        }


@dataclass
class RegressionResult:
    """Result of comparing current run against a baseline."""

    metric_name: str
    current: float
    baseline: float
    delta: float
    regressed: bool
    threshold: float

    def to_dict(self) -> dict[str, Any]:
        return {
            "metric_name": self.metric_name,
            "current": round(self.current, 4),
            "baseline": round(self.baseline, 4),
            "delta": round(self.delta, 4),
            "regressed": self.regressed,
            "threshold": round(self.threshold, 4),
        }


@dataclass
class RunSummary:
    """Complete summary of an evaluation run."""

    aggregates: dict[str, AggregateResult] = field(default_factory=dict)
    step_stats: StepStats | None = None
    total_cost: float | None = None
    regressions: list[RegressionResult] = field(default_factory=list)

    @property
    def has_regressions(self) -> bool:
        return any(r.regressed for r in self.regressions)

    def to_dict(self) -> dict[str, Any]:
        d: dict[str, Any] = {
            "aggregates": {
                k: v.to_dict() for k, v in self.aggregates.items()
            },
        }
        if self.step_stats is not None:
            d["step_stats"] = self.step_stats.to_dict()
        if self.total_cost is not None:
            d["total_cost"] = round(self.total_cost, 6)
        if self.regressions:
            d["regressions"] = [r.to_dict() for r in self.regressions]
        return d

    def save(self, path: str | Path) -> None:
        """Save run summary to a JSON file for future baseline comparisons."""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(self.to_dict(), indent=2),
            encoding="utf-8",
        )

    @classmethod
    def load(cls, path: str | Path) -> RunSummary:
        """Load a previously saved run summary."""
        path = Path(path)
        data = json.loads(path.read_text(encoding="utf-8"))

        summary = cls()

        for name, agg_data in data.get("aggregates", {}).items():
            summary.aggregates[name] = AggregateResult(
                metric_name=agg_data["metric_name"],
                count=agg_data["count"],
                mean=agg_data["mean"],
                median=agg_data["median"],
                stdev=agg_data["stdev"],
                min_value=agg_data["min"],
                max_value=agg_data["max"],
                pass_rate=agg_data.get("pass_rate"),
            )

        if "step_stats" in data:
            s = data["step_stats"]
            summary.step_stats = StepStats(
                count=s["count"],
                mean=s["mean"],
                p50=s["p50"],
                p95=s["p95"],
                min_steps=s["min"],
                max_steps=s["max"],
            )

        summary.total_cost = data.get("total_cost")

        for r in data.get("regressions", []):
            summary.regressions.append(
                RegressionResult(
                    metric_name=r["metric_name"],
                    current=r["current"],
                    baseline=r["baseline"],
                    delta=r["delta"],
                    regressed=r["regressed"],
                    threshold=r["threshold"],
                )
            )

        return summary


def _percentile(sorted_values: list[float], pct: float) -> float:
    """Compute percentile using the nearest-rank method."""
    if not sorted_values:
        return 0.0

    if not 0 <= pct <= 100:
        raise ValueError("Percentile must be between 0 and 100.")

    rank = max(1, math.ceil((pct / 100.0) * len(sorted_values)))
    return sorted_values[rank - 1]


def aggregate_scores(
    scores: list[tuple[str, float, bool | None]],
) -> dict[str, AggregateResult]:
    """Compute aggregate statistics grouped by metric name.

    Args:
        scores: List of (metric_name, value, passed) tuples.

    Returns:
        Dict mapping metric name to AggregateResult.

    Raises:
        ValueError: If a score is not a finite number.
    """
    from collections import defaultdict

    by_name: dict[str, list[tuple[float, bool | None]]] = defaultdict(list)

    for name, value, passed in scores:
        if (
            not isinstance(value, (int, float))
            or isinstance(value, bool)
            or not math.isfinite(value)
        ):
            raise ValueError(
                f"Score for metric '{name}' must be a finite number."
            )

        by_name[name].append((value, passed))

    results: dict[str, AggregateResult] = {}

    for name, entries in by_name.items():
        values = [v for v, _ in entries]
        passed_flags = [p for _, p in entries if p is not None]

        n = len(values)
        mean = statistics.mean(values)
        median = statistics.median(values)
        stdev = statistics.stdev(values) if n >= 2 else 0.0

        pass_rate = (
            sum(passed_flags) / len(passed_flags)
            if passed_flags
            else None
        )

        results[name] = AggregateResult(
            metric_name=name,
            count=n,
            mean=mean,
            median=median,
            stdev=stdev,
            min_value=min(values),
            max_value=max(values),
            pass_rate=pass_rate,
        )

    return results


def compute_step_stats(step_counts: list[int]) -> StepStats:
    """Compute step count statistics.

    Args:
        step_counts: List of step counts from agent runs.

    Returns:
        StepStats with mean, p50, p95, min, max.

    Raises:
        ValueError: If a step count is negative or not an integer.
    """
    if any(
        not isinstance(count, int)
        or isinstance(count, bool)
        or count < 0
        for count in step_counts
    ):
        raise ValueError("Step counts must be non-negative integers.")

    if not step_counts:
        return StepStats(
            count=0,
            mean=0.0,
            p50=0,
            p95=0,
            min_steps=0,
            max_steps=0,
        )

    sorted_counts = sorted(step_counts)

    return StepStats(
        count=len(step_counts),
        mean=statistics.mean(step_counts),
        p50=int(_percentile(sorted_counts, 50)),
        p95=int(_percentile(sorted_counts, 95)),
        min_steps=min(step_counts),
        max_steps=max(step_counts),
    )


def detect_regressions(
    current: dict[str, AggregateResult],
    baseline: dict[str, AggregateResult],
    threshold: float = 0.05,
) -> list[RegressionResult]:
    """Compare current aggregate scores against a baseline.

    A regression is detected when the current mean drops below
    the baseline mean by more than the threshold.

    Args:
        current: Current run's aggregate results.
        baseline: Baseline run's aggregate results.
        threshold: Minimum drop (as absolute value) to flag as regression.

    Returns:
        List of RegressionResult for each compared metric.

    Raises:
        ValueError: If the threshold is negative or non-finite.
    """
    if (
        not isinstance(threshold, (int, float))
        or isinstance(threshold, bool)
        or not math.isfinite(threshold)
    ):
        raise ValueError("Threshold must be a finite number.")

    if threshold < 0:
        raise ValueError("Threshold must be non-negative.")

    results: list[RegressionResult] = []

    for name in current:
        if name not in baseline:
            continue

        cur_mean = current[name].mean
        base_mean = baseline[name].mean
        delta = cur_mean - base_mean
        regressed = delta < -threshold

        results.append(
            RegressionResult(
                metric_name=name,
                current=cur_mean,
                baseline=base_mean,
                delta=delta,
                regressed=regressed,
                threshold=threshold,
            )
        )

    return results
