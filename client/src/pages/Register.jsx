import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // 1. Clear any old session data first
            localStorage.removeItem('token');

            // 2. Register the user
            const res = await axios.post('http://localhost:8000/api/auth/register', { email, password });
            
            // 3. Check for token in response
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard');
                window.location.reload(); 
            } else {
                alert("Registration successful! Please login with your new credentials.");
                navigate('/login');
            }
        } catch (err) {
            console.error("Registration Error:", err.response);
            alert(err.response?.data?.msg || "Registration failed. Account might already exist.");
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
            fontFamily: 'sans-serif',
            position: 'relative', 
            overflow: 'hidden'    
        }}>
            {/* LEFT PANEL: Spline Component Container */}
            <div style={{
                flex: 1,
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Spline scene="https://prod.spline.design/xeVvkIidXuUpzfrh/scene.splinecode" />
                
                {/* Visual mask placed locally inside the left panel to cover the badge */}
                <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    width: '160px',     
                    height: '60px',
                    backgroundColor: '#020617', 
                    zIndex: 999,        
                    pointerEvents: 'none' 
                }} />
            </div>

            {/* RIGHT PANEL: Form Container */}
            <div style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#020617', // Preserves outer seamless look
                zIndex: 1
            }}>
                {/* Form Wrapper (unaltered design) */}
                <div style={{ 
                    width: '400px', 
                    padding: '3rem', 
                    backgroundColor: '#0f172a', 
                    borderRadius: '1rem', 
                    border: '1px solid #1e293b', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    position: 'relative' 
                }}>
                    {/* Branding Section */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#10b981', margin: '0' }}>MFG-AI</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Create Neural Account
                        </p>
                    </div>

                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
                                Email Address
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
                                Choose Security Key
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
                                backgroundColor: '#10b981', 
                                color: 'white', 
                                fontWeight: 'bold', 
                                padding: '1rem', 
                                borderRadius: '0.75rem', 
                                cursor: 'pointer', 
                                border: 'none',
                                transition: 'background-color 0.2s',
                                fontSize: '1rem'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                        >
                            Initialize Account
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                            Already authorized? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>Access Portal</Link>
                        </p>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <p style={{ color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                            Small Extraction. Precise Production
                        </p>
                    </div>
                </div>
            </div>
        </div> 
    );
};

export default Register;

/* */