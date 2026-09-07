import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function SourceCard({ title, page, content }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="source-card"
      onClick={() => setExpanded((v) => !v)}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
    >
      <div className="source-card-head">
        <span className="source-card-title">
          <FileText size={12} />
          {title}
        </span>
        <span className="source-card-page">
          Page {page}
          {expanded ? <ChevronUp size={12} style={{ marginLeft: 4, verticalAlign: -2 }} /> : <ChevronDown size={12} style={{ marginLeft: 4, verticalAlign: -2 }} />}
        </span>
      </div>
      {expanded && content && <div className="source-card-excerpt">&ldquo;{content}&rdquo;</div>}
    </div>
  );
}
