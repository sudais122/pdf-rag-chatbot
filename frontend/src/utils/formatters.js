// Small, dependency-free formatting helpers used across the app.

/** Maximum upload size, in megabytes. Change this one number to adjust the limit everywhere. */
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Format a byte count as a human-readable size, e.g. 2500000 -> "2.4 MB". */
export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

/** Format a Date (or ISO string) as a short local time, e.g. "2:41 PM". */
export function formatTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Validate a File before upload. Returns an error message, or null if valid. */
export function validateFile(file) {
  if (!file) return 'No file selected.';
  const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
  if (!isPdf) return 'Please upload a PDF file.';
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `This PDF is larger than ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

/** Generate a short unique-enough id for client-side list keys. */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Very small formatter that turns plain text with blank-line paragraphs
 * and "- " / "* " bullet lines into an array of block descriptors, so
 * ChatMessage can render paragraphs and lists without a Markdown dependency.
 */
export function parseSimpleBlocks(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const blocks = [];
  let currentList = null;
  let currentPara = [];

  const flushPara = () => {
    if (currentPara.length) {
      blocks.push({ type: 'p', content: currentPara.join(' ').trim() });
      currentPara = [];
    }
  };
  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushPara();
      if (!currentList) currentList = { type: 'ul', items: [] };
      currentList.items.push(line.replace(/^[-*]\s+/, ''));
    } else {
      flushList();
      currentPara.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}
