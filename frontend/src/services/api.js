// All backend communication goes through this file. Components never
// call fetch() directly — they call the functions exported here.
//
// Set VITE_API_URL in your .env file to point at your real backend
// (see .env.example). Uses the browser fetch API only — no axios.

import { mockUploadPdf, mockGetDocumentStatus, mockAskQuestion } from './mockApi.js';

// --------------------------------------------------------------
// Flip this to false once your backend is running and reachable
// at VITE_API_URL. See the README for details.
// --------------------------------------------------------------
export const MOCK_MODE = true;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

/** Ask a question about a processed document. Returns { answer, sources }. */
export async function askQuestion(question, documentId) {
  if (MOCK_MODE) {
    return mockAskQuestion(question, documentId);
  }
  return request('/api/chat/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, documentId })
  });
}

export { ApiError };
