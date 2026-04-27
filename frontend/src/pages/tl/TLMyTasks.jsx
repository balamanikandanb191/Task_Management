import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckSquare, FileUp, Target, 
  Calendar, Search, Clock, Users, ArrowRight
} from 'lucide-react';
import SubmissionModal from '../tm/SubmissionModal';

const TLMyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submissionModal, setSubmissionModal] = useState({ isOpen: false, task: null });
    const [filter, setFilter] = useState('All');
    const { user } = useAuth();

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            const { data } = await axios.get('/api/tasks');
            // Filter tasks where assigned_to is the current user
            const myTasks = data.data.filter(t => t.assigned_to === user.id);
            setTasks(myTasks);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/tasks/${id}`, { status });
            fetchMyTasks();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'All') return t.status !== 'Completed' || t.approval_status === 'rejected';
        if (filter === 'Action Required') return t.approval_status === 'rejected' || t.status === 'Pending';
        return true;
    });

    if (loading) return <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pulse-animation" style={{ color: '#2563eb', fontWeight: 800 }}>SYNCING PERSONAL MISSION DATA...</div>
    </div>;

    return (
        <div className="page-wrapper fade-in" style={{ padding: '2rem 2.5rem' }}>
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
                        My <span className="text-gradient" style={{ color: '#2563eb' }}>Workstreams</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
                        Tasks assigned directly to you for execution.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '12px' }}>
                    {['All', 'Action Required'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{ 
                                fontSize: '0.85rem', fontWeight: 800, padding: '0.6rem 1.25rem', borderRadius: '10px', 
                                background: filter === f ? '#fff' : 'transparent',
                                color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                                boxShadow: filter === f ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: '2.5rem', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {filteredTasks.map((task) => (
                        <div key={task.id} className="card" style={{ 
                            padding: '1.75rem 2rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            borderRadius: '24px',
                            border: '1px solid #f1f5f9',
                            background: task.approval_status === 'rejected' ? '#fff1f2' : '#fff',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>{task.title}</h4>
                                    <Badge status={task.approval_status === 'rejected' ? 'danger' : task.status}>
                                        {task.approval_status === 'rejected' ? 'REVISION' : task.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Target size={14} color="var(--primary)" /> 
                                        <span style={{ color: 'var(--text-main)' }}>{task.project_title}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Calendar size={14} /> 
                                        <span>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Users size={14} /> 
                                        <span>Created by: {task.created_by_name}</span>
                                    </div>
                                </div>
                                {task.approval_status === 'rejected' && (
                                    <div style={{ 
                                        marginTop: '1.25rem', padding: '1rem', background: 'rgba(225, 29, 72, 0.05)', 
                                        borderRadius: '12px', borderLeft: '4px solid #e11d48', fontSize: '0.875rem' 
                                    }}>
                                        <strong style={{ color: '#991b1b' }}>Revision Required:</strong> <span style={{ color: '#b91c1c' }}>{task.rejection_reason}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '2rem' }}>
                                {task.status === 'Pending' && (
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => updateStatus(task.id, 'In Progress')} 
                                        style={{ padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        Start Work <ArrowRight size={16} />
                                    </button>
                                )}
                                
                                {task.status === 'In Progress' && (
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => setSubmissionModal({ isOpen: true, task })} 
                                        style={{ padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--grad-primary)' }}
                                    >
                                        <FileUp size={16} /> Submit Assets
                                    </button>
                                )}

                                {task.status === 'Completed' && (
                                    <div style={{ 
                                        color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.6rem', 
                                        fontWeight: 900, background: '#fffbeb', padding: '0.75rem 1.5rem', 
                                        borderRadius: '14px', fontSize: '0.9rem', border: '1px solid #fef3c7' 
                                    }}>
                                        <Clock size={16} />
                                        <span>VERIFICATION PENDING</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredTasks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--text-muted)' }}>
                            <CheckSquare size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                            <h3 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>All Coordinated!</h3>
                            <p style={{ fontWeight: 500 }}>No personal mission objectives requiring immediate action.</p>
                        </div>
                    )}
                </div>
            </div>

            {submissionModal.isOpen && (
                <SubmissionModal 
                    isOpen={submissionModal.isOpen}
                    task={submissionModal.task}
                    onClose={() => setSubmissionModal({ isOpen: false, task: null })}
                    onSuccess={fetchMyTasks}
                />
            )}
        </div>
    );
};

export default TLMyTasks;
