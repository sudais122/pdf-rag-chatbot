import { useState } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useDocument } from '../hooks/useDocument.js';
import { useChat } from '../hooks/useChat.js';

export default function ChatPage() {
  const doc = useDocument();
  const chat = useChat(doc.documentId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [confirmNewChatOpen, setConfirmNewChatOpen] = useState(false);

  const hasMessages = chat.messages.length > 0;

  const handleFileSelected = (file) => {
    doc.clearError();
    doc.upload(file);
    chat.resetChat();
  };

  const requestRemove = () => {
    if (hasMessages) {
      setConfirmRemoveOpen(true);
    } else {
      doc.remove();
    }
  };

  const confirmRemove = () => {
    doc.remove();
    chat.resetChat();
    setConfirmRemoveOpen(false);
  };

  const handleNewChat = () => {
    if (hasMessages) {
      setConfirmNewChatOpen(true);
    } else {
      chat.resetChat();
    }
  };

  return (
    <div className="app-shell">
      <Header onNewChat={handleNewChat} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="workspace">
        <Sidebar
          isOpen={sidebarOpen}
          documentStatus={doc.documentStatus}
          documentMeta={doc.documentMeta}
          processingStep={doc.processingStep}
          error={doc.error}
          onFileSelected={handleFileSelected}
          onRetry={doc.retry}
          onRemoveRequest={requestRemove}
        />

        <ChatWindow
          documentStatus={doc.documentStatus}
          messages={chat.messages}
          input={chat.input}
          onInputChange={chat.setInput}
          onSubmit={() => chat.sendMessage()}
          isLoading={chat.isLoading}
        />
      </div>

      <ConfirmDialog
        open={confirmRemoveOpen}
        title="Remove document?"
        body="Your current chat will no longer be connected to this PDF."
        confirmLabel="Remove"
        danger
        onConfirm={confirmRemove}
        onCancel={() => setConfirmRemoveOpen(false)}
      />

      <ConfirmDialog
        open={confirmNewChatOpen}
        title="Start a new chat?"
        body="This clears the current conversation. Your uploaded PDF stays connected."
        confirmLabel="Start new chat"
        onConfirm={() => {
          chat.resetChat();
          setConfirmNewChatOpen(false);
        }}
        onCancel={() => setConfirmNewChatOpen(false)}
      />
    </div>
  );
}
