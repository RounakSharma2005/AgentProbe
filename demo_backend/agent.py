
"""Customer Support sample agent for the AgentProbe recruiter demo."""

from __future__ import annotations

import time
from typing import Literal

from checkagent.core.types import AgentInput, AgentRun, Step, ToolCall
from checkagent.replay.cassette import Cassette
from checkagent.replay.recorder import CassetteRecorder

Scenario = Literal["success", "failure"]

SAMPLE_QUERY = (
    "I ordered a laptop five days ago. My payment was successful, "
    "but I haven't received any delivery updates. Can you check my order?"
)


def get_order() -> dict:
    """Retrieve the customer's order information."""
    return {
        "order_id": "ORD-2026-1042",
        "product": "Laptop",
        "order_date": "2026-11-15",
        "customer_id": "CUST-104",
    }


def check_payment() -> dict:
    """Verify the customer's payment."""
    return {
        "order_id": "ORD-2026-1042",
        "payment_status": "successful",
        "amount": 65000,
        "currency": "INR",
    }


def track_delivery() -> dict:
    """Retrieve the actual delivery tracking information.

    Both scenarios receive the same correct source data.
    """
    return {
        "order_id": "ORD-2026-1042",
        "delivery_status": "delayed",
        "last_update": "No recent update",
        "location": "Regional sorting facility",
    }


def run_sample_agent(
    scenario: Scenario = "success",
) -> tuple[AgentRun, Cassette]:
    """Execute the deterministic customer support sample agent.

    Args:
        scenario: Either 'success' or 'failure'.

    Returns:
        A tuple containing the AgentProbe execution trace
        and its recorded cassette.
    """
    if scenario not in ("success", "failure"):
        raise ValueError(
            "scenario must be either 'success' or 'failure'"
        )

    started = time.perf_counter()

    recorder = CassetteRecorder(
        test_id=f"agentprobe_customer_support_{scenario}"
    )

    steps: list[Step] = []

   
    tools = [
        ("get_order", {}, get_order()),
        ("check_payment", {}, check_payment()),
        ("track_delivery", {}, track_delivery()),
    ]

    for index, (tool_name, arguments, result) in enumerate(tools):
        step_started = time.perf_counter()

        # Record the actual tool interaction.
        recorder.record_tool_call(
            tool_name=tool_name,
            arguments=arguments,
            result=result,
            metadata={
                "scenario": scenario,
            },
        )

        duration_ms = (
            time.perf_counter() - step_started
        ) * 1000

        tool_call = ToolCall(
            name=tool_name,
            arguments=arguments,
            result=result,
            duration_ms=duration_ms,
        )

        steps.append(
            Step(
                step_index=index,
                input_text=SAMPLE_QUERY if index == 0 else None,
                output_text=f"Executed {tool_name}",
                tool_calls=[tool_call],
                duration_ms=duration_ms,
            )
        )

    order = tools[0][2]
    payment = tools[1][2]
    delivery = tools[2][2]

    
    if scenario == "success":
        final_output = (
            f"Your {order['product']} order {order['order_id']} "
            f"has been delayed at the regional sorting facility. "
            f"Your payment was successful. There is no recent delivery "
            f"update, so your order has not yet been confirmed as delivered."
        )

   
    else:
        final_output = (
            f"Your {order['product']} order {order['order_id']} "
            f"was delivered yesterday. Your payment was successful."
        )

    run = AgentRun(
        input=AgentInput(
            query=SAMPLE_QUERY,
            metadata={
                "scenario": scenario,
            },
        ),
        steps=steps,
        final_output=final_output,
        duration_ms=(time.perf_counter() - started) * 1000,
        agent_name="AgentProbe Customer Support Demo",
        metadata={
            "scenario": scenario,
            "sample": True,
            "payment_status": payment["payment_status"],
            "delivery_status": delivery["delivery_status"],
            "expected_delivery_status": "delayed",
        },
    )

   
    cassette = recorder.finalize()

    return run, cassette
