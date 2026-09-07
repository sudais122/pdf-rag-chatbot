import { useCallback, useState } from 'react';
import { askQuestion } from '../services/api.js';
import { generateId } from '../utils/formatters.js';

/**
 * Owns the conversation: messages, the input box, and the
 * request lifecycle for asking a question.
 */
export function useChat(documentId) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (rawText) => {
      const text = (rawText ?? input).trim();
      if (!text || isLoading) return;

      const userMessage = {
        id: generateId('msg'),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const result = await askQuestion(text, documentId);
        const assistantMessage = {
          id: generateId('msg'),
          role: 'assistant',
          content: result.answer,
          sources: result.sources || [],
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage = {
          id: generateId('msg'),
          role: 'assistant',
          content: "We couldn't get an answer. Please try again.",
          isError: true,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, documentId]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
  }, []);

  return { messages, input, setInput, isLoading, sendMessage, resetChat };
}
