import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorMessage({ title = 'Something went wrong.', body, onRetry }) {
  return (
    <div className="processing" role="alert" style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--bad-tint)',
          color: 'var(--bad)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px'
        }}
      >
        <AlertTriangle size={17} />
      </div>
      <div className="processing-title" style={{ marginBottom: 4 }}>
        {title}
      </div>
      {body && <div className="dropzone-hint" style={{ marginBottom: 14 }}>{body}</div>}
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry} style={{ margin: '0 auto' }}>
          <RotateCcw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
