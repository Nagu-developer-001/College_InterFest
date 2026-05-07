import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [input, setInput] = useState('');
    const [filterStatus, setFilterStatus] = useState(null); 
    const navigate = useNavigate();

    // 1. Fetch Orders Logic (Isolated by User via Token)
    const fetchOrders = async () => {
        // Always grab the latest token from storage to ensure isolation
        const activeToken = localStorage.getItem('token'); 
        if (!activeToken) {
            navigate('/login');
            return;
        }

        try {
            const res = await axios.get('http://localhost:8000/api/orders', {
                headers: { Authorization: `Bearer ${activeToken}` }
            });
            // res.data now contains ONLY the orders belonging to the logged-in user
            setOrders(res.data);
        } catch (err) { 
            console.log("Fetch Error:", err);
            // If token is expired or invalid, kick to login
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    // 2. Security Guard & Initial Load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            fetchOrders();
        }
    }, [navigate]);

    // 3. Stats Calculation
    const stats = {
        received: orders.filter(o => o.status.toLowerCase() === 'received').length,
        processing: orders.filter(o => 
            o.status.toLowerCase().includes('review') || 
            o.status.toLowerCase().includes('processing')
        ).length,
        accepted: orders.filter(o => o.status.toLowerCase() === 'accepted').length,
        total: orders.length
    };

    const getWidth = (count) => stats.total > 0 ? `${(count / stats.total) * 100}%` : '0%';

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleSendCommand = async () => {
        const activeToken = localStorage.getItem('token');
        const msg = input.toLowerCase();

        // Multi-Order Awareness (Client-side filtering)
        if (msg.includes("show") && msg.includes("all")) {
            if (msg.includes("accepted")) setFilterStatus("Accepted");
            else if (msg.includes("received")) setFilterStatus("Received");
            else if (msg.includes("processing") || msg.includes("review")) setFilterStatus("Processing");
            else setFilterStatus(null);
            setInput('');
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/orders/chat', 
                { message: input },
                { headers: { Authorization: `Bearer ${activeToken}` } }
            );
            setInput('');
            setFilterStatus(null);
            fetchOrders(); // Refresh the list to see the new isolated order
        } catch (err) { 
            console.log("Chat Error:", err); 
        }
    };

    const filteredOrders = filterStatus 
        ? orders.filter(o => o.status.toLowerCase().includes(filterStatus.toLowerCase())) 
        : orders;

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#020617', color: '#f1f5f9', overflow: 'hidden', fontFamily: 'sans-serif' }}>
            
            {/* LEFT SIDE: COMMAND CENTER */}
            <div style={{ width: '33%', borderRight: '1px solid #1e293b', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#3b82f6', marginBottom: '0.5rem' }}>MFG-AI</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Neural Interface v1.1</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        style={{ background: 'transparent', border: '1px solid #334155', color: '#64748b', padding: '0.5rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase' }}
                    >
                        Logout
                    </button>
                </div>
                
                <div style={{ marginTop: 'auto', marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '1rem' }}>Voice or Text Instruction</label>
                    <textarea 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #334155', padding: '1rem', borderRadius: '0.75rem', color: 'white', height: '150px', outline: 'none', resize: 'none' }} 
                        placeholder="e.g., I need 500 Engine Valves by August 10" 
                    />
                    <button onClick={handleSendCommand} style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', padding: '1rem', borderRadius: '0.75rem', marginTop: '1rem', cursor: 'pointer', border: 'none' }}>Execute Command</button>
                </div>
            </div>

            {/* RIGHT SIDE: ORDERS FEED */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '2rem' }}>
                
                {/* --- PRODUCTION PIPELINE HEATMAP --- */}
                <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#1e293b33', borderRadius: '1rem', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Production Pipeline Heatmap</h3>
                        <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 'bold' }}>{stats.total} Active Batches</span>
                    </div>
                    
                    <div style={{ display: 'flex', height: '14px', width: '100%', backgroundColor: '#020617', borderRadius: '7px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ width: getWidth(stats.received), backgroundColor: '#64748b', transition: 'width 0.5s' }} />
                        <div style={{ width: getWidth(stats.processing), backgroundColor: '#f59e0b', transition: 'width 0.5s' }} />
                        <div style={{ width: getWidth(stats.accepted), backgroundColor: '#10b981', transition: 'width 0.5s' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem' }}>
                        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{width: 8, height: 8, borderRadius: '50%', background: '#64748b'}} /> Received ({stats.received})
                        </span>
                        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{width: 8, height: 8, borderRadius: '50%', background: '#f59e0b'}} /> Processing ({stats.processing})
                        </span>
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{width: 8, height: 8, borderRadius: '50%', background: '#10b981'}} /> Accepted ({stats.accepted})
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>
                        {filterStatus ? `Showing: ${filterStatus}` : 'Live Order Feed'}
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredOrders.length === 0 ? (
                        <div style={{ color: '#475569', fontSize: '0.875rem', gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                            No active orders found for this account.
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order._id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 'bold' }}>REF: #{order.id}</span>
                                    <span style={{ 
                                        fontSize: '0.7rem', 
                                        color: order.status.toLowerCase().includes('accepted') ? '#10b981' : 
                                               order.status.toLowerCase().includes('review') || order.status.toLowerCase().includes('processing') ? '#f59e0b' : '#94a3b8', 
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase'
                                    }}>
                                        ● {order.status}
                                    </span>
                                </div>
                                
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#f8fafc' }}>
                                    {order.partName || "Industrial Component"}
                                </h3>
                                
                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1, background: '#020617', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                                        <p style={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>Material</p>
                                        <p style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{order.material}</p>
                                    </div>
                                    <div style={{ flex: 1, background: '#020617', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                                        <p style={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>Qty</p>
                                        <p style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{order.quantity}</p>
                                    </div>
                                    <div style={{ flex: 1, background: '#020617', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                                        <p style={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>Deadline</p>
                                        <p style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#60a5fa' }}>
                                            {new Date(order.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>

                                {order.qualityNotes?.length > 0 && (
                                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#020617', borderRadius: '0.5rem', borderLeft: '3px solid #3b82f6' }}>
                                        <p style={{ fontSize: '0.6rem', color: '#3b82f6', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Latest Quality Log</p>
                                        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                                            {order.qualityNotes[order.qualityNotes.length - 1].text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;