import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// REQUIRED for Speech Recognition
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [input, setInput] = useState('');
    const [filterStatus, setFilterStatus] = useState(null); 
    const [isExecuting, setIsExecuting] = useState(false);
    const navigate = useNavigate();

    // --- VOICE ASSISTANT HOOK ---
    const { 
        transcript, 
        listening, 
        resetTranscript, 
        browserSupportsSpeechRecognition 
    } = useSpeechRecognition();

    // Sync voice transcript to text input in real-time
    useEffect(() => {
        if (transcript) setInput(transcript);
    }, [transcript]);

    const fetchOrders = async () => {
        const activeToken = localStorage.getItem('token'); 
        if (!activeToken) {
            navigate('/login');
            return;
        }

        try {
            const res = await axios.get('http://localhost:8000/api/orders', {
                headers: { Authorization: `Bearer ${activeToken}` }
            });
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) { 
            console.error("Fetch Error:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // --- UPDATED COMMAND HANDLER WITH AUTO-LOGIC ---
    const handleSendCommand = useCallback(async () => {
        const activeToken = localStorage.getItem('token');
        if (!input.trim()) return;

        setIsExecuting(true);
        const msg = input.toLowerCase();

        // 1. Voice/Text Command: Filtering Logic
        if (msg.includes("show") || msg.includes("filter")) {
            if (msg.includes("accepted")) setFilterStatus("Accepted");
            else if (msg.includes("received")) setFilterStatus("Received");
            else if (msg.includes("processing") || msg.includes("review")) setFilterStatus("Processing");
            else setFilterStatus(null);
            
            // Optional: Voice feedback
            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Filtering orders now"));
            
            setInput('');
            resetTranscript();
            setIsExecuting(false);
            return;
        }

        // 2. Voice/Text Command: Remote Action (Backend API)
        try {
            await axios.post('http://localhost:8000/api/orders/chat', 
                { message: input },
                { headers: { Authorization: `Bearer ${activeToken}` } }
            );
            setInput('');
            resetTranscript();
            setFilterStatus(null);
            fetchOrders(); 
        } catch (err) { 
            console.error("Chat Error:", err); 
        } finally {
            setIsExecuting(false);
        }
    }, [input, resetTranscript]); // Dependencies for useCallback

    // --- NEW: AUTO-EXECUTE ON SPEECH END ---
    useEffect(() => {
        if (!listening && transcript.length > 0) {
            console.log("Speech ended. Executing command:", transcript);
            handleSendCommand();
        }
    }, [listening, transcript, handleSendCommand]);

    // --- VOICE CONTROL HANDLERS ---
    const startVoice = (e) => {
        e.preventDefault();
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
    };

    const stopVoice = (e) => {
        e.preventDefault();
        SpeechRecognition.stopListening();
    };

    // Stats Calculation for Heatmap
    const stats = {
        received: orders.filter(o => o.status?.toLowerCase() === 'received').length,
        processing: orders.filter(o => 
            o.status?.toLowerCase().includes('review') || 
            o.status?.toLowerCase().includes('processing')
        ).length,
        accepted: orders.filter(o => o.status?.toLowerCase() === 'accepted').length,
        total: orders.length
    };

    const getWidth = (count) => stats.total > 0 ? `${(count / stats.total) * 100}%` : '0%';

    const filteredOrders = filterStatus 
        ? orders.filter(o => o.status?.toLowerCase().includes(filterStatus.toLowerCase())) 
        : orders;

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#020617', color: '#f1f5f9', overflow: 'hidden', fontFamily: 'sans-serif' }}>
            
            {/* COMMAND CENTER PANEL */}
            <div style={{ width: '350px', borderRight: '1px solid #1e293b', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: '1.8rem', color: '#3b82f6', margin: 0 }}>MFG-AI</h1>
                    <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #334155', color: '#64748b', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>EXIT</button>
                </div>
                
                <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>SYSTEM LOGS</span>
                        {listening && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>● RECORDING</span>}
                    </div>

                    <textarea 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', padding: '1rem', borderRadius: '0.5rem', color: 'white', height: '120px', resize: 'none', outline: 'none' }} 
                        placeholder="Hold mic to speak or type here..."
                    />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button 
                            onClick={handleSendCommand} 
                            disabled={isExecuting}
                            style={{ flex: 3, backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {isExecuting ? '...' : 'EXECUTE'}
                        </button>
                        <button 
                            onMouseDown={startVoice} 
                            onMouseUp={stopVoice}
                            onTouchStart={startVoice}
                            onTouchEnd={stopVoice}
                            style={{ flex: 1, backgroundColor: listening ? '#ef4444' : '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1.2rem' }}
                        >🎤</button>
                    </div>
                </div>
            </div>

            {/* LIVE FEED PANEL */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                
                {/* PIPELINE HEATMAP */}
                <div style={{ marginBottom: '2rem', background: '#0f172a', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #1e293b' }}>
                    <h3 style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>PRODUCTION PIPELINE</h3>
                    <div style={{ display: 'flex', height: '10px', background: '#020617', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: getWidth(stats.received), background: '#64748b' }} />
                        <div style={{ width: getWidth(stats.processing), background: '#f59e0b' }} />
                        <div style={{ width: getWidth(stats.accepted), background: '#10b981' }} />
                    </div>
                </div>

                <h2 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                    {filterStatus ? `FILTERED: ${filterStatus}` : 'LIVE INVENTORY FEED'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredOrders.map(order => (
                        <div key={order._id} style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.65rem', color: '#475569' }}>REF #{order.id || order._id.slice(-5)}</span>
                                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold' }}>{order.status}</span>
                            </div>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{order.partName}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
                                <span>Material: {order.material}</span>
                                <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>Qty: {order.quantity}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;