import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string, profileData: Partial<Profile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          full_name: profileData.full_name || '',
          role: profileData.role || 'student',
          sub_role: profileData.sub_role,
          department_id: profileData.department_id,
          phone: profileData.phone,
          status: 'active'
        });

      if (profileError) {
        return { error: profileError };
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!profile) return false;

    if (profile.role === 'admin') {
      if (profile.sub_role === 'super_admin') return true;

      if (profile.sub_role === 'academic_admin') {
        return ['courses', 'enrollments', 'departments'].includes(resource);
      }

      if (profile.sub_role === 'finance_admin') {
        return resource === 'enrollments' && ['view', 'approve'].includes(action);
      }

      if (profile.sub_role === 'department_admin') {
        return ['courses', 'enrollments'].includes(resource) && action !== 'delete';
      }
    }

    if (profile.role === 'professor') {
      if (profile.sub_role === 'head_of_department') {
        return ['courses', 'enrollments', 'announcements'].includes(resource);
      }

      if (profile.sub_role === 'senior_professor') {
        return ['courses', 'enrollments', 'announcements'].includes(resource) && action !== 'delete';
      }

      if (profile.sub_role === 'assistant_professor') {
        return resource === 'courses' && ['view', 'edit'].includes(action);
      }

      if (profile.sub_role === 'guest_lecturer') {
        return resource === 'courses' && action === 'view';
      }
    }

    if (profile.role === 'student') {
      return resource === 'enrollments' && ['view', 'create'].includes(action);
    }

    return false;
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
