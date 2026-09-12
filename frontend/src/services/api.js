// All backend communication goes through this file. Components never
// call fetch() directly — they call the functions exported here.
//
// Set VITE_API_URL in your .env file to point at your real backend
// (see .env.example). Uses the browser fetch API only — no axios.

import { mockUploadPdf, mockGetDocumentStatus, mockAskQuestion } from './mockApi.js';

// --------------------------------------------------------------
// Flip this back to true if you ever want to demo the UI without
// the Node/Python backend running.
// --------------------------------------------------------------
export const MOCK_MODE = false;

// Left empty by default so requests go to a relative path (e.g. /api/chat),
// which Vite's dev server proxy (see vite.config.js) forwards to the Node
// backend same-origin — this avoids CORS entirely during development.
// Set VITE_API_URL only for production builds, where there's no Vite dev
// proxy and the frontend needs the backend's real, absolute URL.
const API_URL = import.meta.env.VITE_API_URL || '';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch (err) {
    throw new ApiError('Unable to connect to the server. Please check your connection and try again.', 0);
  }

  if (!response.ok) {
    const body = await parseJsonSafely(response);
    throw new ApiError(body?.message || `Request failed (${response.status}).`, response.status);
  }

  return parseJsonSafely(response);
}

/**
 * Upload a PDF file. Calls onProgress(percent) while the upload runs.
 * Returns { success, documentId, filename, status }.
 */
export async function uploadPdf(file, onProgress) {
  if (MOCK_MODE) {
    return mockUploadPdf(file, onProgress);
  }

  const formData = new FormData();
  formData.append('file', file);

  // fetch() doesn't expose upload progress directly; XHR is used here
  // only for the progress event, then wrapped to look like the fetch path.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/pdf/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new ApiError(data?.message || 'Upload failed. Please try again.', xhr.status));
        }
      } catch {
        reject(new ApiError('Upload failed. Please try again.', xhr.status));
      }
    };

    xhr.onerror = () => reject(new ApiError('Unable to connect to the server. Please check your connection and try again.', 0));

    xhr.send(formData);
  });
}

/** Poll processing status for a document. Returns { documentId, status, progress }. */
export async function getDocumentStatus(documentId) {
  if (MOCK_MODE) {
    return mockGetDocumentStatus(documentId);
  }
  return request(`/api/pdf/${documentId}/status`, { method: 'GET' });
}

/**
 * Ask a question about the processed document. Returns whatever the
 * Python RAG API's /ask endpoint sends back, proxied through Node's
 * /api/chat route unchanged. documentId is accepted for future use
 * (e.g. once the backend supports multiple documents) but the current
 * /api/chat route ignores it — only { question } is sent.
 *
 * If your Python /ask response isn't shaped like { answer, sources },
 * update ChatMessage.jsx / SourceCard.jsx to match the real shape.
 */
export async function askQuestion(question, documentId) {
  if (MOCK_MODE) {
    return mockAskQuestion(question, documentId);
  }
  return request('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
}

export { ApiError };