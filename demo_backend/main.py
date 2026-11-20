
"""FastAPI application for the AgentProbe recruiter demo."""

from __future__ import annotations

from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from demo_backend.agent import run_sample_agent
from demo_backend.evaluator import evaluate_run
from demo_backend.replay import record_sample, replay_sample


Scenario = Literal["success", "failure"]


class DemoRequest(BaseModel):
    scenario: Scenario = "success"


app = FastAPI(
    title="AgentProbe API",
    description="Interactive agent testing and evaluation demo.",
    version="1.0.0",
)

# Allow the local Next.js frontend to communicate with this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://agent-probe-ten.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "service": "AgentProbe",
        "version": "1.0.0",
    }


@app.post("/api/demo/run")
async def run_demo(request: DemoRequest):
    """Execute and evaluate a sample agent."""

    try:
        run, cassette = run_sample_agent(request.scenario)

        evaluation = await evaluate_run(run)

        return {
            "success": True,
            "scenario": request.scenario,
            "agent": run.agent_name,
            "run_id": run.run_id,
            "trace": run.model_dump(mode="json"),
            "evaluation": evaluation,
            "recording": {
                "interaction_count": len(cassette.interactions),
                "integrity_verified": cassette.verify_integrity(),
            },
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Demo execution failed: {str(exc)}",
        ) from exc


@app.post("/api/demo/record")
async def record_demo(request: DemoRequest):
    """Execute and persist a sample cassette."""

    try:
        result = record_sample(request.scenario)

        return {
            "success": True,
            "message": "Execution recorded successfully.",
            "recording": result,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Recording failed: {str(exc)}",
        ) from exc


@app.post("/api/demo/replay")
async def replay_demo(request: DemoRequest):
    """Replay a previously recorded execution."""

    try:
        result = replay_sample(request.scenario)

        return {
            "success": True,
            "message": "Replay completed successfully.",
            "replay": result,
        }

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Replay failed: {str(exc)}",
        ) from exc


@app.get("/")
async def root():
    return {
        "message": "Welcome to AgentProbe",
        "docs": "/docs",
        "health": "/api/health",
    }
