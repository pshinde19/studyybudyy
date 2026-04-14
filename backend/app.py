from functools import wraps
import os
import json
import uuid
import time
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_socketio import SocketIO, emit
from ai_framework.nodes import chroma_client,google_ef
from auth.authenticate import *
from ai_framework.createvectors import *
from ai_framework.langgraphframe import build_graph
from myutils.utilities import *

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*",async_mode="eventlet")
app.secret_key = '123456' 

# 1. Update CORS: allow_headers and supports_credentials are key
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# 2. Configure Session Cookie behavior
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax', # Necessary for modern browsers
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=False,   # Set to True if using HTTPS
)

# Vector DB Setup (ChromaDB) Persistent storage for embeddings
chroma_client = chroma_client
google_ef = google_ef
# Build the graph once globally or inside the event
graph = build_graph()

# Local Storage Configuration
UPLOAD_FOLDER = 'user_documents'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # We check if the email exists in the session
        if 'email' not in session or 'user_id' not in session:
            return jsonify({"error": "Unauthorized. Please log in."}), 401
        return f(*args, **kwargs)
    return decorated_function


# --- Auth Routes ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    print(data)
    users = load_users()
    # 3. Handle Missing Keys (Input Validation)
    if 'email' not in data or 'password' not in data or 'name' not in data:
        return jsonify({"error": "Missing email, password, or name"}), 400
    # 4. Corrected Logic: Check if email already exists
    if data['email'] in users:
        return jsonify({"error": "User with this email already exists"}), 400
    users[data['email']] = {
        "password": data['password'],
        "name": data['name'],
        "id": str(uuid.uuid4())
    }
    save_users(users)
    return jsonify({"message": "User created"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json 
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
@login_required
def getmetadata():
    user_name=session['user_name']
    try:
        files,error,statuscode=loadmetadata(user_name)
        #print(files,error,statuscode)
        if error and statuscode==404:
            return jsonify({"error": "User directory not found"}), 404
        if error and statuscode==500:
            return jsonify({"error": error}), 500
        return jsonify({
            "user": user_name,
            "files": files,
            "count": len(files)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# --- Upload Route ---
@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
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
        pages,chunks,error,statuscode=createchunks(user_id,filename,file_id,save_path,description)
        print(pages,chunks,error,statuscode)
        return jsonify({"status": "success","file_id": file_id,"filename": filename,
            "pages": len(pages),"chunks_added": len(chunks)}), 200
    except Exception as e:
        return jsonify({"error": str(e) }), 500

@socketio.on('start_stream')
def handle_stream(data):
    query = data.get("query", "")
    
    # Construct your input object
    input_obj = {
        "query": query,
        "filename": data.get("filename", "reactaa.pdf"),
        "messageId": data.get("messageId", "1234"),
        "user_id": data.get("user_id", "21a1ff59-f04b-450e-bf46-322617dae796"),
        "user_name": data.get("user_name", "pranay"),
        "description": "this pdf is about react javascript framework"
    }
    print('input_obj',input_obj)
    print("-"*10)
    try:
        # Stream from the graph
        # for step in graph.stream(input_obj):
        #     for node, output in step.items():
        #         # Emit each node's output to the client
        #         # Use 'include_self=True' if you want the sender to receive it
        #         print("-"*10)
        #         actual_value = next(iter(output.values()))
        #         print("node", node)
        #         print('actual_value',actual_value)
        #         emit('chunks', {
        #             "node": node,
        #             "output": actual_value,
        #             "processCompleted": False
        #         })
        #         print('emited node',node)
        #         # time.sleep(5)
        
        # 
        with open('final_state.json', 'r') as f:
            json_data = json.load(f)
        for index, dictionary in enumerate(json_data):
            # print(f"Item {index}: {dictionary}")
            emit('chunks', dictionary)
            
        emit('response_end',{"processCompleted":True})
    except Exception as e:
        emit('chunks', {'msg': str(e)})
    

if __name__ == "__main__":
    socketio.run(app, debug=True,port=5000)