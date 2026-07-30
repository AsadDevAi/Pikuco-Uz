import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  bio: string;
  points: number;
  squadId: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
        }
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          set({ isLoading: true });
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'sinov-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
