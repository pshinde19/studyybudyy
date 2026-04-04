@app.route('/api/chat', methods=['POST'])
@login_required
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
    prompt = ""
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