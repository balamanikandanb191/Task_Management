import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Briefcase, CheckCircle, Clock,
  ArrowRight, Plus, AlertTriangle, Activity,
  Zap, Shield, Search, Calendar, RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const { data } = await axios.get('/api/users/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading && !stats) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ color: 'var(--primary)' }}
      >
        <RefreshCw size={48} />
      </motion.div>
    </div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="page-wrapper"
    >
      {/* Ultimate Header Section */}
      <motion.div variants={itemVariants} className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 900,
                letterSpacing: '0.05em'
              }}>
                ADMIN CONSOLE
              </span>
            </div>
            <h1 style={{ fontSize: '2.75rem', fontWeight: 950, letterSpacing: '-2px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
              Welcome <span className="text-gradient">Back</span>, {(() => {
                const name = user?.name?.split(' ')[0] || 'Admin';
                return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
              })()}.
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
              Everything is running smoothly. Here is your summary for today.
            </p>
          </div>
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
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary btn-premium"
              onClick={() => navigate('/admin/projects')}
              style={{
                padding: '0.875rem 1.75rem',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 800,
                fontSize: '1rem'
              }}
            >
              <Plus size={20} /> New Project
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <StatCard title="Global Users" value={stats?.totalUsers || 0} icon={<Users />} color="var(--primary)" />
        <StatCard title="Active Projects" value={stats?.totalProjects || 0} icon={<Briefcase />} color="#8b5cf6" />
        <StatCard title="Active Tasks" value={stats?.totalTasks || 0} icon={<CheckCircle />} color="#10b981" />
        <StatCard title="Critical Risks" value={stats?.overdueTasks || 0} icon={<AlertTriangle />} color="#ef4444" />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        {/* Main Analytics Hub */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Advanced Analytics Card */}
          <div className="card" style={{ padding: '2.5rem', borderRadius: '32px', border: '1px solid #f1f5f9', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: "'Outfit', sans-serif" }}>
                <Activity size={24} className="icon-glow" style={{ color: 'var(--primary)' }} />
                Overall Performance
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem', borderRadius: '12px' }}>
                {['D', 'W', 'M', 'Y'].map(t => (
                  <button key={t} style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: t === 'M' ? 'var(--primary)' : 'transparent',
                    color: t === 'M' ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              {/* Premium Donut Chart */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="3"></circle>
                    {(() => {
                      const completed = stats?.tasksByStatus?.find(s => s.status === 'Completed')?.count || 0;
                      const total = stats?.totalTasks || 0;
                      const percentage = total > 0 ? (completed / total) * 100 : 0;
                      return (
                        <>
                          <defs>
                            <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#2563eb" />
                              <stop offset="100%" stopColor="#7c3aed" />
                            </linearGradient>
                          </defs>
                          <motion.circle
                            initial={{ strokeDasharray: "0 100" }}
                            animate={{ strokeDasharray: `${percentage} 100` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            cx="18" cy="18" r="15.9" fill="transparent" stroke="url(#grad-blue)" strokeWidth="3"
                            strokeLinecap="round"></motion.circle>
                        </>
                      );
                    })()}
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.75rem', fontWeight: 950, letterSpacing: '-2px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
                      {stats?.totalTasks > 0 ? Math.round((stats?.tasksByStatus?.find(s => s.status === 'Completed')?.count / stats.totalTasks) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>PRECISION</div>
                  </div>
                </div>
              </div>

              {/* Refined Progress Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {stats?.tasksByStatus?.map((s, idx) => {
                  const colors = {
                    'Completed': '#10b981',
                    'In Progress': '#2563eb',
                    'Pending': '#f59e0b'
                  };
                  const total = stats?.totalTasks || 1;
                  const pct = Math.round((s.count / total) * 100);
                  return (
                    <div key={s.status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{s.status}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 900 }}>{pct}%</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                          style={{
                            height: '100%',
                            backgroundColor: colors[s.status] || 'var(--primary)',
                            borderRadius: '4px',
                            boxShadow: `0 0 10px ${colors[s.status]}40`
                          }}
                        ></motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activity Matrix Section */}
          <div className="card" style={{ padding: '2.5rem', borderRadius: '32px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>Activity History</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Tracking your team's activity over time.</p>
              </div>
              <Plus size={20} color="var(--primary)" style={{ cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', height: '140px', alignItems: 'flex-end', paddingBottom: '1rem' }}>
              {[35, 65, 45, 85, 55, 95, 75, 60, 80, 70, 90, 65].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  style={{
                    flex: 1,
                    background: h > 80 ? 'var(--grad-primary)' : 'var(--primary-soft)',
                    borderRadius: '6px 6px 2px 2px',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  whileHover={{ filter: 'brightness(1.1)', scaleY: 1.05 }}
                >
                  {i === 5 && (
                    <div style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      color: 'var(--primary)',
                      background: 'var(--primary-soft)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>{h}%</div>
                  )}
                </motion.div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '1rem' }}>
              <span>Cycle 01</span><span>Cycle 02</span><span>Cycle 03</span><span>Cycle 04</span>
            </div>
          </div>
        </motion.div>

        {/* Sidebar: Premium Activity & Insights */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Smart Activity Feed */}
          <div className="card" style={{ padding: '2rem', borderRadius: '32px', background: '#fff', border: '1px solid #f1f5f9' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>Recent Activity</h3>
              <Zap size={20} className="text-gradient" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="timeline-item"
                >
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{log.user_name || 'System Auto'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 500 }}>{log.action}</div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--primary)',
                    marginTop: '0.5rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <Clock size={12} /> {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No recent activity detected.
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, background: '#f8fafc' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/admin/logs')}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'var(--bg-main)',
                borderRadius: '16px',
                marginTop: '1.5rem',
                fontSize: '0.9rem',
                color: 'var(--primary)',
                fontWeight: 800,
                border: '1px solid var(--border-color)',
                transition: 'all 0.2s'
              }}
            >
              View All Logs
            </motion.button>
          </div>

          {/* High-Resolution System Health */}
          <div className="card" style={{
            background: 'var(--grad-dark)',
            padding: '2.5rem',
            borderRadius: '32px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)'
          }}>
            <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(60px)', opacity: 0.2 }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Shield size={22} color="#fff" />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 900 }}>System Health</h3>
            </div>
            <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '2rem', lineHeight: 1.5, fontWeight: 500 }}>
              Security active. All systems are running smoothly.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 15px #10b981' }} className="pulse-animation"></div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.05em' }}>SECURE</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
