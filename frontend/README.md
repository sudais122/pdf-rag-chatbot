# Marginalia — PDF RAG Chatbot Frontend

A React + JSX frontend for a PDF question-answering chatbot. Upload a PDF,
wait for it to process, then ask questions and get answers grounded in the
document, with the source passage shown alongside each answer.

Plain CSS only (no Tailwind), and the browser `fetch` API for all real
network calls (no axios). Ships with a mock mode so the whole flow —
upload, processing, chat, sources — works before any backend exists.

## 1. Install

```bash
npm install
```

## 2. Run

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The app starts
in **mock mode**, so you can try the full flow immediately with no backend.

## 3. Where the backend URL goes

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then set your backend's address:

```
VITE_API_URL=https://your-backend.example.com
```

This value is read in `src/services/api.js` and used as the base URL for
every request. Nowhere else in the app is a URL hardcoded.

## 4. Switching from mock mode to your real backend

Open `src/services/api.js` and change one line:

```javascript
export const MOCK_MODE = true;   // ← change this to false
```

Once `MOCK_MODE` is `false`, the app calls your real endpoints:

| Purpose            | Method | Path                        |
|--------------------|--------|------------------------------|
| Upload a PDF        | POST   | `/api/pdf/upload`            |
| Poll document status| GET    | `/api/pdf/:documentId/status`|
| Ask a question       | POST   | `/api/chat/ask`              |

Expected request/response shapes are documented as comments in
`src/services/api.js` and `src/services/mockApi.js` (the mock mirrors the
real contract exactly, so switching back and forth is safe).

All mock logic lives in `src/services/mockApi.js`, kept fully separate
from the real fetch calls in `src/services/api.js` — deleting the mock
file only requires removing the two mock imports at the top of `api.js`.

## Project structure

```
src/
├── components/       Reusable UI pieces (upload, chat bubbles, sources, dialogs…)
├── pages/
│   └── ChatPage.jsx  Wires the sidebar + chat window + hooks together
├── services/
│   ├── api.js        Single point of contact with the backend (fetch-based)
│   └── mockApi.js     Simulated backend responses for development
├── hooks/
│   ├── useDocument.js Upload + processing status lifecycle
│   └── useChat.js      Messages, input, and question submission
├── utils/
│   └── formatters.js  File size/timestamp formatting, validation, id generation
├── App.jsx
├── main.jsx
└── index.css          All styling — plain CSS, no framework
```

## Notes

- Max upload size is 10 MB, controlled by `MAX_FILE_SIZE_MB` in
  `src/utils/formatters.js`.
- The layout collapses the document panel into a slide-in drawer below
  860px width (see the hamburger menu in the header).
- Reduced-motion is respected for the typing indicator and spinners.
