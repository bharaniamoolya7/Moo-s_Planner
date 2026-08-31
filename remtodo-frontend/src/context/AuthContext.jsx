import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('moosplanner_user') || localStorage.getItem('remtodo_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Try verifying with backend in background
        api.get(`/api/users/${parsed.id}`)
          .then(res => {
            if (res.data) {
              setUser(res.data);
              localStorage.setItem('moosplanner_user', JSON.stringify(res.data));
            }
          })
          .catch(() => {
            // Keep local session if backend is down
          });
      } catch {
        localStorage.removeItem('moosplanner_user');
        localStorage.removeItem('remtodo_user');
      }
    }
    setLoading(false);
  }, []);

  const getStableUserId = (email, existingId) => {
    if (existingId && !String(existingId).startsWith('temp-')) return existingId;
    if (!email) return 'guest';
    return `user_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  const login = async (email, password) => {
    const localUsers = JSON.parse(localStorage.getItem('moosplanner_local_users') || localStorage.getItem('remtodo_local_users') || '[]');
    const cleanEmail = email.trim().toLowerCase();
    const foundLocal = localUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    try {
      const res = await api.post('/api/auth/login', { email: cleanEmail, password });
      const userData = res.data;
      if (userData) {
        setUser(userData);
        localStorage.setItem('moosplanner_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (err) {
      // If backend error response exists (e.g. 401 Bad Credentials or 404 User Not Found)
      if (err.response && (err.response.status === 401 || err.response.status === 404)) {
        return { success: false, error: typeof err.response.data === 'string' ? err.response.data : 'Invalid email or password' };
      }

      // Offline / LocalStorage Mode: Validate against created local accounts
      if (foundLocal) {
        if (foundLocal.password === password) {
          setUser(foundLocal);
          localStorage.setItem('moosplanner_user', JSON.stringify(foundLocal));
          return { success: true, user: foundLocal };
        } else {
          return { success: false, error: 'Incorrect password' };
        }
      }

      // No account found for this email
      return { success: false, error: 'No account found with this email. Please create an account first!' };
    }
  };

  const signup = async (displayName, email, password, avatarConfig) => {
    const cleanEmail = email.trim().toLowerCase();
    const stableId = getStableUserId(cleanEmail);
    const newUser = {
      id: stableId,
      displayName,
      email: cleanEmail,
      password,
      avatarConfig: avatarConfig || { gender: 'girl', hairStyle: 'bob' }
    };

    // Save to localUsers list immediately so login works for created accounts
    const localUsers = JSON.parse(localStorage.getItem('moosplanner_local_users') || localStorage.getItem('remtodo_local_users') || '[]');
    const updatedLocal = [...localUsers.filter(u => u.email && u.email.toLowerCase() !== cleanEmail), newUser];
    localStorage.setItem('moosplanner_local_users', JSON.stringify(updatedLocal));

    try {
      const res = await api.post('/api/auth/signup', { displayName, email: cleanEmail, password });
      const userData = res.data || newUser;
      setUser(userData);
      localStorage.setItem('moosplanner_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      // Backend is offline - proceed with created local account
      setUser(newUser);
      localStorage.setItem('moosplanner_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('moosplanner_user');
    localStorage.removeItem('remtodo_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('moosplanner_user', JSON.stringify(updatedUser));

    // Also update moosplanner_local_users so avatar and profile changes persist across login/logout
    try {
      const localUsers = JSON.parse(localStorage.getItem('moosplanner_local_users') || localStorage.getItem('remtodo_local_users') || '[]');
      const updatedList = localUsers.map(u => u.email === updatedUser.email ? { ...u, ...updatedUser } : u);
      if (!updatedList.some(u => u.email === updatedUser.email)) {
        updatedList.push(updatedUser);
      }
      localStorage.setItem('moosplanner_local_users', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Failed to save user to localUsers list:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
