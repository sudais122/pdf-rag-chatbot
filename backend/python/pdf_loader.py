from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

reader = PdfReader("../documents/example.pdf")

text = ""

for page in reader.pages:
    text += page.extract_text() + "\n"

chunks = text.split("\n\n")

model = SentenceTransformer("all-MiniLM-L6-v2")

chunks_embeddings = model.encode(chunks)

query = input("Ask anything: ")

query_embedding = model.encode([query])

print("Number of chunks:", len(chunks))
print("Embedding size:", len(chunks_embeddings[0]))

score = cosine_similarity(query_embedding, chunks_embeddings)

top_k = 3

top_indices = score[0].argsort()[-top_k:][::-1]

retrieved_chunks = [chunks[i] for i in top_indices]

context = "\n\n".join(retrieved_chunks)

print("\n--- Retrieved Context ---")
print(context)

prompt = f"""
Answer the question using only the following context.

Context:
{context}

Question:
{query}
"""

print("\n--- Prompt ---")
print(prompt)