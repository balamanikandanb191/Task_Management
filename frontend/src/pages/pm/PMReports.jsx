import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  PieChart, BarChart3, TrendingUp, Download, 
  Calendar, Users, Briefcase, FileText,
  CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';

const PMReports = () => {
  const [reportData, setReportData] = useState({
    projects: [],
    tasks: [],
    users: [],
    loading: true
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [projRes, taskRes, userRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/tasks'),
        axios.get('/api/users')
      ]);
      setReportData({
        projects: projRes.data.data,
        tasks: taskRes.data.data,
        users: userRes.data.data,
        loading: false
      });
    } catch (err) {
      console.error(err);
      setReportData(prev => ({ ...prev, loading: false }));
    }
  };

  if (reportData.loading) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="pulse-animation" style={{ fontWeight: 800, color: 'var(--primary)' }}>LOADING REPORTS...</div>
    </div>
  );

  const stats = {
    avgProgress: Math.round(reportData.projects.reduce((acc, p) => acc + p.progress, 0) / (reportData.projects.length || 1)),
    completionRate: Math.round((reportData.tasks.filter(t => t.status === 'Completed').length / (reportData.tasks.length || 1)) * 100),
    overdueTasks: reportData.tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Completed').length,
    activeTeams: reportData.projects.length // simplified
  };

  return (
    <div className="page-wrapper fade-in" style={{ padding: '2rem 2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Performance Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>View data and progress for all projects.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', gap: '0.75rem', fontWeight: 800, padding: '1rem 1.75rem', borderRadius: '16px' }}>
          <Download size={20} /> Download Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Overall Progress" value={`${stats.avgProgress}%`} icon={<TrendingUp />} color="#7c3aed" />
        <StatCard title="Completion Rate" value={`${stats.completionRate}%`} icon={<CheckCircle2 />} color="#10b981" />
        <StatCard title="Team Members" value={reportData.users.length} icon={<Users />} color="#2563eb" />
        <StatCard title="Overdue Tasks" value={stats.overdueTasks} icon={<AlertCircle />} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Project Performance List */}
        <div className="card" style={{ padding: '2.5rem', borderRadius: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Briefcase size={20} color="var(--primary)" /> Project Progress
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reportData.projects.map(project => (
              <div key={project.id} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>{project.title}</span>
                  <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{project.progress}%</span>
                </div>
                <div style={{ height: '8px', background: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${project.progress}%`, height: '100%', background: 'var(--grad-primary)', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                   <span>Status: {project.status.toUpperCase()}</span>
                   <span>•</span>
                   <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div className="card" style={{ padding: '2.5rem', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BarChart3 size={20} color="var(--primary)" /> Task Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                 {[
                   { label: 'Completed Tasks', count: reportData.tasks.filter(t => t.status === 'Completed').length, color: '#10b981' },
                   { label: 'Pending Approval', count: reportData.tasks.filter(t => t.approval_status === 'pending_review').length, color: '#eab308' },
                   { label: 'In Progress', count: reportData.tasks.filter(t => t.status === 'In Progress').length, color: '#2563eb' },
                   { label: 'Overdue / At Risk', count: stats.overdueTasks, color: '#ef4444' }
                 ].map((item, i) => (
                   <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                         <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color }} />
                         <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.label}</span>
                      </div>
                      <span style={{ fontWeight: 900 }}>{item.count}</span>
                   </div>
                 ))}
              </div>
              <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '24px', textAlign: 'center' }}>
                 <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Performance Change</div>
                 <div style={{ fontSize: '2rem', fontWeight: 950, color: 'var(--success)' }}>+14.2%</div>
                 <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>FROM LAST MONTH</div>
              </div>
           </div>

           <div className="card" style={{ background: 'var(--grad-dark)', padding: '2rem', borderRadius: '32px', color: '#fff' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.75rem' }}>Project Insight</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6 }}>
                Project completion is projected to increase by 8% if high-priority tasks are finished in the next 48 hours.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PMReports;
