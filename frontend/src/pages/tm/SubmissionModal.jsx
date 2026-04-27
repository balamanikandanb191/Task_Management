import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, FileText, Upload, CheckCircle2, 
  AlertCircle, Briefcase, MessageSquare, 
  Loader2, ShieldCheck, Download, Link
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useCompletion } from '../../context/CompletionContext';

const SubmissionModal = ({ isOpen, onClose, task, onSuccess }) => {
  const { triggerCelebration } = useCompletion();
  const [description, setDescription] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  
  const reportInputRef = useRef(null);
  const zipInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'report') {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['doc', 'docx', 'pdf'].includes(ext)) {
        showToast('Invalid format. Report must be a Word document (.doc, .docx) or PDF', 'error');
        return setError('Report must be a Word document (.doc, .docx) or PDF');
      }
      setReportFile(file);
    } else {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext !== 'zip') {
        showToast('Invalid format. Project file must be a ZIP archive (.zip)', 'error');
        return setError('Project file must be a ZIP archive (.zip)');
      }
      setZipFile(file);
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportFile || !zipFile || !description.trim()) {
      showToast('Deployment incomplete. All deliverables are mandatory.', 'error');
      return setError('All deliverables (Report, ZIP, and Description) are mandatory.');
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Upload Report
      const reportData = new FormData();
      reportData.append('file', reportFile);
      await axios.post(`/api/files/upload/${task.id}`, reportData);

      // 2. Upload ZIP
      const zipData = new FormData();
      zipData.append('file', zipFile);
      await axios.post(`/api/files/upload/${task.id}`, zipData);

      // 3. Update Task Status & Notes
      await axios.put(`/api/tasks/${task.id}`, {
        status: 'Completed',
        submission_notes: description,
        submission_link: submissionLink
      });

      showToast('Mission accomplished. Deliverables uploaded and synchronization engaged.', 'success');
      triggerCelebration(task.title);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Submission failed', err);
      const msg = err.response?.data?.message || 'Link failure. Submission aborted.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      zIndex: 2000, padding: '1.5rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ 
          backgroundColor: 'white', 
          width: '100%', maxWidth: '650px', 
          borderRadius: '32px', 
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
          border: '1px solid #f1f5f9'
        }}
      >
        {/* Header */}
        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--grad-primary)', color: 'white' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>Finalize Deliverables</h2>
            <p style={{ opacity: 0.9, fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}>Task: {task.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '12px', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2.5rem' }}>
          {error && (
            <div style={{ 
              backgroundColor: '#fff1f2', color: '#e11d48', padding: '1rem 1.25rem', 
              borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', 
              gap: '0.75rem', fontSize: '0.9rem', fontWeight: 700, border: '1px solid #ffe4e6'
            }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Word Report Upload */}
            <div 
              onClick={() => reportInputRef.current.click()}
              style={{
                border: reportFile ? '2px solid var(--success)' : '2px dashed #e2e8f0',
                borderRadius: '24px', padding: '2rem 1.5rem', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s', background: reportFile ? '#f0fdf4' : '#f8fafc'
              }}
            >
              <input type="file" ref={reportInputRef} onChange={(e) => handleFileChange(e, 'report')} hidden accept=".doc,.docx,.pdf" />
              {reportFile ? (
                <>
                  <div style={{ color: 'var(--success)', marginBottom: '0.75rem' }}><ShieldCheck size={40} style={{ margin: '0 auto' }} /></div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#166534' }}>{reportFile.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>Report Verified</div>
                </>
              ) : (
                <>
                  <div style={{ color: '#94a3b8', marginBottom: '0.75rem' }}><FileText size={40} style={{ margin: '0 auto' }} /></div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>Word Report</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>DOCX or PDF required</div>
                </>
              )}
            </div>

            {/* ZIP Upload */}
            <div 
              onClick={() => zipInputRef.current.click()}
              style={{
                border: zipFile ? '2px solid var(--success)' : '2px dashed #e2e8f0',
                borderRadius: '24px', padding: '2rem 1.5rem', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s', background: zipFile ? '#f0fdf4' : '#f8fafc'
              }}
            >
              <input type="file" ref={zipInputRef} onChange={(e) => handleFileChange(e, 'zip')} hidden accept=".zip" />
              {zipFile ? (
                <>
                  <div style={{ color: 'var(--success)', marginBottom: '0.75rem' }}><ShieldCheck size={40} style={{ margin: '0 auto' }} /></div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#166534' }}>{zipFile.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>Project ZIP Verified</div>
                </>
              ) : (
                <>
                  <div style={{ color: '#94a3b8', marginBottom: '0.75rem' }}><Upload size={40} style={{ margin: '0 auto' }} /></div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>Project ZIP</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Source files required</div>
                </>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link size={14} /> REPOSITORY / PROJECT URL (OPTIONAL)
            </label>
            <input 
              type="url"
              className="form-input" 
              style={{ borderRadius: '20px', padding: '1.25rem', fontSize: '1rem', background: '#f8fafc' }}
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={14} /> SUBMISSION DESCRIPTION
            </label>
            <textarea 
              className="form-input" 
              style={{ borderRadius: '20px', padding: '1.25rem', minHeight: '120px', fontSize: '1rem', background: '#f8fafc' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail what you've achieved, specific features implemented, and any technical hurdles cleared..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="btn" 
              style={{ flex: 1, padding: '1rem', borderRadius: '16px', fontWeight: 800, background: '#f1f5f9' }}
              disabled={isSubmitting}
            >
              Back to Task
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                flex: 2, padding: '1rem', borderRadius: '16px', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="spin" />
                  UPLOADING ASSETS...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  SUBMIT FOR REVIEW
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <style>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SubmissionModal;
