import { supabase } from './supabase';

export interface ChatMessage {
  id?: string;
  session_id?: string;
  message: string;
  role: 'user' | 'assistant';
  created_at?: string;
}

export interface ChatSession {
  id?: string;
  session_id: string;
  created_at?: string;
  updated_at?: string;
}

export async function getOrCreateChatSession(): Promise<string> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const { data: newSession, error } = await supabase
    .from('chat_sessions')
    .insert([{ session_id: sessionId }])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }

  return newSession!.id as string;
}

export async function saveChatMessage(
  sessionId: string,
  message: string,
  role: 'user' | 'assistant'
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([
      {
        session_id: sessionId,
        message,
        role
      }
    ])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }

  return data;
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }

  return data || [];
}
