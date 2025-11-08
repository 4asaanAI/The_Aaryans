import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, Loader2, Database, Trash2, AlertTriangle } from 'lucide-react';
import { sendQueryToN8N } from '../../lib/n8nService';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const STORAGE_KEY = 'dashboard_chat_messages';
const WELCOME =
  'Hello! I can help you query the database using natural language. Ask me anything about students, courses, grades, attendance, or any other data in the system.';

export function DashboardChatbot() {
  const { profile, session } = useAuth(); // assumes your AuthContext provides these
  const isLoggedIn = !!profile;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Restore history
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Array<Omit<ChatMessage, 'timestamp'> & { timestamp: string }>;
        const withDates: ChatMessage[] = parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
        setMessages(withDates.length ? withDates : [makeAssistant(WELCOME)]);
      } catch {
        setMessages([makeAssistant(WELCOME)]);
      }
    } else {
      setMessages([makeAssistant(WELCOME)]);
    }
  }, []);

  // Persist history
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Close any open request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const makeAssistant = (content: string): ChatMessage => ({
    id: crypto.randomUUID(),
    role: 'assistant',
    content,
    timestamp: new Date(),
  });

  const makeSystem = (content: string): ChatMessage => ({
    id: crypto.randomUUID(),
    role: 'system',
    content,
    timestamp: new Date(),
  });

  const disabledReason = useMemo(() => {
    if (!isLoggedIn) return 'Login required to use the assistant';
    if (!inputMessage.trim()) return 'Type a message';
    if (isLoading) return 'Waiting for n8n';
    return null;
  }, [isLoggedIn, inputMessage, isLoading]);

  const handleSendMessage = async () => {
    if (disabledReason) return;

    setErrorBanner(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Optional: include metadata for the n8n flow
    const meta = {
      userId: profile?.id ?? null,
      email: profile?.email ?? null,
      ts: new Date().toISOString(),
      // pass a conversation id so n8n can keep context if needed
      conversationId: getConversationId(),
      // you could also pass a bearer from your auth if your proxy expects it
      authToken: session?.access_token ?? null,
    };

    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const result = await sendQueryToN8N(
        JSON.stringify({
          message: userMessage.content,
          meta,
        })
      );

      if (!result.success) {
        setMessages(prev => [
          ...prev,
          makeAssistant(
            result.response || 'I encountered an error processing your request. Please try again.'
          ),
        ]);
        if (result.error) setErrorBanner(result.error);
        return;
      }

      setMessages(prev => [...prev, makeAssistant(result.response)]);
    } catch (err: any) {
      const msg =
        typeof err?.message === 'string'
          ? err.message
          : 'Network error. Please check your connection and try again.';
      setMessages(prev => [...prev, makeAssistant(msg)]);
      setErrorBanner(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const welcome = makeAssistant(WELCOME);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([welcome]));
    setMessages([welcome]);
    setErrorBanner(null);
  };

  // Hide completely if not logged in (requirement: chatbot only when user is logged inside dashboard)
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
          aria-label="Open SQL assistant"
        >
          <Database className="w-6 h-6 text-white" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">SQL Assistant</h3>
                <p className="text-blue-100 text-xs">Query database in natural language</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorBanner && (
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 border-b border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorBanner}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : message.role === 'system'
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear chat
              </button>
              <p className="text-[10px] text-gray-400">
                Logged in as <span className="font-medium">{profile?.email ?? 'user'}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about students, courses, grades..."
                disabled={!!disabledReason}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!!disabledReason}
                title={disabledReason ?? undefined}
                className="px-4 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// simple conversation id persisted per session
function getConversationId(): string {
  const KEY = 'dashboard_chat_conversation_id';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}
