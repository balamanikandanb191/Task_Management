import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useCompletion } from '../../context/CompletionContext';
import { useNavigate } from 'react-router-dom';
import {
    CheckSquare, Clock, FileUp, History,
    Zap, Target, ChevronRight, Calendar,
    TrendingUp, BarChart3, ArrowRight
} from 'lucide-react';

const TMDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { user } = useAuth();
    const navigate = useNavigate();
    const { triggerCelebration, stopCelebration } = useCompletion();

    useEffect(() => {
        fetchMyTasks();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Celebration logic for all tasks completed
    useEffect(() => {
        if (!loading && tasks.length > 0) {
            const allDone = tasks.every(t => t.status === 'Completed');
            if (allDone) {
                document.body.classList.add('celebration-mode');
            } else {
                document.body.classList.remove('celebration-mode');
            }
        }
        return () => document.body.classList.remove('celebration-mode');
    }, [tasks, loading]);

    const fetchMyTasks = async () => {
        try {
            const { data } = await axios.get('/api/tasks');
            setTasks(data.data || []);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: tasks.length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        pending: tasks.filter(t => t.status === 'Pending').length
    };

    const recentTasks = tasks
        .filter(t => t.status !== 'Completed')
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="pulse-animation" style={{ color: '#2563eb', fontWeight: 800 }}>AGGREGATING OPERATIVE DATA...</div>
        </div>
    );

    return (
        <div className="page-wrapper fade-in" style={{ padding: '2rem 2.5rem' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{
                            background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)',
                            padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem',
                            fontWeight: 900, letterSpacing: '0.05em'
                        }}>MY DASHBOARD</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
                        Welcome <span className="text-gradient" style={{ color: '#2563eb' }}>Back</span>, {(() => {
                            const name = user?.name?.split(' ')[0] || 'Operative';
                            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                        })()}.
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
                        You have <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{stats.inProgress + stats.pending} pending tasks</span>.
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Calendar size={14} />
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>|</span>
                        <Clock size={14} />
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Core Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Assigned Tasks" value={stats.total} icon={<CheckSquare />} color="#2563eb" />
                <StatCard title="In Progress" value={stats.inProgress} icon={<Zap />} color="#7c3aed" />
                <StatCard title="Completed" value={stats.completed} icon={<TrendingUp />} color="#10b981" />
                <StatCard title="Success Rate" value={stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'} icon={<BarChart3 />} color="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2.5rem' }}>
                {/* Main Content: Priority Objectives */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>Priority Tasks</h3>
                        <button
                            onClick={() => navigate('/tm/my-tasks')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            View All <ArrowRight size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentTasks.map(task => (
                            <div key={task.id} className="card" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{task.title}</h4>
                                        <Badge status={task.status}>{task.status.toUpperCase()}</Badge>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{task.project_title}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DEADLINE</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ef4444' }}>{new Date(task.deadline).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                        {recentTasks.length === 0 && (
                            <div className="card" style={{ padding: '4rem', textAlign: 'center', borderRadius: '32px', background: '#f8fafc', border: '1px dashed #e2e8f0' }}>
                                <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>No tasks to show. You are all caught up!</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Action Hub */}
                    <div style={{ marginTop: '3rem' }}>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", marginBottom: '1.5rem' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                            <div
                                onClick={() => navigate('/tm/upload')}
                                style={{
                                    padding: '2rem', borderRadius: '28px', background: 'var(--grad-primary)',
                                    color: 'white', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', flexDirection: 'column', gap: '1rem'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileUp size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>Upload Files</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Submit task files and reports.</div>
                                </div>
                            </div>
                            <div
                                onClick={() => navigate('/tm/history')}
                                style={{
                                    padding: '2rem', borderRadius: '28px', background: 'var(--grad-dark)',
                                    color: 'white', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', flexDirection: 'column', gap: '1rem'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <History size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>Task History</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>View your past tasks and achievements.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Focus Dashboard Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card" style={{ padding: '2.5rem', borderRadius: '32px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '2rem', fontFamily: "'Outfit', sans-serif" }}>My Progress</h3>
                        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 1.5rem auto' }}>
                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
                                {(() => {
                                    const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                                    return (
                                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#2563eb" strokeWidth="4"
                                            strokeDasharray={`${progress} 100`} strokeLinecap="round"></circle>
                                    );
                                })()}
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb' }}>{stats.completed}/{stats.total}</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Completed Tasks</p>
                    </div>

                    <div className="card" style={{ padding: '2.5rem', borderRadius: '32px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Target size={20} color="var(--primary)" />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Daily Tip</h3>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
                            Focus on your high priority tasks today. Accuracy is key to finishing on time. Make sure all your work is checked before submitting.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TMDashboard;
