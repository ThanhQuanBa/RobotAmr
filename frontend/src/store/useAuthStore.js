import { create } from 'zustand';

let restorePromise;
const useAuthStore = create((set) => ({
  user: null, // { id, username, role: 'visitor' | 'operator' }
  ready: false,
  sessionError: '',

  restoreSession: () => {
    if (restorePromise) return restorePromise;
    set({ ready: false, sessionError: '' });
    restorePromise = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Session check failed');
        const data = await response.json();
        set({ user: data.user || null, ready: true });
      } catch {
        set({ sessionError: 'Không thể kiểm tra phiên đăng nhập. Vui lòng kiểm tra kết nối rồi thử lại.', ready: false });
      } finally {
        clearTimeout(timer);
        restorePromise = null;
      }
    })();
    return restorePromise;
  },
  
  login: async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        set({ user: data.user });
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  },

  register: async (username, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        set({ user: data.user });
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  },

  logout: async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok && response.status !== 401) throw new Error('Logout failed');
      set({ user: null });
    } catch {
      window.alert('Chưa thể đăng xuất. Vui lòng kiểm tra kết nối và thử lại.');
    }
  }
}));

export default useAuthStore;
