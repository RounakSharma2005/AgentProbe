
"""Record and replay executions for the AgentProbe demo."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from checkagent.replay.cassette import (
    Cassette,
    RecordedRequest,
)
from checkagent.replay.engine import MatchStrategy, ReplayEngine

from demo_backend.agent import run_sample_agent

CASSETTE_DIR = Path(__file__).parent / "cassettes"


def record_sample(scenario: str = "success") -> dict[str, Any]:
    """Execute the sample agent and persist its cassette."""

    if scenario not in ("success", "failure"):
        raise ValueError("scenario must be 'success' or 'failure'")

    run, cassette = run_sample_agent(scenario)

    CASSETTE_DIR.mkdir(parents=True, exist_ok=True)

    cassette_path = CASSETTE_DIR / f"customer_support_{scenario}.json"

    saved_path = cassette.save(cassette_path)

    return {
        "scenario": scenario,
        "run_id": run.run_id,
        "cassette_path": str(saved_path),
        "interaction_count": len(cassette.interactions),
        "integrity_verified": cassette.verify_integrity(),
        "final_output": run.final_output,
    }


def replay_sample(scenario: str = "success") -> dict[str, Any]:
    """Load a recorded cassette and replay its interactions."""

    if scenario not in ("success", "failure"):
        raise ValueError("scenario must be 'success' or 'failure'")

    cassette_path = CASSETTE_DIR / f"customer_support_{scenario}.json"

    if not cassette_path.exists():
        raise FileNotFoundError(
            f"No recording found for '{scenario}'. "
            "Run record_sample() first."
        )

    cassette = Cassette.load(cassette_path)

    if not cassette.verify_integrity():
        raise ValueError("Cassette integrity verification failed.")

    engine = ReplayEngine(
        cassette,
        strategy=MatchStrategy.SEQUENCE,
        block_unmatched=True,
        strict_kind=True,
    )

    replayed_interactions = []

    # Replay the original recorded requests in their recorded order.
    for original in cassette.interactions:
        request = RecordedRequest(
            kind=original.request.kind,
            method=original.request.method,
            model=original.request.model,
            body=original.request.body,
        )

        matched = engine.match(request)

        if matched is None:
            raise RuntimeError(
                f"Replay failed for interaction: {request.method}"
            )

        replayed_interactions.append({
            "sequence": matched.sequence,
            "kind": matched.request.kind,
            "method": matched.request.method,
            "status": matched.response.status,
            "response": matched.response.body,
        })

    # Ensure every recorded interaction was consumed.
    if not engine.all_used:
        raise RuntimeError("Replay did not consume every interaction.")

    # Compare replayed responses against original recorded responses.
    responses_match = all(
        replayed["response"] == original.response.body
        for replayed, original in zip(
            replayed_interactions,
            cassette.interactions,
        )
    )

    if not responses_match:
        raise RuntimeError("Replayed responses differ from recorded responses.")

    return {
        "scenario": scenario,
        "cassette_path": str(cassette_path),
        "integrity_verified": cassette.verify_integrity(),
        "total_interactions": len(replayed_interactions),
        "replayed_interactions": replayed_interactions,
        "all_interactions_consumed": engine.all_used,
        "responses_match": responses_match,
        "replay_passed": (
            engine.all_used
            and responses_match
            and cassette.verify_integrity()
        ),
    }
