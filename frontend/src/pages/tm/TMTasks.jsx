import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    CheckSquare, FileUp, Target, User,
    Calendar, MessageCircle, Search, Filter, Clock, Users, FileText, Download
} from 'lucide-react';
import SubmissionModal from './SubmissionModal';

const TMTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submissionModal, setSubmissionModal] = useState({ isOpen: false, task: null });
    const [filter, setFilter] = useState('All');
    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            const { data } = await axios.get('/api/tasks');
            setTasks(data.data);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/tasks/${id}`, { status });
            showToast('Mission objectives engaged. Status updated.', 'success');
            fetchMyTasks();
        } catch (err) {
            showToast('Link failure. Failed to update status.', 'error');
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'All') return t.status !== 'Completed' || t.approval_status === 'rejected';
        if (filter === 'Action Required') return t.approval_status === 'rejected' || t.status === 'Pending';
        return true;
    });

    if (loading) return <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pulse-animation" style={{ color: '#2563eb', fontWeight: 800 }}>SYNCING ACTION MATRIX...</div>
    </div>;

    return (
        <div className="page-wrapper fade-in" style={{ padding: '2rem 2.5rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
                    My <span className="text-gradient" style={{ color: '#2563eb' }}>Workstreams</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
                    View and manage your active mission objectives.
                </p>
            </div>

            <div className="card" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search goals..."
                                className="form-input"
                                style={{ paddingLeft: '3rem', borderRadius: '14px', width: '300px', background: '#f8fafc' }}
                            />
                        </div>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {filteredTasks.map((task) => (
                        <div key={task.id} className="card" style={{
                            padding: '1.5rem 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: '24px',
                            border: '1px solid #f1f5f9',
                            background: task.approval_status === 'rejected' ? '#fff1f2' : '#fff'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>{task.title}</h4>
                                    <Badge status={task.approval_status === 'rejected' ? 'danger' : task.status}>
                                        {task.approval_status === 'rejected' ? 'REVISION' : task.status.toUpperCase()}
                                    </Badge>
                                    {task.assigned_to === user.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 900, background: 'rgba(37, 99, 235, 0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                                            <CheckSquare size={12} /> YOUR ASSIGNMENT
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6366f1', fontSize: '0.7rem', fontWeight: 900, background: 'rgba(99, 102, 241, 0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                                            <Users size={12} /> TEAM OBJECTIVE
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Target size={14} /> {task.project_title}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> Assigned By: {task.created_by_name || 'System Admin'}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} /> Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</div>
                                    {!task.assigned_to && <div style={{ color: '#f59e0b', fontWeight: 800 }}>UNASSIGNED</div>}
                                </div>
                                {task.file_count > 0 && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <a
                                            href={`http://localhost:5000/uploads/${task.brief_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                color: '#2563eb', padding: '0.5rem 1rem', borderRadius: '10px',
                                                background: 'rgba(37, 99, 235, 0.05)', textDecoration: 'none',
                                                fontSize: '0.85rem', fontWeight: 800
                                            }}
                                        >
                                            <FileText size={16} /> TECHNICAL BRIEF / REPORT
                                        </a>
                                    </div>
                                )}
                                {task.approval_status === 'rejected' && (
                                    <div style={{ 
                                        marginTop: '1.5rem', padding: '1.25rem', borderRadius: '16px', 
                                        background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)',
                                        display: 'flex', flexDirection: 'column', gap: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MessageCircle size={16} color="#ef4444" />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Rejection Feedback
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#7f1d1d', lineHeight: 1.5, fontWeight: 600 }}>
                                            {task.rejection_reason}
                                        </div>
                                        
                                        {task.rejection_screenshot && (
                                            <div style={{ 
                                                marginTop: '0.25rem', borderRadius: '12px', overflow: 'hidden', 
                                                border: '1px solid rgba(239, 68, 68, 0.1)', background: '#fff',
                                                maxWidth: '400px'
                                            }}>
                                                <div style={{ 
                                                    padding: '0.5rem 1rem', background: '#fff', fontSize: '0.65rem', 
                                                    fontWeight: 800, color: '#ef4444', borderBottom: '1px solid #fecaca',
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                                }}>
                                                    <FileUp size={12} /> SUPPORTING VISUAL
                                                </div>
                                                <a href={`/uploads/${task.rejection_screenshot}`} target="_blank" rel="noopener noreferrer">
                                                    <img 
                                                        src={`/uploads/${task.rejection_screenshot}`} 
                                                        alt="Rejection Context" 
                                                        style={{ width: '100%', display: 'block', maxHeight: '180px', objectFit: 'cover', transition: 'opacity 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                    />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {!task.assigned_to && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => updateStatus(task.id, 'In Progress')}
                                        style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 800, background: 'var(--grad-primary)' }}
                                    >
                                        Claim & Start
                                    </button>
                                )}

                                {task.assigned_to === user.id && task.status === 'Pending' && (
                                    <button className="btn btn-primary" onClick={() => updateStatus(task.id, 'In Progress')} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 800 }}>
                                        Engage
                                    </button>
                                )}

                                {task.assigned_to === user.id && task.status === 'In Progress' && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setSubmissionModal({ isOpen: true, task })}
                                        style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 800 }}
                                    >
                                        Submit Deliverables
                                    </button>
                                )}

                                {task.assigned_to === user.id && task.status === 'Completed' && (
                                    <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, background: '#fffbeb', padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                                        <Clock size={18} />
                                        <span>REVIEWING</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredTasks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
                            <CheckSquare size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                            <p style={{ fontWeight: 600 }}>No active mission objectives found.</p>
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

export default TMTasks;
