import { BookMarked, Menu, PlusCircle } from 'lucide-react';
import { MOCK_MODE } from '../services/api.js';

export default function Header({ onNewChat, onToggleSidebar }) {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          className="btn btn-ghost btn-icon-only menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle document panel"
        >
          <Menu size={19} />
        </button>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <BookMarked size={17} />
          </div>
          <span className="brand-name">Marginalia</span>
        </div>
        <span className="brand-tagline">Ask your PDF anything</span>
        {MOCK_MODE && <span className="mock-badge">mock mode</span>}
      </div>

      <div className="header-actions">
        <button className="btn btn-secondary" onClick={onNewChat}>
          <PlusCircle size={15} />
          New chat
        </button>
      </div>
    </header>
  );
}
