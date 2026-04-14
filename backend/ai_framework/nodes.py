import os
import json
from typing import TypedDict, Optional ,Dict, List
from dotenv import load_dotenv
from groq import Groq
from langgraph.graph import StateGraph, END
import chromadb
from chromadb.utils import embedding_functions


load_dotenv()
grok_api_key=os.getenv("GROQ_API_KEY")
gemini_api_key=os.getenv("GEMINI_API_KEY")

# Vector DB Setup (ChromaDB)
# Persistent storage for embeddings
chroma_client = chromadb.PersistentClient(path="./chroma_db")
google_ef = embedding_functions.GoogleGenerativeAiEmbeddingFunction(api_key=gemini_api_key, model_name="models/gemini-embedding-001")




client = Groq(
    api_key=grok_api_key
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
    user_id:str
    description:str
    user_name:str
    messageId: str
    is_valid: bool
    sanity_message: str
    context: str
    documents: List[str]
    metadata: List[Dict]
    sanity_check:Dict
    thinking: List[Dict]
    documentAnswer: List[Dict] 
    websearch: List[Dict]
    suggest_questions: List[str]



# -----------------------------
# ROUTER
# -----------------------------
def route_after_validation(state: GraphState):
    print('state',state)
    if state["is_valid"]:
        return "thinking"
    else:
        return "end"

# -----------------------------
# NODE 1: VALIDATION
# ----------------------------- 
def validate_question(state: GraphState):
    question = state["query"]
    file_path = os.path.join(parent_dir,'prompts', 'validate_question.txt')
    with open(file_path, "r") as f:       
            template = f.read()
    prompt = template.format(
        query=state["query"],
        description=state["description"]
    )
    # print(prompt)
    # print("*"*10)
    response=run_llm(prompt)
    result = response.choices[0].message.content.strip()
    print('validate_question llm',result)
    is_valid = result.upper().startswith("VALID")
    state["is_valid"]=is_valid
    result={"is_valid": is_valid,"messageId":state['messageId']}
    return {
        "sanity_check": result,"is_valid": is_valid
    }


def thinking_steps(state: GraphState):
    file_path = os.path.join(parent_dir,'prompts', 'thinking.txt')
    with open(file_path, "r") as f:       
            template = f.read()
    prompt = template.format(query=state["query"])
    # print(prompt)
    # print("*"*10)
    response=run_llm(prompt)
    state['thinking']=response.choices[0].message.content
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
    query = state["query"]
    user_id =state['user_id'] 
    user_name =state['user_name']  
    filename=state['filename'] 
    # --- Create collection ---
    collection_name = f"{user_id}_{filename}"
    collection = chroma_client.get_or_create_collection(
        name=collection_name,
        embedding_function=google_ef
    )
    # print('query',query)
    # --- Retrieve Relevant Chunks ---
    results = collection.query(
        query_texts=[query],
        n_results=3
    )
    
    documents = results.get("documents", [[]])[0]
    # print('documents==',documents)
    metadatas = results.get("metadatas", [[]])[0]
    # print('metadatas==',metadatas)
    context=''
    if not documents:
        context = "No relevant documents found."
    else:
        # Format context to include EXACT page numbers for Gemini to cite
        context_blocks = []
        for i in range(len(documents)):
            doc_text = documents[i]
            meta = metadatas[i]
            page = meta.get("page", "Unknown")
            fname = meta.get("filename", "Unknown")
            context_blocks.append(f"SOURCE: {fname} (Page {page})\nCONTENT: {doc_text}")
            if context_blocks:
                    context = "\n\n---\n\n".join(context_blocks) 
    # print('context==',context)
    file_path = os.path.join(parent_dir,'prompts', 'doc_answer.txt')
    with open(file_path, "r") as f:       
            template = f.read()
            # print('template==',template)
    prompt = template.format(
        thinking=state["thinking"],
        context=context,
        query=state["query"]
    )
    # print("#"*10)
    # print('prompt==')
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
    return {"documentAnswer":result}

def websearch(state: GraphState):
    file_path = os.path.join(parent_dir,'prompts', 'web_search.txt')
    with open(file_path, "r") as f:       
            template = f.read()
            # print('template==',template)
    prompt = template.format(
        query=state["query"]
    )
    # print("#"*10)
    # print('prompt==')
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
    return {"websearch":result}

def suggest_questions(state: GraphState):
    file_path = os.path.join(parent_dir,'prompts', 'followups.txt')
    with open(file_path, "r") as f:       
            template = f.read()
            # print('template==',template)
    prompt = template.format(
        query=state["query"]
    )
    # print("#"*10)
    # print('prompt==')
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
    return {"suggest_questions":result}

# def completedProcess(state: GraphState):
#     print('completedprocess')
#     return {"key":"completed","data":""}
