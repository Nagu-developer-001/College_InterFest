import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Attempting login with:", { email, password });
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', { email, password });
      console.log("Success:", res.data);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error("Full Error Object:", err.response);
      alert(`Error: ${err.response?.data?.msg || "Server Unreachable"}`);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      width: '100vw', 
      backgroundColor: '#020617', 
      fontFamily: 'sans-serif' 
    }}>
      <div style={{ 
        width: '400px', 
        padding: '3rem', 
        backgroundColor: '#0f172a', 
        borderRadius: '1rem', 
        border: '1px solid #1e293b', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
      }}>
        {/* Logo/Title Section matches Dashboard Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#3b82f6', margin: '0' }}>MFG-AI</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Neural Interface Access
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
              Corporate Email
            </label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              required
              style={{ 
                width: '100%', 
                backgroundColor: '#020617', 
                border: '1px solid #334155', 
                padding: '1rem', 
                borderRadius: '0.75rem', 
                color: 'white', 
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
              Security Key
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              style={{ 
                width: '100%', 
                backgroundColor: '#020617', 
                border: '1px solid #334155', 
                padding: '1rem', 
                borderRadius: '0.75rem', 
                color: 'white', 
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              fontWeight: 'bold', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              cursor: 'pointer', 
              border: 'none',
              transition: 'background-color 0.2s',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Authorize Access
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase' }}>
            Small Extraction. Precise Production
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;