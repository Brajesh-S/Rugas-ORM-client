import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setUser({
        id: "67d3b9dbede958e70a990502",
        username: "testuser",
        email: "test@example.com"
      });
    } catch (error) {
      console.error('Auth check failed:', error.response?.data || error.message);
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
      await axios.post('https://rugas-orm-server.onrender.com/api/auth/login', credentials, {
        withCredentials: true
      });
      
      await checkAuth();
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    await axios.post('https://rugas-orm-server.onrender.com/api/auth/logout', {
      
      withCredentials: true
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);