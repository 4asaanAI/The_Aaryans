import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Database, Trash2 } from 'lucide-react';
import { sendQueryToN8N } from '../../lib/n8nService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string; // optional data URL or remote url for display
  imageName?: string; // optional filename
}

const STORAGE_KEY = 'dashboard_chat_messages';

export function DashboardChatbot() {
  const { profile, refreshProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedMessages = sessionStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading chat history:', error);
        initializeChat();
      }
    } else {
      initializeChat();
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatboxRef.current &&
        !chatboxRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        'Hi! I can fetch, summarize, and update data in your ERP. Ask a clear, specific question with names, classes, and dates when possible.\n\nExamples:\n• “Show absent students for Class 8 today.”\n• “Update Rahul Sharma’s phone to 98xxxxxxx.”\n• “List fees pending for Section B.”\n\nI’ll confirm before making any edits.',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]));
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImageFile) || isLoading) return;
    // Note: allow sending image-only messages too

    const currentLimit =
      profile?.message_limit !== undefined ? profile.message_limit : 100;
    if (currentLimit <= 0) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'You have reached your message limit. Please contact an administrator to increase your limit.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Create user message: combine text and image metadata for display
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content:
        inputMessage.trim() || (selectedImageFile ? '[Image attached]' : ''),
      timestamp: new Date(),
      image: selectedImagePreview ?? undefined,
      imageName: selectedImageFile?.name,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // If your sendQueryToN8N supports images, pass the file as the second argument
      // e.g. sendQueryToN8N(text: string, file?: File)
      // If it doesn't yet support files, update ../../lib/n8nService accordingly
      let result;
      if (selectedImageFile) {
        // Preferred: call sendQueryToN8N with file support
        // sendQueryToN8N should internally create a FormData and post to n8n endpoint
        result = await sendQueryToN8N(inputMessage.trim(), selectedImageFile);

        // Alternative fallback (if you want to do it here instead of n8nService):
        // const form = new FormData();
        // form.append('text', inputMessage.trim());
        // form.append('file', selectedImageFile);
        // const res = await fetch('/your-n8n-upload-endpoint', { method: 'POST', body: form });
        // result = await res.json();
      } else {
        result = await sendQueryToN8N(inputMessage.trim());
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result?.response ?? 'No response from server.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (profile?.id && currentLimit > 0) {
        await supabase
          .from('profiles')
          .update({ message_limit: currentLimit - 1 })
          .eq('id', profile.id);

        await refreshProfile();
      }
    } catch (error) {
      console.error('Error sending message to N8N:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Sorry—something went wrong while processing that request. Please try again, or refine your query.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // clear selected image after attempting send (successful or not)
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
      setSelectedImageFile(null);
      setSelectedImagePreview(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    initializeChat();
  };

  const onAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    // basic validation: only images, and size limit (e.g., 5MB)
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image size should be less than 5MB.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setSelectedImagePreview(previewUrl);
  };

  const handleRemoveSelectedImage = () => {
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
          aria-label="Open SQL chatbot"
        >
          <Database className="w-6 h-6 text-white" />
        </button>
      )}

      {isOpen && (
        <div
          ref={chatboxRef}
          className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Data Assistant</h3>
                <p className="text-blue-100 text-xs">
                  Query or update ERP data securely
                </p>
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
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
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>

                  {message.image && (
                    <div className="mt-2">
                      <img
                        src={message.image}
                        alt={message.imageName ?? 'attachment'}
                        className="rounded-md max-h-48 object-contain border border-gray-200 dark:border-gray-700"
                      />
                      {message.imageName && (
                        <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
                          {message.imageName}
                        </p>
                      )}
                    </div>
                  )}

                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-400 dark:text-gray-500'
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
                <div className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700 rounded-2xl px-5 py-3 shadow-md">
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
                    <span className="absolute w-10 h-10 border-2 border-blue-300 dark:border-blue-700 rounded-full animate-ping opacity-20" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Fetching data from the database...
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-400 animate-pulse">
                      Please wait a moment while I process your query.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
            <div className="flex gap-2 mb-2 items-center justify-between">
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear chat
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {profile?.message_limit !== undefined
                  ? profile.message_limit
                  : 100}{' '}
                msgs left
              </div>
            </div>

            {/* Hidden file input for image attach */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask something specific..."
                  disabled={
                    (profile?.message_limit !== undefined
                      ? profile.message_limit
                      : 100) <= 0
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                {/* Selected image preview in composer */}
                {selectedImagePreview && (
                  <div className="mt-2 flex items-start gap-2">
                    <img
                      src={selectedImagePreview}
                      alt={selectedImageFile?.name}
                      className="w-24 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                    />
                    <div className="flex-1">
                      <div className="text-xs text-gray-700 dark:text-gray-200">
                        {selectedImageFile?.name}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={handleRemoveSelectedImage}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onAttachClick}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Attach image"
                >
                  📎
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={
                    (!inputMessage.trim() && !selectedImageFile) ||
                    isLoading ||
                    (profile?.message_limit !== undefined
                      ? profile.message_limit
                      : 100) <= 0
                  }
                  className="px-4 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
