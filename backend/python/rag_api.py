import io
import uuid

import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

app = FastAPI()

# Loaded once at startup — reused for every document and every question.
# all-MiniLM-L6-v2 is small, fast, and runs fine on CPU.
model = SentenceTransformer("all-MiniLM-L6-v2")

# In-memory store. Restarting the server clears everything — swap this
# for a real database/vector store when you move past local development.
documents = {}

# The frontend's /ask flow (via Node's /api/chat) does not send a
# documentId today — it only sends { question }. So "ask" always
# answers against whichever document was uploaded most recently.
current_document_id = None

CHUNK_SIZE = 800       # characters per chunk
CHUNK_OVERLAP = 150    # characters of overlap between consecutive chunks
TOP_K = 3              # how many chunks to retrieve per question


class Question(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "Python RAG API is running"
    }


def extract_pages(pdf_bytes: bytes):
    """Returns a list of (page_number, text) tuples, 1-indexed."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages.append((i + 1, text))
    return pages


def chunk_pages(pages):
    """Splits each page's text into overlapping chunks, keeping the
    source page number attached to every chunk."""
    chunks = []
    for page_number, text in pages:
        text = text.strip()
        if not text:
            continue
        start = 0
        while start < len(text):
            end = start + CHUNK_SIZE
            piece = text[start:end].strip()
            if piece:
                chunks.append({"page": page_number, "text": piece})
            start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global current_document_id

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    pdf_bytes = await file.read()
    doc_id = str(uuid.uuid4())

    try:
        pages = extract_pages(pdf_bytes)
        chunks = chunk_pages(pages)

        if not chunks:
            documents[doc_id] = {"status": "failed", "progress": 0}
            raise HTTPException(status_code=422, detail="Couldn't extract any text from this PDF")

        chunk_texts = [c["text"] for c in chunks]
        embeddings = model.encode(chunk_texts, convert_to_numpy=True, normalize_embeddings=True)

        documents[doc_id] = {
            "status": "ready",
            "progress": 100,
            "filename": file.filename,
            "pages": len(pages),
            "size": len(pdf_bytes),
            "chunks": chunks,
            "embeddings": embeddings,
        }
        current_document_id = doc_id

    except HTTPException:
        raise
    except Exception:
        documents[doc_id] = {"status": "failed", "progress": 0}
        raise HTTPException(status_code=500, detail="Failed to process this PDF")

    return {
        "success": True,
        "documentId": doc_id,
        "filename": file.filename,
        "status": "ready"
    }


@app.get("/status/{document_id}")
def status(document_id: str):
    doc = documents.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "documentId": document_id,
        "status": doc["status"],
        "progress": doc.get("progress", 0),
        "pages": doc.get("pages"),
        "size": doc.get("size"),
    }


@app.post("/ask")
def ask_question(data: Question):
    question = data.question

    if not current_document_id or current_document_id not in documents:
        raise HTTPException(status_code=400, detail="No document has been uploaded yet")

    doc = documents[current_document_id]
    if doc["status"] != "ready":
        raise HTTPException(status_code=400, detail="Document is not ready yet")

    question_embedding = model.encode([question], convert_to_numpy=True, normalize_embeddings=True)[0]

    # Cosine similarity: embeddings are already normalized, so this is
    # just a dot product.
    scores = doc["embeddings"] @ question_embedding
    top_indices = np.argsort(scores)[::-1][:TOP_K]

    top_chunks = [doc["chunks"][i] for i in top_indices]

    # Extractive answer: no generative model here, so the "answer" is
    # the best-matching passage itself. Swap this for a call to a local
    # or hosted LLM later if you want a synthesized answer instead.
    answer = top_chunks[0]["text"] if top_chunks else "I couldn't find anything relevant in this document."

    sources = [
        {
            "page": chunk["page"],
            "title": f"Page {chunk['page']}",
            "content": chunk["text"][:300]
        }
        for chunk in top_chunks
    ]

    return {
        "question": question,
        "answer": answer,
        "sources": sources
    }