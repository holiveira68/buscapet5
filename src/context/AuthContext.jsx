// ═══════════════════════════════════════════════════════
// context/AuthContext.jsx — Estado global de autenticação
// ═══════════════════════════════════════════════════════
import { createContext, useContext, useState, useCallback } from 'react';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  const isLogged = !!token;

  const save = useCallback((token, user, remember = false) => {
    const s = remember ? localStorage : sessionStorage;
    s.setItem(TOKEN_KEY, token);
    s.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    [sessionStorage, localStorage].forEach(s => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
    setUser(null);
  }, []);

  const getToken = () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);

  const updateUser = useCallback((updatedUser) => {
    const remember = !!localStorage.getItem(TOKEN_KEY);
    const s = remember ? localStorage : sessionStorage;
    s.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLogged, save, logout, getToken, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
