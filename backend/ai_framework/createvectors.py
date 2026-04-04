import uuid

import fitz  # PyMuPDF
from ai_framework.nodes import chroma_client,google_ef

chroma_client = chroma_client
google_ef = google_ef


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

def createchunks(user_id,filename,file_id,save_path,description):
    print(filename)
    try:
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
        return pages,chunks,None,None
    except Exception as e:
        print(e)
        return None,None,str(e),500


