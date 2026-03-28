import os
from langgraph.graph import StateGraph, END
from nodes import *


# -----------------------------
# BUILD GRAPH

# -----------------------------
def build_graph():
    builder = StateGraph(GraphState)
    builder.add_node("validate", validate_question)
    builder.add_node("thinking", thinking_steps)
    builder.add_node("retrive_document", generate_answer)
    builder.add_node("websearch", websearch)
    builder.add_node("followupquestion", suggest_questions)
    builder.set_entry_point("validate")
    builder.add_conditional_edges(
        "validate",
        route_after_validation,
        {
            "generate_answer": "generate_answer",
            END: END
        }
    )

    builder.add_edge("generate_answer", "suggest")
    builder.add_edge("suggest", END)

    return builder.compile()