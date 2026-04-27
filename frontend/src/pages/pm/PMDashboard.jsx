import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { getUrgencyInfo } from '../../utils/urgency';
import { 
  Briefcase, Layers, CheckSquare, Plus, 
  ExternalLink, Calendar, TrendingUp, Activity, 
  Clock, Bell, User, ArrowUpRight, MessageSquare,
  ShieldCheck, AlertTriangle
} from 'lucide-react';

const PMDashboard = () => {
  const [data, setData] = useState({
    projects: [],
    activities: [],
    tasks: [],
    loading: true
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projRes, activityRes, taskRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/activity'),
        axios.get('/api/tasks')
      ]);
      setData({
        projects: projRes.data.data,
        activities: activityRes.data.data.slice(0, 8),
        tasks: taskRes.data.data,
        loading: false
      });
    } catch (err) {
      console.error('Dashboard Sync Error:', err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  if (data.loading) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="pulse-animation" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.2em' }}>
        LOADING DASHBOARD...
      </div>
    </div>
  );

  const stats = {
    total: data.projects.length,
    active: data.projects.filter(p => p.status === 'active').length,
    completed: data.projects.filter(p => p.status === 'completed').length,
    health: Math.round((data.projects.filter(p => p.progress > 60).length / (data.projects.length || 1)) * 100),
    pendingTasks: data.tasks.filter(t => t.approval_status === 'pending_review').length,
    approvedTasks: data.tasks.filter(t => t.approval_status === 'approved').length
  };

  return (
    <div className="page-wrapper fade-in" style={{ padding: '2rem 2.5rem', background: 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.03), transparent)' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span className="glass" style={{ padding: '0.5rem 1.25rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.1em' }}>
              PROJECT DASHBOARD
            </span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-2px', lineHeight: 0.9, marginBottom: '0.75rem' }}>
            Welcome <span className="text-gradient">Back</span>, {(() => {
              const name = user?.name?.split(' ')[0] || 'Manager';
              return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            })()}.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', fontWeight: 500 }}>
            You have <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{stats.total} Projects</span> and <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{data.tasks.length} Active Tasks</span>.
          </p>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Calendar size={14} />
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>|</span>
            <Clock size={14} />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <button className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: '16px', fontWeight: 800, boxShadow: '0 8px 24px var(--primary-light)', display: 'flex', gap: '0.75rem', alignItems: 'center' }} onClick={() => navigate('/pm/projects/create')}>
            <Plus size={20} /> Add Project
          </button>
        </div>
      </div>

      {/* Primary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Active Projects" value={stats.active} icon={<Layers />} color="#7c3aed" />
        <StatCard title="Completed Tasks" value={stats.approvedTasks} icon={<CheckSquare />} color="#10b981" />
        <StatCard title="Waiting for Approval" value={stats.pendingTasks} icon={<ShieldCheck />} color="#2563eb" />
        <StatCard title="Project Progress" value={`${stats.health}%`} icon={<TrendingUp />} color="#06b6d4" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        
        {/* Project Velocity Monitor */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.5px' }}>Project List</h3>
            <button className="btn" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }} onClick={() => navigate('/pm/projects')}>View All</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {data.projects.slice(0, 4).map(project => {
              const urgency = getUrgencyInfo(project.deadline);
              const isCompleted = project.status === 'completed';
              return (
                <motion.div 
                  key={project.id} 
                  className={`card glass-hover ${isCompleted ? 'card-success' : ''}`} 
                  style={{ padding: '1.75rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }} 
                  whileHover={{ scale: 1.01 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <Badge status={project.status}>{project.status}</Badge>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>#{project.id}</span>
                      </div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{project.title}</h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: urgency.color }}>{project.progress}%</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>COMPLETION</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <ProgressBar progress={project.progress} color={isCompleted ? 'var(--success)' : urgency.color} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: urgency.color, fontWeight: 700 }}>
                        <Clock size={14} /> {urgency.label}: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} style={{ background: 'rgba(0,0,0,0.03)', padding: '0.4rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate(`/pm/projects?id=${project.id}`)}>
                      Details <ArrowUpRight size={14} />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Updates Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Operations Activity */}
          <div className="card" style={{ padding: '2rem', borderRadius: '32px', minHeight: '400px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity size={20} color="var(--primary)" /> Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {data.activities.map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  {i !== data.activities.length - 1 && <div style={{ position: 'absolute', left: '17px', top: '35px', bottom: '-20px', width: '2px', background: '#f1f5f9' }}></div>}
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #f1f5f9' }}>
                    <User size={16} color="var(--text-muted)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.15rem' }}>{act.action}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.entity_type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity Guard */}
          <div className="card" style={{ background: 'var(--grad-dark)', color: '#fff', padding: '2rem', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 900, marginBottom: '0.5rem' }}>Task Notice</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                You have <span style={{ fontWeight: 900, color: '#facc15' }}>{stats.pendingTasks} tasks</span> waiting for approval.
              </p>
              <button 
                onClick={() => navigate('/pm/tasks')}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                View Tasks
              </button>
            </div>
            <AlertTriangle size={80} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, color: '#fff', transform: 'rotate(-15deg)' }} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default PMDashboard;
