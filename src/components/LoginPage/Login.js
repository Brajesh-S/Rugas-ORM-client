import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const toggleAuthMode = () => {
    setIsLogin(prev => !prev);
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isLogin && (!credentials.username || !credentials.email || !credentials.password)) {
      setError('Please fill in all fields');
      return;
    }


    try {
      if (isLogin) {
        await login({ email: credentials.email, password: credentials.password });
        navigate('/dashboard'); 
      } else {
        await signup(credentials);
        setCredentials({ username: '', email: '', password: '' });
        setSuccessMessage('Account created successfully! Please log in.');
        navigate('/login'); 
      }
    } catch (err) {
      setCredentials({ username: '', email: '', password: '' });
      setError(err.message || (isLogin ? 'Invalid credentials' : 'Signup failed'));
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        
        {successMessage && <div className="success">{successMessage}</div>}
        {error && <div className="error">{error}</div>}

        {!isLogin && (
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>

        <div className="toggle-auth">
          {isLogin ? (
            <>Don't have an account? <span onClick={toggleAuthMode}>Register</span></>
          ) : (
            <>Already have an account? <span onClick={toggleAuthMode}>Login</span></>
          )}
        </div>
      </form>
    </div>
  );
}
export default Login;