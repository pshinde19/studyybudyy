import os
from langgraph.graph import StateGraph, END
from ai_framework.nodes import *


# -----------------------------
# BUILD GRAPH
# -----------------------------
def build_graph():
    builder = StateGraph(GraphState)
    builder.add_node("validate", validate_question)
    builder.add_node("Thinking", thinking_steps)
    builder.add_node("retrive_document", generate_answer)
    builder.add_node("Websearch", websearch)
    builder.add_node("suggest_questions", suggest_questions)
    builder.set_entry_point("validate")
    builder.add_conditional_edges(
        "validate",
        route_after_validation,
        {
            "thinking": "Thinking",
            "end":END
        }
    )
    builder.add_edge("Thinking", "retrive_document")
    builder.add_edge("retrive_document", "Websearch")
    builder.add_edge("Websearch", "suggest_questions")
    builder.add_edge("suggest_questions", END)
    return builder.compile()