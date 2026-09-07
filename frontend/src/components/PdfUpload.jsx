import { useRef, useState } from 'react';
import { AlertCircle, FileUp } from 'lucide-react';
import { MAX_FILE_SIZE_MB } from '../utils/formatters.js';

export default function PdfUpload({ onFileSelected, error, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (file) onFileSelected(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div>
      <div
        className={`dropzone${isDragging ? ' is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        aria-label="Upload a PDF by dragging it here or pressing enter to browse"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <div className="dropzone-icon">
          <FileUp size={18} />
        </div>
        <div className="dropzone-title">Upload your PDF</div>
        <div className="dropzone-hint">Drag &amp; drop, or browse</div>
        <div className="dropzone-hint">Up to {MAX_FILE_SIZE_MB} MB</div>
        <button
          type="button"
          className="dropzone-browse"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Choose a file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="PDF file input"
        />
      </div>

      {error && (
        <div className="field-error" role="alert">
          <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
