// Simulated backend used when MOCK_MODE is on (see api.js).
// Nothing here makes a network request — it only fakes timing and
// realistic-looking responses so the UI can be built and demoed
// before the real PDF RAG backend exists.

import { generateId } from '../utils/formatters.js';

const mockDocuments = new Map();

const PROCESSING_STEPS = ['uploaded', 'extracted', 'chunked', 'embedded', 'indexed'];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockUploadPdf(file, onProgress) {
  // Simulate an upload progress bar.
  for (let pct = 0; pct <= 100; pct += 20) {
    onProgress?.(pct);
    await wait(120);
  }

  const documentId = generateId('doc');
  mockDocuments.set(documentId, {
    documentId,
    filename: file.name,
    size: file.size,
    pages: Math.max(1, Math.round(file.size / 45000)),
    status: 'processing',
    stepIndex: 0,
    createdAt: Date.now()
  });

  return {
    success: true,
    documentId,
    filename: file.name,
    status: 'processing'
  };
}

export async function mockGetDocumentStatus(documentId) {
  const doc = mockDocuments.get(documentId);
  if (!doc) {
    return { documentId, status: 'failed', progress: 0 };
  }

  // Advance one processing step each time this is polled.
  if (doc.status === 'processing') {
    doc.stepIndex += 1;
    if (doc.stepIndex >= PROCESSING_STEPS.length) {
      doc.status = 'ready';
    }
  }

  const progress = Math.min(100, Math.round((doc.stepIndex / PROCESSING_STEPS.length) * 100));

  return {
    documentId,
    status: doc.status,
    progress,
    stepIndex: doc.stepIndex,
    pages: doc.pages,
    size: doc.size,
    filename: doc.filename
  };
}

const CANNED_ANSWERS = [
  {
    answer:
      "According to the document, appointments can be cancelled up to 24 hours before the scheduled time without a fee. Cancellations made after that window may be charged the standard visit rate.",
    sources: [
      {
        page: 3,
        title: 'Appointment Cancellation',
        content:
          'Patients can cancel their appointment up to 24 hours before the scheduled appointment time without incurring a fee.'
      }
    ]
  },
  {
    answer:
      "The document outlines three requirements for new members: a completed intake form, a government-issued ID, and proof of address dated within the last 90 days.",
    sources: [
      {
        page: 1,
        title: 'Membership Requirements',
        content:
          'New members must submit a completed intake form, a valid government-issued ID, and proof of address no older than 90 days.'
      },
      {
        page: 2,
        title: 'Verification Process',
        content: 'Documents are verified by staff within two business days of submission.'
      }
    ]
  },
  {
    answer:
      "Refunds are processed within 5-7 business days once a return is received. The document notes that refunds are issued to the original payment method only.",
    sources: [
      {
        page: 4,
        title: 'Refund Policy',
        content: 'Refunds are issued to the original method of payment within 5 to 7 business days of receipt.'
      }
    ]
  }
];

export async function mockAskQuestion(question, documentId) {
  await wait(900 + Math.random() * 700);

  if (!question || !question.trim()) {
    throw new Error('Empty question.');
  }

  const picked = CANNED_ANSWERS[Math.floor(Math.random() * CANNED_ANSWERS.length)];
  return {
    answer: picked.answer,
    sources: picked.sources
  };
}
