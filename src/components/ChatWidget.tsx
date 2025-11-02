import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { generateAIResponse } from '../lib/aiService';
import { getOrCreateChatSession, saveChatMessage, getChatHistory, ChatMessage } from '../lib/chatService';
import { populateSchoolData } from '../lib/schoolData';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const initializeChat = async () => {
    try {
      await populateSchoolData();

      const sid = await getOrCreateChatSession();
      setSessionId(sid);

      const history = await getChatHistory(sid);

      if (history.length === 0) {
        const welcomeMessage: ChatMessage = {
          message: "Hello! 👋 Welcome to The Aaryans Primary School. I'm here to help answer your questions about admissions, facilities, activities, teachers, and more. How can I assist you today?",
          role: 'assistant',
          created_at: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(history);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setMessages([
        {
          message: "Hello! I'm here to help answer your questions about The Aaryans Primary School. How can I assist you?",
          role: 'assistant',
          created_at: new Date().toISOString()
        }
      ]);
      setIsInitialized(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
   
    const newUserMessage: ChatMessage = {
      message: userMessage,
      role: 'user',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      await saveChatMessage(sessionId, userMessage, 'user');

      const aiResponse = await generateAIResponse(userMessage);

      const assistantMessage: ChatMessage = {
        message: aiResponse.response,
        role: 'assistant',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveChatMessage(sessionId, aiResponse.response, 'assistant');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        message: "I apologize, but I'm having trouble right now. Please try again or contact us at +1 (555) 123-4567.",
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What are the admission requirements?",
    "What are your school timings?",
    "Tell me about your facilities",
    "How can I contact the school?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 transform flex items-center gap-2 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
            Chat with us
          </span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[380px] h-[600px] flex flex-col animate-slideUp overflow-hidden border-2 border-orange-100">
          <div className="bg-gradient-to-r from-[#0f2943] to-[#1a3a5a] text-white p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">The Aaryans</h3>
                <p className="text-xs text-white/70">Ask us anything!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-2 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-md border border-gray-100'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-semibold text-orange-500">Assistant</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                  <span className={`text-xs mt-1 block ${
                    msg.role === 'user' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && messages[0].role === 'assistant' && (
              <div className="space-y-2 animate-fadeIn">
                <p className="text-xs text-gray-500 font-semibold">Quick questions:</p>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl px-3 py-2 text-sm text-gray-700 transition-all hover:scale-105 transform"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-all hover:scale-110 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Send message"
              >
                <Send className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
}
