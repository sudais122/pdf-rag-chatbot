import { FileQuestion, Hourglass, Sparkles } from 'lucide-react';

const VARIANTS = {
  'no-document': {
    icon: FileQuestion,
    title: 'Ask your PDF anything',
    body: 'Upload a document on the left and ask questions about its content. Answers come with the exact passage they were based on.'
  },
  processing: {
    icon: Hourglass,
    title: 'Getting your document ready',
    body: 'Your document is being processed. This usually takes a few seconds.'
  },
  ready: {
    icon: Sparkles,
    title: 'Your document is ready',
    body: 'Ask your first question below — try starting with what the document is about.'
  }
};

export default function EmptyState({ variant = 'no-document' }) {
  const config = VARIANTS[variant] || VARIANTS['no-document'];
  const Icon = config.icon;

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={22} />
      </div>
      <div className="empty-state-title">{config.title}</div>
      <div className="empty-state-body">{config.body}</div>
    </div>
  );
}
