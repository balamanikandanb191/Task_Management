import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from '../../components/common/Badge';
import { 
  History, Target, Calendar, CheckCircle2, 
  Search, ExternalLink, ShieldCheck, Clock, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TMHistory = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await axios.get('/api/tasks');
            // Filter only completed/approved tasks for history
            const historyTasks = data.data.filter(t => t.status === 'Completed');
            setTasks(historyTasks);
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = tasks.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.project_title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pulse-animation" style={{ color: '#2563eb', fontWeight: 800 }}>RETRIEVING MISSION RECORDS...</div>
    </div>;

    return (
        <div className="page-wrapper fade-in" style={{ padding: '2rem 2.5rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
                    Mission <span className="text-gradient" style={{ color: '#2563eb' }}>Archive</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
                    Historical record of all validated objectives and tactical accomplishments.
                </p>
            </div>

            <div className="card" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        className="form-input"
                        placeholder="Search archived mission signatures..."
                        style={{ paddingLeft: '3.5rem', borderRadius: '16px', background: '#f8fafc', height: '56px' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredHistory.map(task => (
                        <div key={task.id} className="card" style={{ 
                            padding: '1.5rem 2rem', 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 200px 180px 100px',
                            alignItems: 'center',
                            borderRadius: '24px',
                            border: '1px solid #f1f5f9',
                            background: '#fff',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>{task.title}</h4>
                                    {task.assigned_to === user.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.7rem', fontWeight: 900 }}>
                                            <ShieldCheck size={14} /> PERSONAL WIN
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6366f1', fontSize: '0.7rem', fontWeight: 900 }}>
                                            <Users size={14} /> TEAM SUCCESS
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <Target size={14} /> {task.project_title}
                                </div>
                            </div>

                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={14} /> Completed
                                </div>
                                <div style={{ color: 'var(--text-main)', marginTop: '0.2rem' }}>
                                    {task.submitted_at ? new Date(task.submitted_at).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>

                            <div style={{ justifySelf: 'start' }}>
                                <Badge status="success">
                                    {task.assigned_name ? `BY ${task.assigned_name.toUpperCase()}` : 'TASK SEALED'}
                                </Badge>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <button 
                                    onClick={() => navigate('/tm/my-tasks')}
                                    style={{ border: 'none', color: 'var(--primary)', padding: '0.5rem', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.05)', display: 'inline-flex', cursor: 'pointer' }}
                                >
                                    <ExternalLink size={20} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredHistory.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
                            <History size={80} style={{ opacity: 0.1, marginBottom: '2rem' }} />
                            <h3 style={{ fontWeight: 900, color: 'var(--text-muted)' }}>Archive Status: Empty</h3>
                            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No mission accomplishments have been recorded in the current timeline.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TMHistory;
