const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const upload = multer(); // memory storage — files are proxied straight through, never written to disk

const PYTHON_API_URL = "http://127.0.0.1:8000";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Node.js backend is running"
    });
});

// ---------------------------------------------------------------
// Chat — forwards a question to the Python RAG API
// ---------------------------------------------------------------
app.post("/api/chat", async (req, res) => {
    try {
        const question = req.body.question;

        const response = await fetch(`${PYTHON_API_URL}/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: question
            })
        });

        const data = await response.json();

        // IMPORTANT: forward Python's real status code. Without this,
        // res.json(data) always answers 200 even when Python returned
        // a 404/500, and the frontend has no way to tell the request failed.
        res.status(response.status).json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Could not connect to Python RAG API"
        });
    }
});

// ---------------------------------------------------------------
// Upload — receives the PDF from the frontend and forwards it
// to the Python RAG API for extraction/chunking/embedding
// ---------------------------------------------------------------
app.post("/api/pdf/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file was uploaded" });
        }

        const form = new FormData();
        form.append("file", new Blob([req.file.buffer]), req.file.originalname);

        const response = await fetch(`${PYTHON_API_URL}/upload`, {
            method: "POST",
            body: form
        });

        const data = await response.json();

        // Same fix here — a 404 from Python (e.g. route doesn't exist yet)
        // must reach the frontend as a 404, not a fake 200.
        res.status(response.status).json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Could not connect to Python RAG API"
        });
    }
});

// ---------------------------------------------------------------
// Status — checks processing progress for a given document
// ---------------------------------------------------------------
app.get("/api/pdf/:documentId/status", async (req, res) => {
    try {
        const { documentId } = req.params;

        const response = await fetch(`${PYTHON_API_URL}/status/${documentId}`);

        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Could not connect to Python RAG API"
        });
    }
});

app.listen(5050, () => {
    console.log("Node server running on http://localhost:5050");
});