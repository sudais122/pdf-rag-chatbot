import { useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ChatInput({ value, onChange, onSubmit, disabled, placeholder }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [disabled]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSubmit();
    }
  };

  return (
    <div className="chat-input-bar">
      <div className="chat-input-inner">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder || 'Ask something about this PDF…'}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Ask a question about the document"
        />
        <button
          className="chat-send-btn"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Send question"
        >
          <ArrowUp size={16} />
        </button>
      </div>
      <div className="chat-input-hint">Enter to send · Shift + Enter for a new line</div>
    </div>
  );
}
