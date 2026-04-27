import React, { useState } from 'react';
import axios from 'axios';
import { X, CheckCircle2, XCircle, AlertCircle, MessageSquare, Download, FileText, FolderArchive, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useCompletion } from '../../context/CompletionContext';

const ReviewModal = ({ task, onClose, onUpdate }) => {
    const { triggerCelebration } = useCompletion();
    const [status, setStatus] = useState('approve'); // approve or reject
    const [reason, setReason] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = React.useState([]);
    const { showToast } = useToast();

    React.useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const { data } = await axios.get(`/api/files/task/${task.id}`);
            setFiles(data.data || []);
        } catch (err) {
            console.error('Failed to fetch files', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status === 'reject' && !reason.trim()) {
            showToast('Strategic requirement: Please provide a reason for return.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            if (status === 'approve') {
                await axios.put(`/api/tasks/${task.id}/approve`);
            } else {
                const formData = new FormData();
                formData.append('rejection_reason', reason);
                if (screenshot) {
                    formData.append('screenshot', screenshot);
                }
                await axios.put(`/api/tasks/${task.id}/reject`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            showToast(status === 'approve' ? 'Deliverable validated and finalized.' : 'Deliverable returned for technical revision.', 'success');
            if (status === 'approve') triggerCelebration(task.title);
            onUpdate();
            onClose();
        } catch (err) {
            console.error('Review failed', err);
            showToast('Protocol failure. Review processing suspended.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
        <div className="modal-overlay" onClick={onClose}>
            <form 
                onSubmit={handleSubmit}
                className="card fade-in" 
                onClick={e => e.stopPropagation()} 
                style={{ 
                    maxWidth: '500px', width: '100%', padding: '2rem', borderRadius: '32px',
                    maxHeight: '90vh', display: 'flex', flexDirection: 'column'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.50rem', fontWeight: 900 }}>Validation Review</h2>
                    <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', marginBottom: '2rem', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>DELIVERABLE</div>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>{task.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Submitted by {task.assigned_name}</div>
                        
                        {task.submission_notes && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <MessageSquare size={12} /> MEMBER DESCRIPTION
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                    {task.submission_notes}
                                </div>
                            </div>
                        )}

                        {task.submission_link && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <ExternalLink size={12} /> EXTERNAL SUBMISSION LINK
                                </div>
                                <a 
                                    href={task.submission_link.startsWith('http') ? task.submission_link : `https://${task.submission_link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', wordBreak: 'break-all' }}
                                >
                                    {task.submission_link}
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        )}

                        {files.length > 0 && (
                            <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {files.map(file => (
                                    <a 
                                        key={file.id} 
                                        href={`/uploads/${file.file_path}`} 
                                        download={file.file_name}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                            padding: '0.5rem 0.75rem', background: '#fff', 
                                            borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
                                            color: 'var(--text-main)', textDecoration: 'none', border: '1px solid #e2e8f0',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                    >
                                        {file.file_name.toLowerCase().endsWith('.zip') ? <FolderArchive size={14} /> : <FileText size={14} />}
                                        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.file_name}</span>
                                        <Download size={12} />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <button 
                            type="button"
                            onClick={() => setStatus('approve')}
                            style={{ 
                                padding: '1rem', borderRadius: '16px', border: '2px solid',
                                borderColor: status === 'approve' ? 'var(--success)' : '#f1f5f9',
                                background: status === 'approve' ? 'rgba(16, 185, 129, 0.05)' : 'white',
                                color: status === 'approve' ? 'var(--success)' : 'var(--text-muted)',
                                fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
                            }}
                        >
                            <CheckCircle2 size={24} />
                            <span>Validate</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setStatus('reject')}
                            style={{ 
                                padding: '1rem', borderRadius: '16px', border: '2px solid',
                                borderColor: status === 'reject' ? 'var(--danger)' : '#f1f5f9',
                                background: status === 'reject' ? 'rgba(239, 68, 68, 0.05)' : 'white',
                                color: status === 'reject' ? 'var(--danger)' : 'var(--text-muted)',
                                fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
                            }}
                        >
                            <XCircle size={24} />
                            <span>Return</span>
                        </button>
                    </div>

                    {status === 'reject' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    Reason for Return
                                    <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 800 }}>REQUIRED</span>
                                </label>
                                <textarea 
                                    className="form-input" 
                                    style={{ minHeight: '120px', borderRadius: '16px', background: '#fff' }} 
                                    placeholder="Explain what needs to be improved..."
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={14} /> Supporting Screenshot (Optional)
                                </label>
                                <div style={{ 
                                    position: 'relative', 
                                    border: '2px dashed #e2e8f0', 
                                    borderRadius: '16px', 
                                    padding: '1.5rem', 
                                    textAlign: 'center',
                                    backgroundColor: screenshot ? 'rgba(59, 130, 246, 0.05)' : 'white',
                                    borderColor: screenshot ? 'var(--primary)' : '#e2e8f0',
                                    transition: 'all 0.2s'
                                }}>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={e => setScreenshot(e.target.files[0])}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <Download size={20} color={screenshot ? 'var(--primary)' : '#94a3b8'} />
                                        {screenshot ? (
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                {screenshot.name}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                                                Drop an image here to clarify the feedback
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
                    <button type="button" className="btn" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
                    <button 
                        type="submit" 
                        className={`btn ${status === 'approve' ? 'btn-primary' : 'btn-danger'}`} 
                        style={{ flex: 2, background: status === 'approve' ? '#059669' : '#ef4444' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : status === 'approve' ? 'Confirm Validation' : 'Confirm Return'}
                    </button>
                </div>
            </form>
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
            .btn-danger { background: #ef4444; color: white; }
            .btn-danger:hover { background: #dc2626; }
        `}</style>
        </>
    );
};

export default ReviewModal;
