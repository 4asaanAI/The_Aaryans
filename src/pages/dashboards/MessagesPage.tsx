import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Search, Send, MoreVertical, Phone, Video, Check, CheckCheck } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  hasMessages: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
}

export function MessagesPage() {
  const { profile } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageSubscription = useRef<any>(null);

  useEffect(() => {
    if (profile) {
      fetchContacts();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
      markMessagesAsRead(selectedContact.id);
      subscribeToMessages(selectedContact.id);
    }

    return () => {
      if (messageSubscription.current) {
        messageSubscription.current.unsubscribe();
      }
    };
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const subscribeToMessages = (contactId: string) => {
    if (messageSubscription.current) {
      messageSubscription.current.unsubscribe();
    }

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${profile?.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${profile?.id}))`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);

            if (newMsg.receiver_id === profile?.id) {
              markMessagesAsRead(contactId);
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? (payload.new as Message) : msg
              )
            );
          }

          fetchContacts();
        }
      )
      .subscribe();

    messageSubscription.current = channel;
  };

  const fetchContacts = async () => {
    if (!profile) return;

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .neq('id', profile.id)
        .order('full_name');

      if (error) throw error;

      const { data: allMessages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      const contactsList: Contact[] = (profiles || []).map((user) => {
        const userMessages = (allMessages || []).filter(
          (msg) =>
            (msg.sender_id === profile.id && msg.receiver_id === user.id) ||
            (msg.sender_id === user.id && msg.receiver_id === profile.id)
        );

        const lastMsg = userMessages[0];
        const unreadCount = userMessages.filter(
          (msg) => msg.receiver_id === profile.id && !msg.is_read
        ).length;

        return {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role,
          lastMessage: lastMsg?.content,
          lastMessageTime: lastMsg ? new Date(lastMsg.created_at) : undefined,
          unreadCount,
          hasMessages: userMessages.length > 0
        };
      });

      const withMessages = contactsList
        .filter((c) => c.hasMessages)
        .sort((a, b) => {
          const timeA = a.lastMessageTime?.getTime() || 0;
          const timeB = b.lastMessageTime?.getTime() || 0;
          return timeB - timeA;
        });

      const withoutMessages = contactsList
        .filter((c) => !c.hasMessages)
        .sort((a, b) => a.name.localeCompare(b.name));

      setContacts([...withMessages, ...withoutMessages]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchMessages = async (contactId: string) => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${profile.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${profile.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (contactId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('receiver_id', profile.id)
        .eq('sender_id', contactId)
        .eq('is_read', false);

      if (error) throw error;

      fetchContacts();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !profile) return;

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: profile.id,
        receiver_id: selectedContact.id,
        content: newMessage.trim(),
        is_read: false
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else if (hours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="w-full md:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No contacts found
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-blue-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {contact.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-semibold">
                            {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold truncate ${
                            contact.unreadCount > 0
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {contact.name}
                        </h3>
                        {contact.lastMessageTime && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {formatTime(contact.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm truncate ${
                            contact.unreadCount > 0
                              ? 'text-gray-900 dark:text-white font-medium'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {contact.lastMessage || 'Start a conversation'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedContact ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a contact to start messaging
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {selectedContact.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {selectedContact.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isSent = message.sender_id === profile?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isSent
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <p
                                className={`text-xs ${
                                  isSent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                {new Date(message.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {isSent && (
                                <span className="text-blue-100">
                                  {message.is_read ? (
                                    <CheckCheck className="h-4 w-4" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
