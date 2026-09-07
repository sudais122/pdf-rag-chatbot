import { Check, Circle, Loader2 } from 'lucide-react';

const STEPS = [
  'PDF uploaded',
  'Text extracted',
  'Document chunked',
  'Generating embeddings',
  'Creating vector index'
];

export default function ProcessingStatus({ stepIndex = 0 }) {
  const progress = Math.min(100, Math.round((stepIndex / STEPS.length) * 100));

  return (
    <div className="processing" role="status" aria-live="polite">
      <div className="processing-title">Processing document…</div>

      {STEPS.map((label, i) => {
        const isDone = i < stepIndex;
        const isActive = i === stepIndex;
        return (
          <div
            key={label}
            className={`processing-step${isDone ? ' is-done' : ''}${isActive ? ' is-active' : ''}`}
          >
            <span className="processing-step-icon">
              {isDone ? <Check size={14} /> : isActive ? <Loader2 size={14} /> : <Circle size={9} />}
            </span>
            {label}
          </div>
        );
      })}

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-label">
        <span>This may take a moment</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
}
