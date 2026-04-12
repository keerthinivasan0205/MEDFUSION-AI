import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.sub, role: decoded.role, name: localStorage.getItem('name') });
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('name', name);
    const decoded = jwtDecode(token);
    setUser({ id: decoded.sub, role: decoded.role, name });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
