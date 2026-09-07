import { Bot, User } from 'lucide-react';
import { formatTimestamp, parseSimpleBlocks } from '../utils/formatters.js';
import SourceCard from './SourceCard.jsx';

function MessageBody({ text }) {
  const blocks = parseSimpleBlocks(text);
  if (!blocks.length) return <p>{text}</p>;

  return blocks.map((block, i) =>
    block.type === 'ul' ? (
      <ul key={i}>
        {block.items.map((item, j) => (
          <li key={j}>{item}</li>
        ))}
      </ul>
    ) : (
      <p key={i}>{block.content}</p>
    )
  );
}

export default function ChatMessage({ role, content, sources, isError, timestamp }) {
  const isUser = role === 'user';

  return (
    <div className={`message-row ${isUser ? 'from-user' : 'from-assistant'}`}>
      {!isUser && (
        <div className="message-avatar" aria-hidden="true">
          <Bot size={14} />
        </div>
      )}

      <div className="message-col">
        <div className={`message-bubble${isError ? ' is-error' : ''}`}>
          <MessageBody text={content} />
        </div>

        {!isUser && sources && sources.length > 0 && (
          <div className="sources-block">
            <div className="sources-label">Sources</div>
            {sources.map((source, i) => (
              <SourceCard key={i} title={source.title} page={source.page} content={source.content} />
            ))}
          </div>
        )}

        {timestamp && <span className="message-timestamp">{formatTimestamp(timestamp)}</span>}
      </div>

      {isUser && (
        <div className="message-avatar" style={{ background: 'var(--ink-soft)' }} aria-hidden="true">
          <User size={14} />
        </div>
      )}
    </div>
  );
}
