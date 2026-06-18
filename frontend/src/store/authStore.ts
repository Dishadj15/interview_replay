import { create } from "zustand";
import { getMe, login, signup } from "../api/interviews";
import type { User } from "../types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("access_token"),
  loading: true,

  initialize: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ user: null, token: null, loading: false });
      return;
    }

    try {
      const user = await getMe();
      set({ user, token, loading: false });
    } catch {
      localStorage.removeItem("access_token");
      set({ user: null, token: null, loading: false });
    }
  },

  signIn: async (email, password) => {
    const response = await login(email, password);
    localStorage.setItem("access_token", response.access_token);
    set({ user: response.user, token: response.access_token });
  },

  register: async (email, password) => {
    const response = await signup(email, password);
    localStorage.setItem("access_token", response.access_token);
    set({ user: response.user, token: response.access_token });
  },

  signOut: () => {
    localStorage.removeItem("access_token");
    set({ user: null, token: null });
  },
}));
