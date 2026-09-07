from pypdf import PdfReader

reader = PdfReader("../documents/example.pdf")

text = ""

for page in reader.pages:
    text += page.extract_text() + "\n"

chunks = text.split("\n\n")

for i, chunk in enumerate(chunks):
    print(f"\n--- Chunk {i} ---")
    print(chunk)