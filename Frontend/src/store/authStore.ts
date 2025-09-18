import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setToken: (token: string, userId: string, username: string, email: string) => void;
  setUsername: (username: string) => void; // Add setUsername to AuthState
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'), // Initialize from localStorage
  userId: localStorage.getItem('userId'), // Initialize userId from localStorage
  username: localStorage.getItem('username'), // Initialize username from localStorage
  email: localStorage.getItem('email'), // Initialize email from localStorage
  isAuthenticated: !!localStorage.getItem('token'), // Check if token exists

  setToken: (token: string, userId: string, username: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    set({ token, userId, username, email, isAuthenticated: true });
  },

  setUsername: (username: string) => {
    localStorage.setItem('username', username);
    set({ username });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    set({ token: null, userId: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
