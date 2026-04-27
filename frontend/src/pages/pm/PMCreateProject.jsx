import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Plus, Calendar, Type, 
  FileText, Rocket, Target, ShieldCheck 
} from 'lucide-react';

const PMCreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  });
  const [workflowFile, setWorkflowFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    // Use FormData for file upload support
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('deadline', formData.deadline);
    if (workflowFile) {
      data.append('workflow', workflowFile);
    }

    try {
      await axios.post('/api/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Accepted — Project and workflow initialized! 🚀');
      setTimeout(() => navigate('/pm/projects'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper fade-in" style={{ padding: '2rem 3rem', background: 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.03), transparent)' }}>
      {/* Header */}
      <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <motion.button 
          whileHover={{ x: -5 }}
          onClick={() => navigate('/pm/projects')}
          style={{ 
            width: '48px', height: '48px', borderRadius: '16px', 
            background: '#fff', border: '1px solid #f1f5f9', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', color: 'var(--text-main)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
          }}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <span className="glass" style={{ padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.1em' }}>
              NEW PROJECT
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Create a New <span className="text-gradient">Project</span>.</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'start' }}>
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card" 
          style={{ padding: '3.5rem', borderRadius: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.03)' }}
        >
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                padding: '1.25rem', marginBottom: '2.5rem', borderRadius: '16px', 
                backgroundColor: message.includes('Accepted') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                color: message.includes('Accepted') ? 'var(--success)' : 'var(--danger)', 
                fontSize: '0.95rem', fontWeight: 700, textAlign: 'center', 
                border: `1px solid ${message.includes('Accepted') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` 
              }}
            >
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Type size={16} /> Project Name
              </label>
              <input 
                type="text" 
                className="form-input" 
                style={{ borderRadius: '18px', padding: '1.5rem', fontSize: '1.1rem', background: '#f8fafc', border: '2px solid transparent', transition: 'all 0.3s' }} 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. Quantum System Expansion" 
                required 
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} /> Project Description
              </label>
              <textarea 
                className="form-input" 
                style={{ borderRadius: '18px', padding: '1.5rem', fontSize: '1.1rem', minHeight: '180px', resize: 'none', background: '#f8fafc', border: '2px solid transparent' }} 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Define the core objectives and scope of this project..." 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '3.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} /> Deadline
              </label>
              <input 
                type="date" 
                className="form-input" 
                style={{ borderRadius: '18px', padding: '1.5rem', fontSize: '1.1rem', background: '#f8fafc', border: '2px solid transparent' }} 
                value={formData.deadline} 
                onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '3.5rem' }}>
              <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Rocket size={16} /> Workflow Document (PDF/Word)
              </label>
              <div style={{ position: 'relative' }}>
                 <input 
                   type="file" 
                   accept=".pdf,.doc,.docx"
                   style={{ 
                     width: '100%', padding: '1.5rem', borderRadius: '18px', 
                     border: '2px dashed var(--border-color)', background: '#fff',
                     cursor: 'pointer'
                   }} 
                   onChange={(e) => setWorkflowFile(e.target.files[0])} 
                 />
                 {workflowFile && (
                   <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={14} /> {workflowFile.name} Selected
                   </div>
                 )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button 
                type="button" 
                className="btn" 
                style={{ flex: 1, borderRadius: '20px', padding: '1.25rem', fontWeight: 800, background: '#fff', fontSize: '1rem' }} 
                onClick={() => navigate('/pm/projects')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 2, borderRadius: '20px', padding: '1.25rem', fontWeight: 800, fontSize: '1rem', boxShadow: '0 10px 30px -5px var(--primary-light)' }} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Initializing...' : 'Initialize Project'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info/Guide Section */}
        <div style={{ paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem' }}>Project Setup <span className="text-gradient">Tips</span></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Target size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>Define Clear Objectives</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>Successful projects start with precise scoping. Ensure your description outlines the key deliverables.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Rocket size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>Set Realistic Timelines</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>Deadlines help keep the team on track. Use the deadline date to set expectations for the team.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>Team Assignment</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>Once created, you can begin assigning team members to this project in the Team Management section.</p>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ marginTop: '4rem', padding: '2rem', borderRadius: '24px', background: 'var(--grad-dark)', color: '#fff' }}>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.75rem' }}>Project Tip</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.6 }}>
              The first 48 hours of a project are crucial. Consider posting an update in the Project Discussion as soon as it's created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PMCreateProject;
