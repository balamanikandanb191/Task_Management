import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Search, Plus, Calendar, User, X, Trash2,
  ExternalLink, LayoutGrid, List, Filter, ChevronRight,
  MessageSquare, Users, FileText, Settings, Clock,
  CheckCircle2, AlertCircle, FileUp, Download
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { getUrgencyInfo } from '../../utils/urgency';
import { useToast } from '../../context/ToastContext';
import { useCompletion } from '../../context/CompletionContext';

const PMProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/projects/${deleteConfirm.projectId}`);
      showToast('Initiative terminated successfully');
      setDeleteConfirm({ show: false, projectId: null });
      fetchProjects();
    } catch (err) {
      showToast(err.response?.data?.message || 'Authorization required for deletion', 'error');
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

  if (loading) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="pulse-animation" style={{ fontWeight: 800, color: 'var(--primary)' }}>LOADING PROJECTS...</div>
    </div>
  );

  return (
    <div className="page-wrapper fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Project Portfolio</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Manage all projects and team resources.</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: '16px', fontWeight: 800, boxShadow: '0 8px 24px var(--primary-light)' }} onClick={() => navigate('/pm/projects/create')}>
          <Plus size={20} /> Add Project
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ flex: 1, padding: '0.5rem 1.25rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={20} color="var(--text-muted)" />
          <input
            className="form-input"
            placeholder="Search initiatives, domains, or PMs..."
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
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
                borderRadius: '32px',
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
                  fontSize: '1.6rem',
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
                  BASED ON THE {project.category || 'INITIATIVE'}
                </p>
              </div>

              {/* Project Manager Info Box */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                padding: '1.25rem',
                borderRadius: '24px',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: '1px solid rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.9rem'
                }}>
                  {project.pm_name?.charAt(0) || 'M'}
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project Manager</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>{project.pm_name || 'Assigned Manager'}</div>
                </div>
              </div>

              {/* Progress Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: urgency.color,
                    fontWeight: 900
                  }}>
                    <Clock size={18} />
                    {urgency.label}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 950 }}>{project.progress}%</div>
                </div>

                {/* Deadline Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 900 }}>
                    <Calendar size={18} />
                    Deadline
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 950, color: 'var(--text-main)' }}>
                    {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not Set'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>Progress</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{project.progress}%</div>
                </div>
                <ProgressBar progress={project.progress} color={statusColor} height={8} />
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
                      borderRadius: '16px',
                      fontWeight: 800,
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={18} /> Workflow
                  </a>
                ) : (
                  <button className="btn glass" style={{ flex: 1, borderRadius: '16px', fontWeight: 800, justifyContent: 'center' }}>
                    No Workflow
                  </button>
                )}
                <button
                  className="btn glass"
                  style={{
                    flex: 1,
                    borderRadius: '16px',
                    fontWeight: 800,
                    justifyContent: 'center',
                    background: 'white',
                    color: 'var(--text-main)'
                  }}
                  onClick={() => navigate(`/pm/projects/${project.id}`)}
                >
                  Project Dashboard
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ show: true, projectId: project.id }); }}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
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
                backgroundColor: 'white', padding: '2rem', borderRadius: '24px',
                width: '360px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                position: 'relative', border: '1px solid #f1f5f9'
              }}
            >
              <button
                onClick={() => setDeleteConfirm({ show: false, projectId: null })}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '0.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>Delete Project?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                This action is permanent and cannot be undone. All project data will be lost.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={confirmDelete}
                  style={{
                    backgroundColor: 'var(--danger)', color: 'white',
                    padding: '1rem', borderRadius: '16px', fontWeight: 800,
                    flex: 1, border: 'none', cursor: 'pointer'
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm({ show: false, projectId: null })}
                  style={{
                    backgroundColor: '#f1f5f9', color: 'var(--text-main)',
                    padding: '1rem', borderRadius: '16px', fontWeight: 800,
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

export default PMProjects;
