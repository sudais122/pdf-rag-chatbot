import { AlertTriangle, CheckCircle2, FileText, Loader2, X } from 'lucide-react';
import { formatFileSize } from '../utils/formatters.js';

const STATUS_CONFIG = {
  ready: { label: 'Ready', icon: CheckCircle2, className: 'ready' },
  processing: { label: 'Processing', icon: Loader2, className: 'processing' },
  uploading: { label: 'Uploading', icon: Loader2, className: 'processing' },
  failed: { label: 'Failed', icon: AlertTriangle, className: 'failed' }
};

export default function PdfCard({ filename, size, pages, status, onRemove }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.processing;
  const StatusIcon = config.icon;

  return (
    <div className="pdf-card">
      <div className="pdf-card-top">
        <div className="pdf-card-icon">
          <FileText size={17} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="pdf-card-name">{filename}</div>
          <div className="pdf-card-meta">{formatFileSize(size)}</div>
        </div>
        <button
          className="btn btn-ghost btn-icon-only pdf-card-remove"
          onClick={onRemove}
          aria-label="Remove document"
        >
          <X size={15} />
        </button>
      </div>

      <div className={`pdf-card-status ${config.className}`}>
        <StatusIcon size={13} className={status === 'processing' || status === 'uploading' ? 'spin-icon' : ''} />
        {config.label}
      </div>

      {status === 'ready' && (
        <div className="pdf-card-details">
          <div>
            <div className="pdf-card-detail-label">Pages</div>
            <div className="pdf-card-detail-value">{pages ?? '—'}</div>
          </div>
          <div>
            <div className="pdf-card-detail-label">Size</div>
            <div className="pdf-card-detail-value">{formatFileSize(size)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
