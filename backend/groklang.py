import os
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv
load_dotenv()

# Groq client
from groq import Groq

# -----------------------------
# CONFIG
# -----------------------------
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = "llama-3.3-70b-versatile"

# -----------------------------
# STATE
# -----------------------------
class GraphState(TypedDict):
    question: str
    is_valid: Optional[bool]
    answer: Optional[str]
    suggestions: Optional[str]



    

# -----------------------------
# NODE 1: VALIDATION
# -----------------------------
def validate_question(state: GraphState):
    question = state["question"]

    prompt = f"""You are a strict classifier.

                Check if the following input is a meaningful question.

                Reject:
                - random text
                - gibberish
                - incomplete phrases

                Respond ONLY with:
                VALID or INVALID

                Input: {question}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=1000
    )

    result = response.choices[0].message.content.strip()
    is_valid = result.upper().startswith("VALID")

    return {"is_valid": is_valid}

# -----------------------------
# NODE 2: ANSWER
# -----------------------------
def generate_answer(state: GraphState):
    question = state["question"]

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": question}
        ],
        temperature=0.7
    )

    answer = response.choices[0].message.content

    return {"answer": answer}

# -----------------------------
# NODE 3: SUGGESTIONS
# -----------------------------
def suggest_questions(state: GraphState):
    question = state["question"]
    answer = state["answer"]

    prompt = f"""
                Based on the question and answer below, suggest 3 relevant follow-up questions.

                Question: {question}
                Answer: {answer}

                Return only 3 questions in numbered format.
            """

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    suggestions = response.choices[0].message.content

    return {"suggestions": suggestions}

# -----------------------------
# ROUTER
# -----------------------------
def route_after_validation(state: GraphState):
    if state["is_valid"]:
        return "generate_answer"
    else:
        return END

# -----------------------------
# BUILD GRAPH
# -----------------------------
def build_graph():
    builder = StateGraph(GraphState)
    builder.add_node("validate", validate_question)
    builder.add_node("generate_answer", generate_answer)
    builder.add_node("suggest", suggest_questions)

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

# -----------------------------
# STREAM FUNCTION
# -----------------------------
def ask_question_stream(query: str):
    graph = build_graph()

    print("\n=== STREAMING START ===\n")

    final_state = {}

    for step in graph.stream({"question": query}):
        for node, output in step.items():

            print(f"\n🔹 Node: {node}")

            if node == "validate":
                print("Validation Result:", output["is_valid"])
                if not output["is_valid"]:
                    print("❌ Invalid question. Stopping execution.")
                    return

            elif node == "generate_answer":
                print("\nAnswer:\n", output["answer"])

            elif node == "suggest":
                print("\nSuggested Questions:\n", output["suggestions"])

            final_state.update(output)

    print("\n=== STREAMING END ===\n")
    return final_state


# -----------------------------
# TEST
# -----------------------------
if __name__ == "__main__":
    q = input("Enter your question: ")
    ask_question_stream(q)