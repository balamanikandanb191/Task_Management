import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from '../../components/common/Badge';
import { CheckCircle2, XCircle, Clock, Search, ExternalLink, FileText, AlertCircle, Eye } from 'lucide-react';
import ReviewModal from '../../components/tl/ReviewModal';
import TaskDetailsModal from '../../components/tasks/TaskDetailsModal';

const TLApprovals = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [reviewingTask, setReviewingTask] = useState(null);
    const [viewingTaskId, setViewingTaskId] = useState(null);

    useEffect(() => {
        fetchApprovals();
    }, []);

    const fetchApprovals = async () => {
        try {
            const { data } = await axios.get('/api/tasks');
            // Filter: 
            // 1. Must be 'pending_review'
            // 2. Must be assigned to a 'team_member' (prevents TLs approving other TLs or themselves)
            setTasks(data.data.filter(t => 
                t.approval_status === 'pending_review' && 
                t.assigned_to_role === 'team_member'
            ));
        } catch (err) {
            console.error('Failed to fetch approvals', err);
        } finally {
            setLoading(false);
        }
    };

    const openReview = (task) => {
        setReviewingTask(task);
    };

    const openDetails = (id) => {
        setViewingTaskId(id);
    };

    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) || 
        t.assigned_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="page-wrapper">Loading pending approvals...</div>;

    return (
        <div className="page-wrapper fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Review & Approvals</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Review work submissions and provide feedback to your team.</p>
                </div>
                <div className="badge success" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    {tasks.length} Pending Requests
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search by task title or member..." 
                        className="form-input" 
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredTasks.map((task) => (
                    <div key={task.id} className="card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{task.title}</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <User size={14} />
                                        <span>Submitted by: <strong>{task.assigned_name}</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Clock size={14} />
                                        <span>On: {new Date(task.submitted_at).toLocaleDateString()}</span>
                                    </div>
                                    <Badge status="info">{task.project_title}</Badge>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                onClick={() => openDetails(task.id)}
                                className="btn" 
                                style={{ padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                            >
                                <Eye size={16} />
                                View Mission
                            </button>
                            <button 
                                onClick={() => openReview(task)}
                                className="btn btn-primary" 
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            >
                                <CheckCircle2 size={16} />
                                Begin Review
                            </button>
                        </div>
                    </div>
                ))}

                {filteredTasks.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--success)' }}>
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No pending approvals</h3>
                        <p>You've cleared all submission requests from your team.</p>
                    </div>
                )}
            </div>

            {reviewingTask && (
                <ReviewModal 
                    task={reviewingTask} 
                    onClose={() => setReviewingTask(null)} 
                    onUpdate={fetchApprovals} 
                />
            )}

            {viewingTaskId && (
                <TaskDetailsModal 
                    taskId={viewingTaskId} 
                    onClose={() => setViewingTaskId(null)} 
                    onUpdate={fetchApprovals}
                />
            )}
        </div>
    );
};

// Simplified User icon for the inline details
const User = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

export default TLApprovals;
