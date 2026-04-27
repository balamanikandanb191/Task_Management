import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckSquare, Clock, AlertTriangle, CheckCircle2, 
  Plus, UserPlus, Activity, Zap, Users,
  MessageSquare, MoreHorizontal, Bell, FileText, ChevronRight,
  Calendar
} from 'lucide-react';
import ReviewModal from '../../components/tl/ReviewModal';

const TLDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [reviewingTask, setReviewingTask] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTLData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchTLData = async () => {
        try {
            const { data } = await axios.get('/api/tasks');
            setTasks(data.data);
        } catch (err) {
            console.error('Failed to fetch TL data', err);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const stats = {
        total: tasks.length,
        pendingReview: tasks.filter(t => t.approval_status === 'pending_review').length,
        approved: tasks.filter(t => t.approval_status === 'approved').length,
        rejected: tasks.filter(t => t.approval_status === 'rejected').length,
    };

    if (loading) return <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pulse-animation" style={{ color: 'var(--primary)', fontWeight: 800 }}>ANALYZING SQUAD PERFORMANCE...</div>
    </div>;

    const handleReviewClick = (task) => {
        setReviewingTask(task);
    };

    return (
        <div className="page-wrapper fade-in" style={{ padding: '2rem 2.5rem' }}>
            {/* Premium Header */}
            <div className="dashboard-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <span style={{ 
                                background: 'rgba(5, 150, 105, 0.1)', 
                                color: '#059669', 
                                padding: '0.4rem 1rem', 
                                borderRadius: '8px', 
                                fontSize: '0.75rem', 
                                fontWeight: 900,
                                letterSpacing: '0.05em'
                            }}>
                                TEAM LEADER
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
                            Welcome <span className="text-gradient" style={{ color: '#059669' }}>Back</span>, {(() => {
                                const name = user?.name?.split(' ')[0] || 'Leader';
                                return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                            })()}.
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
                            Currently overseeing <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{stats.total} tasks</span> for the team.
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
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn" style={{ 
                                padding: '0.875rem 1.25rem', 
                                borderRadius: '14px',
                                fontWeight: 700,
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }} onClick={() => navigate('/tl/documentation')}>
                                <FileText size={18} /> Documentation
                            </button>
                            <button className="btn btn-primary" style={{ 
                                padding: '0.875rem 1.75rem', 
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontWeight: 800,
                                backgroundColor: '#059669',
                                boxShadow: '0 8px 20px rgba(5, 150, 105, 0.2)'
                            }} onClick={() => navigate('/tl/tasks')}>
                                <Plus size={20} /> New Task
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* TL Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Team Tasks" value={stats.total} icon={<CheckSquare />} color="#2563eb" />
                <StatCard title="Pending Review" value={stats.pendingReview} icon={<Clock />} color="#f59e0b" />
                <StatCard title="Approved" value={stats.approved} icon={<CheckCircle2 />} color="#10b981" />
                <StatCard title="Rejected" value={stats.rejected} icon={<AlertTriangle />} color="#ef4444" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }}>
                {/* Review Matrix (Redesigned Table) */}
                <div className="card" style={{ padding: '2rem', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>Tasks to Review</h3>
                        <Zap size={20} color="#059669" />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.filter(t => t.approval_status === 'pending_review').map((task) => (
                            <div key={task.id} style={{ 
                                padding: '1.5rem', 
                                borderRadius: '20px', 
                                background: '#f8fafc',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', borderRadius: '12px', background: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#059669',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                                    }}>
                                        {task.assigned_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{task.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{task.assigned_name} • {task.project_title}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button 
                                        onClick={() => handleReviewClick(task)}
                                        style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, background: '#059669', color: '#fff', border: 'none' }}
                                    >Review Task</button>
                                </div>
                            </div>
                        ))}
                        
                        {tasks.filter(t => t.approval_status === 'pending_review').length === 0 && (
                            <div style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>All Caught Up</div>
                                <div style={{ fontSize: '0.9rem' }}>No tasks currently require review.</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Squad Insights Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    
                    {/* Velocity Chart */}
                    <div className="card" style={{ padding: '2rem', borderRadius: '32px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
                            <Activity size={18} color="#059669" /> Team Activity
                        </h3>
                        <div style={{ display: 'flex', gap: '0.75rem', height: '140px', alignItems: 'flex-end', marginBottom: '1rem' }}>
                            {[40, 70, 55, 90, 65, 80].map((h, i) => (
                                <div key={i} style={{ 
                                    flex: 1, background: '#059669', opacity: 0.1 + (i * 0.15), 
                                    height: `${h}%`, borderRadius: '6px' 
                                }}></div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>
                    </div>

                    {/* Team Members List */}
                    <div className="card" style={{ padding: '2rem', borderRadius: '32px', background: 'var(--grad-dark)', color: '#fff' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.5rem' }}>Team Members</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[1, 2, 3].map(m => (
                                <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Team Member {m}</div>
                                    </div>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></div>
                                </div>
                            ))}
                        </div>
                        <button className="btn" style={{ 
                            width: '100%', padding: '1rem', marginTop: '2rem', background: 'rgba(255,255,255,0.05)', 
                            color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, borderRadius: '12px' 
                        }}>View All Members</button>
                    </div>
                </div>
            </div>

            {reviewingTask && (
                <ReviewModal 
                    task={reviewingTask} 
                    onClose={() => setReviewingTask(null)} 
                    onUpdate={fetchTLData} 
                />
            )}
        </div>
    );
};

export default TLDashboard;
