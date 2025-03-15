import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get('https://rugas-orm-client.onrender.com/api/auth/check-auth', {
        withCredentials: true
      });
      setUser(data.user);
    } catch (error) {
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
      await axios.post('https://rugas-orm-client.onrender.com/api/auth/login', credentials, {
        withCredentials: true
      });
      
      await checkAuth();
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    await axios.post('https://rugas-orm-client.onrender.com/api/auth/logout', {}, {
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