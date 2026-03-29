import os
import json
import uuid
import time
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
import fitz  # PyMuPDF
from groq import Groq
# import chromadb
# from chromadb.utils import embedding_functions
from flask_socketio import SocketIO
from graph.builder import build_graph
from graph.callbacks import SocketIOCallbackHandler
from ai_framework.nodes import chroma_client,google_ef

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
app.secret_key = '123456' # MUST be set for sessions

# 1. Update CORS: allow_headers and supports_credentials are key
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# 2. Configure Session Cookie behavior
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax', # Necessary for modern browsers
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=False,   # Set to True if using HTTPS
)

# # Gemini API Configuration
# # Note: The environment provides the API key at runtime via an empty string assignment logic
# apiKey = "" 
# # openaikey=""
# grok_api_key=os.getenv("GROQ_API_KEY")
# # CORRECT INITIALIZATION for gemini-3-flash-preview
# groq_client = Groq(
#     api_key=grok_api_key
# )

# Vector DB Setup (ChromaDB)
# Persistent storage for embeddings
chroma_client = chroma_client
google_ef = google_ef



# Local Storage Configuration
UPLOAD_FOLDER = 'user_documents'
USER_DB = 'users.json'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)




def load_users():
    if not os.path.exists(USER_DB):
        return {}
    with open(USER_DB, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USER_DB, 'w') as f:
        json.dump(users, f, indent=4)

def retry_api_call(func, *args, **kwargs):
    """Exponential backoff for API calls"""
    for i in range(5):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if i == 4: raise e
            time.sleep(2**i)

# --- Auth Routes ---

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    print(data)
    users = load_users()
    if data['email'] in users and data['name'] in users:
        return jsonify({"error": "User exists"}), 400
    
    users[data['email']] = {
        "password": data['password'],
        "name": data['name'],
        "id": str(uuid.uuid4())
    }
    save_users(users)
    return jsonify({"message": "User created"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json or "pranayshinde19@gmail.com"
    print('login data',data)
    users = load_users()
    user = users.get(data['email'])
    if user and user['password'] == data['password']:
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['email']=data['email']
        print(session)
        session.permanent=True
        return jsonify({"user": {"name": user['name'], "id": user['id']}}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/getmetadata', methods=['GET'])
def getmetadata():
    user_name=session['user_name']
    # Construct the absolute path to the user's directory
    user_dir = os.path.join(UPLOAD_FOLDER, user_name)

    # 1. Security Check: Ensure the directory exists
    if not os.path.exists(user_dir):
        return jsonify({"error": "User directory not found"}), 404

    try:
        # 2. List all items and filter out directories
        # os.path.isfile checks if the entry is a file, not a folder
        files = [
            f for f in os.listdir(user_dir) 
            if os.path.isfile(os.path.join(user_dir, f))
        ]

        return jsonify({
            "user": user_name,
            "files": files,
            "count": len(files)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Extract pages from PDF ---
def extract_pdf_pages(file_path):
    pages = []
    doc = fitz.open(file_path)

    for page_num, page in enumerate(doc):
        text = page.get_text("text")

        if text.strip():
            pages.append({
                "page": page_num + 1,
                "text": text
            })

    return pages


# --- Fallback: Read normal text file ---
def extract_text_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return [{
                "page": 1,
                "text": f.read()
            }]
    except:
        return []


# --- Optional: sub-chunk large pages ---
def chunk_per_page(text, chunk_size=500, overlap=50):
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap

    return chunks

# --- Upload Route ---
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        file = request.files['file']
        description = request.form.get('description', '')

        user_id = session['user_id']
        user_name = session['user_name']

        # --- Create user folder ---
        user_dir = os.path.join(UPLOAD_FOLDER, user_name)
        os.makedirs(user_dir, exist_ok=True)

        # --- Save file ---
        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        save_path = os.path.join(user_dir, filename)
        file.save(save_path)

        # --- Detect file type ---
        ext = filename.split('.')[-1].lower()

        if ext == "pdf":
            pages = extract_pdf_pages(save_path)
        else:
            pages = extract_text_file(save_path)

        # If nothing extracted
        if not pages:
            pages = [{
                "page": 1,
                "text": f"Document: {filename}. Description: {description}"
            }]

        # --- Prepare data for vector DB ---
        chunks = []
        metadatas = []
        ids = []

        for page_data in pages:
            page_number = page_data["page"]
            page_text = page_data["text"]

            # 🔥 Use sub-chunking for large pages
            sub_chunks = chunk_per_page(page_text)

            for i, chunk in enumerate(sub_chunks):
                chunks.append(chunk)

                ids.append(str(uuid.uuid4()))

                metadatas.append({
                    "filename": filename,
                    "file_id": file_id,
                    "page": page_number,
                    "chunk_index": i,
                    "description": description
                })

        # --- Create collection ---
        collection_name = f"{user_id}_{filename}"

        collection = chroma_client.get_or_create_collection(
            name=collection_name,
            embedding_function=google_ef
        )

        # --- Store embeddings ---
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )

        return jsonify({
            "status": "success",
            "file_id": file_id,
            "filename": filename,
            "pages": len(pages),
            "chunks_added": len(chunks)
        }), 200

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    # if 'user_id' not in session:
    #     return jsonify({"error": "Unauthorized"}), 401
    # try:
    user_id =  "21a1ff59-f04b-450e-bf46-322617dae796" #session['user_id'] or
    user_name =  "pranay" #session['user_name'] or

    data = request.json
    query =data.get("query","What is the significance of keys in React?")

    if not query:
        return jsonify({"error": "Query required"}), 400

    filename='reactaa.pdf'
    # --- Create collection ---
    collection_name = f"{user_id}_{filename}"
    collection = chroma_client.get_or_create_collection(
        name=collection_name,
        embedding_function=google_ef
    )

    # --- Retrieve Relevant Chunks ---
    results = collection.query(
        query_texts=[query],
        n_results=2
    )

    documents = results.get("documents", [[]])[0]
    print('documents',documents)
    metadatas = results.get("metadatas", [[]])[0]
    print('metadatas',metadatas)
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
    print('context',context)
    # --- Prepare citations ---
    citations = []
    for meta in metadatas:
        print(meta.get("filename"),meta)
        citations.append({
            "filename": meta.get("filename"),
            "chunk": meta.get("chunk"),
            "text": f"From document {meta.get('filename')}"
        })

    # --- Prompt for Gemini ---
    prompt = f"""
    You are Lumina AI. Answer the user question using the provided PDF context and Google Search.
    
    ### CONTEXT FROM USER DOCUMENTS:
    {context}

    ### USER QUESTION:
    {query}

    ### OUTPUT INSTRUCTIONS:
    Return a JSON object with these exact keys:
    1. "reasoning": Your internal thought process.
    2. "documentAnswer": Answer based ONLY on the PDF context. Use [filename, pg X] for citations.
    3. "documentSources": List of {{ "filename": "...", "page": X }} referenced.
    4. "llm knowledge": models training knowledge on topic.
    5. "Web search":Answer based on Google Search results for the latest info with reference website links.
    5. "followUpQuestions": 3 suggested follow-up questions.
    """
    print(prompt)
    # --- Gemini Call ---
    response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # 🔥 strong + free
                messages=[
                    {
                        "role": "system",
                        "content": "You are Lumina AI. Always return valid JSON exactly as instructed."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=1500
            )
    text = response.choices[0].message.content.strip()
    # Remove markdown if Gemini adds it
    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()

    result = json.loads(text)
    # Inject real-time grounding links if available from the search tool
    

    # Inject document citations if Gemini forgot
    if not result.get("citations"):
        result["citations"] = citations

    return jsonify(result)

    # except Exception as e:
    #     print(f"CRITICAL CHAT ERROR: {e}")
    #     return jsonify({
    #         "reasoning": "Error occurred during processing.",
    #         "documentAnswer": "Unable to retrieve data.",
    #         "documentSources": [],
    #         "followUpQuestions": ["Try again?", "Check server logs?"]
    #     }), 500
    

if __name__ == "__main__":
    socketio.run(app, debug=True,port=5000)