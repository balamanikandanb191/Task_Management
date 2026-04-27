import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Search, Plus, Calendar, User, X, Trash2,
  Clock, Download, CheckCircle2, FileUp, List,
  MessageSquare, Users, FileText, Settings, AlertCircle
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { getUrgencyInfo } from '../../utils/urgency';
import { useToast } from '../../context/ToastContext';
import { useCompletion } from '../../context/CompletionContext';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list'); // 'list', 'create'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    workflow: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const { triggerCelebration, stopCelebration } = useCompletion();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, projectId: null });
  const [filterMode, setFilterMode] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  // Sync global success mode with filter status
  useEffect(() => {
    if (filterMode === 'completed') {
      document.body.classList.add('celebration-mode');
    } else {
      // Small delay to prevent flickering if just finished celebrating
      const timer = setTimeout(() => {
        if (filterMode !== 'completed') {
          document.body.classList.remove('celebration-mode');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filterMode]);


  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/projects');
      setProjects(data.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) {
      return showToast('Please fill all required fields', 'error');
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('deadline', formData.deadline);
    if (formData.workflow) {
      data.append('workflow', formData.workflow);
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Initiative launched successfully!');
      setTimeout(() => {
        setView('list');
        fetchProjects();
        setFormData({ title: '', description: '', deadline: '', workflow: null });
      }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Deployment failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/projects/${deleteConfirm.projectId}`);
      showToast('Initiative terminated successfully');
      setDeleteConfirm({ show: false, projectId: null });
      fetchProjects();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete project', 'error');
      setDeleteConfirm({ show: false, projectId: null });
    }
  };

  const handleCompleteProject = async (project) => {
    try {
      await axios.put(`/api/projects/${project.id}`, { status: 'completed' });
      showToast('Project finalized successfully!');
      triggerCelebration(project.title);
      fetchProjects();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete project', 'error');
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterMode === 'all' || p.status === filterMode;
    return matchesSearch && matchesFilter;
  });

  if (loading && projects.length === 0) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="pulse-animation" style={{ fontWeight: 800, color: 'var(--primary)' }}>INITIALIZING PORTFOLIO...</div>
    </div>
  );

  if (view === 'create') {
    return (
      <div className="page-wrapper fade-in" style={{ padding: '2rem 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Project Blueprint</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Define scope and technical parameters for new initiatives.</p>
          </div>
          <button className="btn glass" onClick={() => setView('list')} style={{ borderRadius: '14px', fontWeight: 800, padding: '0.75rem 1.5rem' }}>Abort Mission</button>
        </div>

        <form onSubmit={handleCreateProject} style={{ maxWidth: '900px' }}>
          <div className="card" style={{ padding: '3rem', borderRadius: '32px', marginBottom: '3rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem' }}>PROJECT TITLE</label>
                <input
                  className="form-input"
                  style={{ borderRadius: '18px', padding: '1.25rem' }}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Strategic Tech Overhaul 2026"
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem' }}>STRATEGIC SCOPE</label>
                <textarea
                  className="form-input"
                  style={{ borderRadius: '18px', padding: '1.25rem', minHeight: '120px' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Defining core objectives, deliverables, and technical constraints..."
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem' }}>TARGET COMPLETION</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="date"
                    className="form-input"
                    style={{ borderRadius: '18px', padding: '1.25rem 1.25rem 1.25rem 3.5rem' }}
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem' }}>PROJECT WORKFLOW (PDF / DOC)</label>
                <div style={{ position: 'relative' }}>
                  <FileUp size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="file"
                    className="form-input"
                    style={{ borderRadius: '18px', padding: '1.25rem 1.25rem 1.25rem 3.5rem' }}
                    onChange={(e) => setFormData({ ...formData, workflow: e.target.files[0] })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, padding: '1.25rem', borderRadius: '18px', fontWeight: 800, fontSize: '1rem', boxShadow: '0 12px 32px var(--primary-light)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'DEPLOYING INITIATIVE...' : 'LAUNCH STRATEGIC PROJECT'}
            </button>
            <button
              type="button"
              className="btn glass"
              style={{ flex: 1, borderRadius: '18px', fontWeight: 800 }}
              onClick={() => setView('list')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in" style={{ padding: '2rem 3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Project Portfolio</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Managing <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{projects.length} strategic initiatives</span>.</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: '16px', fontWeight: 800, boxShadow: '0 8px 24px var(--primary-light)' }} onClick={() => setView('create')}>
          <Plus size={20} /> Add Project
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3.5rem' }}>
        <div className="card" style={{ flex: 1, padding: '0.5rem 1.25rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #f1f5f9' }}>
          <Search size={20} color="var(--text-muted)" />
          <input
            className="form-input"
            placeholder="Filter by initiative title, project manager, or scope..."
            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '1rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '18px' }}>
          {['all', 'completed'].map(m => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '14px',
                fontSize: '0.85rem',
                fontWeight: 800,
                background: filterMode === m ? 'var(--primary)' : 'transparent',
                color: filterMode === m ? '#fff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2.5rem' }}>
        {filteredProjects.map(project => {
          const urgency = getUrgencyInfo(project.deadline);
          const isCompleted = project.status === 'completed';
          const statusColor = isCompleted ? '#10b981' : urgency.color;
          const bgTint = `${statusColor}08`; // 5% opacity hex
          const borderTint = `${statusColor}40`; // 25% opacity hex for border if not completed

          return (
            <motion.div
              key={project.id}
              className="card glass-hover"
              style={{
                padding: '2.5rem',
                borderRadius: '36px',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: isCompleted ? '#f0fdf4' : bgTint,
                border: `2px solid ${isCompleted ? '#10b981' : borderTint}`,
                boxShadow: isCompleted ? '0 20px 40px rgba(16, 185, 129, 0.1)' : 'var(--shadow-sm)'
              }}
              whileHover={{ y: -8, boxShadow: 'var(--shadow-xl)' }}
            >
              {/* Status Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <Badge status={project.status}>{project.status.toUpperCase()}</Badge>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted ? '#10b981' : 'var(--primary)'
                }}>
                  <Briefcase size={24} />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.65rem',
                  fontWeight: 950,
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: '-1px',
                  lineHeight: 1.2,
                  color: 'var(--text-main)',
                  textTransform: 'uppercase'
                }}>
                  {project.title}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                  letterSpacing: '1px'
                }}>
                  BASED ON THE {project.category || 'CORPORATE INITIATIVE'}
                </p>
              </div>

              {/* Project Manager Info Box */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '1.25rem',
                borderRadius: '24px',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: '1px solid rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--grad-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px var(--primary-light)'
                }}>
                  {project.pm_name?.charAt(0) || 'A'}
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Manager</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>{project.pm_name || 'Admin Controlled'}</div>
                </div>
              </div>

              {/* Progress Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.95rem',
                    color: statusColor,
                    fontWeight: 900
                  }}>
                    <Clock size={18} />
                    {urgency.label}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-main)' }}>{project.progress}%</div>
                </div>

                {/* Deadline Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 900 }}>
                    <Calendar size={18} />
                    Deadline
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 950, color: 'var(--text-main)' }}>
                    {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not Set'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>Progress</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{project.progress}%</div>
                </div>
                <ProgressBar progress={project.progress} color={statusColor} height={10} />
              </div>

              {/* Action Footer */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                {project.workflow_path ? (
                  <a
                    href={`/uploads/${project.workflow_path}`}
                    download
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '18px',
                      fontWeight: 800,
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={18} /> Workflow
                  </a>
                ) : (
                  <button className="btn glass" style={{ flex: 1, borderRadius: '18px', fontWeight: 800, justifyContent: 'center' }}>
                    No Workflow
                  </button>
                )}
                <button
                  className="btn glass"
                  style={{
                    flex: 1,
                    borderRadius: '18px',
                    fontWeight: 800,
                    justifyContent: 'center',
                    background: 'white',
                    color: 'var(--text-main)',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  Project Dashboard
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ show: true, projectId: project.id }); }}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '18px',
                    background: 'rgba(239, 68, 68, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--danger)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title="Terminate Project"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Delete Confirmation Drawer */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
            padding: '2rem', zIndex: 1100
          }}>
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              style={{
                backgroundColor: 'white', padding: '2.5rem', borderRadius: '32px',
                width: '380px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                position: 'relative', border: '1px solid #f1f5f9'
              }}
            >
              <button
                onClick={() => setDeleteConfirm({ show: false, projectId: null })}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              <h3 style={{ fontSize: '1.65rem', marginBottom: '1rem', marginTop: '0.5rem', fontWeight: 950, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>Delete Project?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                This action is permanent and cannot be undone. All project data, team associations, and task history will be lost.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={confirmDelete}
                  style={{
                    backgroundColor: 'var(--danger)', color: 'white',
                    padding: '1.1rem', borderRadius: '18px', fontWeight: 800,
                    flex: 1, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm({ show: false, projectId: null })}
                  style={{
                    backgroundColor: '#f1f5f9', color: 'var(--text-main)',
                    padding: '1.1rem', borderRadius: '18px', fontWeight: 800,
                    flex: 1, border: 'none', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProjects;
