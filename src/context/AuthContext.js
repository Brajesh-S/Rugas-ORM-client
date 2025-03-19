import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('token'); 

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get('https://rugas-orm-server.onrender.com/api/auth/check-auth', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(data.user);
    } catch (error) {
      console.error('Auth check failed:', error.response?.data || error.message);
      localStorage.removeItem('token'); 
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await axios.post('https://rugas-orm-server.onrender.com/api/auth/login', credentials);
      localStorage.setItem('token', data.token);
      await checkAuth();
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token'); 
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
