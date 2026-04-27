import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, CheckCircle2, Clock, AlertCircle, MessageSquare, 
  Paperclip, Send, User, Calendar, Trash2, Plus, ExternalLink
} from 'lucide-react';
import Badge from '../common/Badge';

const TaskDetailsModal = ({ taskId, onClose, onUpdate }) => {
    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, comments, files

    useEffect(() => {
        if (taskId) fetchTaskDetails();
    }, [taskId]);

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const [taskRes, commentsRes, filesRes] = await Promise.all([
                axios.get(`/api/tasks/${taskId}`),
                axios.get(`/api/comments/task/${taskId}`),
                axios.get(`/api/files/task/${taskId}`)
            ]);
            setTask(taskRes.data.data);
            setComments(commentsRes.data.data);
            setFiles(filesRes.data.data);
        } catch (err) {
            console.error('Failed to fetch details', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await axios.post(`/api/comments/task/${taskId}`, { comment: newComment });
            setNewComment('');
            const { data } = await axios.get(`/api/comments/task/${taskId}`);
            setComments(data.data);
        } catch (err) {
            console.error('Failed to add comment', err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            await axios.post(`/api/files/upload/${taskId}`, formData);
            const { data } = await axios.get(`/api/files/task/${taskId}`);
            setFiles(data.data);
        } catch (err) {
            console.error('File upload failed', err);
        }
    };

    if (loading || !task) return (
        <div className="modal-overlay">
            <div className="card" style={{ width: '400px', padding: '2rem', textAlign: 'center' }}>
                <div className="pulse-animation">LOADING MISSION...</div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card fade-in" onClick={e => e.stopPropagation()} style={{ 
                maxWidth: '800px', width: '100%', padding: 0, borderRadius: '24px', 
                overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' 
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{task.title}</h2>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Project: {task.project_title}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', padding: '0 2rem', background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                    {['overview', 'comments', 'files'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            style={{ 
                                padding: '1rem 1.5rem', border: 'none', background: 'none', 
                                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    {activeTab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
                            <div>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Description</h4>
                                <p style={{ lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{task.description}</p>
                                
                                {task.submission_link && (
                                    <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '16px', background: 'var(--primary-soft)', border: '1px solid var(--primary-light)' }}>
                                        <h4 style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
                                            <ExternalLink size={14} /> External Submission Link
                                        </h4>
                                        <a 
                                            href={task.submission_link.startsWith('http') ? task.submission_link : `https://${task.submission_link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', wordBreak: 'break-all' }}
                                        >
                                            {task.submission_link}
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                )}
                                
                                {task.rejection_reason && (
                                    <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                        <h4 style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <AlertCircle size={16} /> Rejection Feedback
                                        </h4>
                                        <p style={{ fontSize: '0.9rem', color: '#7f1d1d', marginBottom: task.rejection_screenshot ? '1.5rem' : 0 }}>{task.rejection_reason}</p>
                                        
                                        {task.rejection_screenshot && (
                                            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                                <div style={{ background: '#fff', padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, color: '#ef4444', borderBottom: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Paperclip size={12} /> SUPPORTING SCREENSHOT
                                                </div>
                                                <a href={`/uploads/${task.rejection_screenshot}`} target="_blank" rel="noopener noreferrer">
                                                    <img 
                                                        src={`/uploads/${task.rejection_screenshot}`} 
                                                        alt="Rejection Screenshot" 
                                                        style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'contain', background: '#000' }} 
                                                    />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="detail-item">
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>STATUS</label>
                                    <Badge status={task.status}>{task.status}</Badge>
                                </div>
                                <div className="detail-item">
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>PRIORITY</label>
                                    <Badge status={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'}>{task.priority}</Badge>
                                </div>
                                <div className="detail-item">
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>ASSIGNEE</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={16} />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{task.assigned_name || 'Unassigned'}</span>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>DEADLINE</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                                        <Calendar size={16} />
                                        <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                {comments.map(c => (
                                    <div key={c.id} style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {c.user_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.user_name}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleString()}</span>
                                            </div>
                                            <div style={{ padding: '0.875rem 1.25rem', background: '#f8fafc', borderRadius: '0 16px 16px 16px', border: '1px solid #f1f5f9', fontSize: '0.95rem' }}>
                                                {c.comment}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                        <p>No comments yet. Start the conversation!</p>
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '1rem', padding: '1.5rem', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'sticky', bottom: 0 }}>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Type your message..." 
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    style={{ background: '#f8fafc', border: 'none' }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Project Deliverables</h3>
                                <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                                    <Plus size={16} /> Upload File
                                    <input type="file" hidden onChange={handleFileUpload} />
                                </label>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                {files.map(f => (
                                    <div key={f.id} className="card" style={{ padding: '1rem', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                            <Paperclip size={20} />
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.file_name}</div>
                                            <a href={`/uploads/${f.file_path}`} download style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>Download</a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {files.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                    <Paperclip size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                    <p>No files attached to this mission.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 2rem;
                }
                .detail-item {
                    padding: 1rem;
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                }
            `}</style>
        </div>
    );
};

export default TaskDetailsModal;
