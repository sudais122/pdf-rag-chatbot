import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage.jsx';
import ChatInput from './ChatInput.jsx';
import LoadingMessage from './LoadingMessage.jsx';
import EmptyState from './EmptyState.jsx';

export default function ChatWindow({
  documentStatus,
  messages,
  input,
  onInputChange,
  onSubmit,
  isLoading
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const canChat = documentStatus === 'ready';
  const showEmptyState = messages.length === 0;

  let emptyVariant = 'no-document';
  if (documentStatus === 'processing' || documentStatus === 'uploading') emptyVariant = 'processing';
  if (documentStatus === 'ready') emptyVariant = 'ready';

  return (
    <div className="chat-column">
      <div className="chat-scroll" ref={scrollRef}>
        {showEmptyState ? (
          <EmptyState variant={emptyVariant} />
        ) : (
          <div className="chat-inner">
            {messages.map((m) => (
              <ChatMessage key={m.id} {...m} />
            ))}
            {isLoading && <LoadingMessage />}
          </div>
        )}
      </div>

      <ChatInput
        value={input}
        onChange={onInputChange}
        onSubmit={onSubmit}
        disabled={!canChat || isLoading}
        placeholder={canChat ? undefined : 'Upload a PDF to start asking questions…'}
      />
    </div>
  );
}
