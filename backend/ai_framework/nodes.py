import os
import json
from typing import TypedDict, Optional ,Dict, List
from dotenv import load_dotenv
from groq import Groq
from langgraph.graph import StateGraph, END


load_dotenv()
api_key=os.getenv("GROQ_API_KEY")

client = Groq(
    api_key=api_key
)
MODEL = "llama-3.3-70b-versatile"

# 1. Get the absolute path to the directory where this script lives
script_dir = os.path.dirname(os.path.abspath(__file__))
# # 2. Move up one level to the Parent Folder
parent_dir = os.path.dirname(script_dir) 


def run_llm(prompt):
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=100
    )
    return response


# response=run_llm('write paragraph on india with 1 sentence')
# print(response.choices[0].message.content)
# print(response.usage.completion_tokens)
# print(response.usage.prompt_tokens)
# print(response.usage.total_tokens)

 
# # 3. Define the path to the other folder and the file
# file_path = os.path.join(parent_dir,'prompts', 'validate_question.txt')
# with open(file_path, "r") as f:       
#         template = f.read()

class GraphState(TypedDict):
    query: str
    filename: str
    messageId: str
    is_valid: bool
    sanity_message: str
    context: str
    documents: List[str]
    metadata: List[Dict]
    thinking: str
    documentAnswer: List[Dict] 
    web_search: List[Dict]
    follow_up_questions: List[str]



# -----------------------------
# ROUTER
# -----------------------------
def route_after_validation(state: GraphState):
    if state["is_valid"]:
        return "Thinking"
    else:
        return END

# -----------------------------
# NODE 1: VALIDATION
# ----------------------------- 
def validate_question(state: GraphState):
    question = state["query"]
    file_path = os.path.join(parent_dir,'prompts', 'validate_question.txt')
    with open(file_path, "r") as f:       
            template = f.read()
    prompt = template.format(
        query=state["query"]
    )
    # print(prompt)
    # print("*"*10)
    response=run_llm(prompt)
    result = response.choices[0].message.content.strip()
    is_valid = result.upper().startswith("VALID")
    return {"is_valid": is_valid}

def thinking_steps(state: GraphState):
    print('state["query"]',state["query"])
    file_path = os.path.join(parent_dir,'prompts', 'thinking.txt')
    with open(file_path, "r") as f:       
            template = f.read()
    prompt = template.format(query=state["query"])
    # print(prompt)
    # print("*"*10)
    response=run_llm(prompt)
    result={
    'content':response.choices[0].message.content,
    'used_tokens':response.usage.completion_tokens,
    'prompt_tokens':response.usage.prompt_tokens,
    'total_tokens':response.usage.total_tokens,
    'messageid':state["messageId"]
    }
    return {
        "thinking": result
    }

def generate_answer(state: GraphState):
    return 

def websearch(state: GraphState):
    return 

def suggest_questions(state: GraphState):
    return 

def completedProcess(state: GraphState):
    print('completedprocess')
    return {"key":"completed","data":""}
# x=GraphState()
# completedprocess(x)