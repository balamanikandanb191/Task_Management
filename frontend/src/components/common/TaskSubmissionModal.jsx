import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle2, Clock, AlertCircle, 
  MessageSquare, Download, FileText, 
  FolderArchive, Target, User, Calendar, ExternalLink
} from 'lucide-react';
import Badge from './Badge';

const TaskSubmissionModal = ({ isOpen, onClose, task }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && task) {
      fetchFiles();
    }
  }, [isOpen, task]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/files/task/${task.id}`);
      setFiles(data.data || []);
    } catch (err) {
      console.error('Failed to fetch files', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      zIndex: 2500, padding: '1.5rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ 
          backgroundColor: 'white', 
          width: '100%', maxWidth: '600px', 
          borderRadius: '32px', 
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
          border: '1px solid #f1f5f9'
        }}
      >
        {/* Header */}
        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>Submission Intel</h2>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Badge status={task.status}>{task.status.toUpperCase()}</Badge>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Protocol #{task.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '2.5rem' }}>
          {/* Task Info Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Operative</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9rem' }}>
                    <User size={14} color="var(--primary)" /> {task.assigned_name || 'System'}
                </div>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Submitted On</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9rem' }}>
                    <Calendar size={14} color="var(--primary)" /> {task.submitted_at ? new Date(task.submitted_at).toLocaleDateString() : 'N/A'}
                </div>
            </div>
          </div>

          {/* Submission Notes */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={14} /> MISSION DEBRIEF
            </div>
            <div style={{ 
                padding: '1.5rem', background: '#fff', borderRadius: '20px', 
                border: '1.5px solid #f1f5f9', fontSize: '0.95rem', 
                color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' 
            }}>
                {task.submission_notes || 'No debrief provided for this mission pulse.'}
            </div>
          </div>

          {/* Submission Link */}
          {task.submission_link && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ExternalLink size={14} /> EXTERNAL SUBMISSION LINK
              </div>
              <a 
                href={task.submission_link.startsWith('http') ? task.submission_link : `https://${task.submission_link}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '1.25rem 1.5rem', background: 'var(--primary-soft)', 
                    borderRadius: '20px', border: '1px solid var(--primary-light)',
                    textDecoration: 'none', color: 'var(--primary)', fontWeight: 800,
                    fontSize: '0.95rem', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.submission_link}
                </div>
                <ExternalLink size={18} />
              </a>
            </div>
          )}

          {/* Assets */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={14} /> DIGITAL ASSETS
            </div>
            {loading ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Retrieving assets...</div>
            ) : files.length > 0 ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {files.map(file => (
                        <a 
                            key={file.id} 
                            href={`/uploads/${file.file_path}`} 
                            download={file.file_name}
                            style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '16px',
                                border: '1px solid #f1f5f9', textDecoration: 'none', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {file.file_name.toLowerCase().endsWith('.zip') ? 
                                    <FolderArchive size={20} color="#f59e0b" /> : 
                                    <FileText size={20} color="#2563eb" />
                                }
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{file.file_name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(file.file_size / 1024).toFixed(1)} KB</div>
                                </div>
                            </div>
                            <Download size={18} color="var(--text-muted)" />
                        </a>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #e2e8f0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No digital assets associated with this submission.
                </div>
            )}
          </div>

          <button 
            onClick={onClose} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', borderRadius: '16px', fontWeight: 900 }}
          >
            DISMISS INTEL
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskSubmissionModal;
