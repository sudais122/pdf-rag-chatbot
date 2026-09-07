import { Bot } from 'lucide-react';

export default function LoadingMessage() {
  return (
    <div className="message-row from-assistant" aria-live="polite">
      <div className="message-avatar" aria-hidden="true">
        <Bot size={14} />
      </div>
      <div className="message-col">
        <div className="typing-row">
          <span className="sr-only">AI is thinking</span>
          <span className="typing-dot" aria-hidden="true" />
          <span className="typing-dot" aria-hidden="true" />
          <span className="typing-dot" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
