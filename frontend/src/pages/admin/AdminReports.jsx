import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../../components/common/StatCard';
import ExportDropdown from '../../components/common/ExportDropdown';
import { PieChart, Download, Filter, FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, BarChart, Users, Shield } from 'lucide-react';

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/users/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const { data } = await axios.get('/api/tasks');
      // Format data for export
      return data.data.map(task => ({
        Title: task.title,
        Project: task.project_title,
        Status: task.status,
        Priority: task.priority,
        Assigned_To: task.assigned_name || 'Unassigned',
        Deadline: new Date(task.deadline).toLocaleDateString(),
        Approval: task.approval_status
      }));
    } catch (err) {
      console.error('Failed to fetch tasks for export', err);
      return [];
    }
  };

  if (loading) return <div className="page-wrapper">Generating strategic reports...</div>;

  const totalTasks = stats?.totalTasks || 0;
  const completedTasks = stats?.tasksByStatus?.find(s => s.status === 'Completed')?.count || 0;
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="page-wrapper fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Analytics Engine</h1>
          <p style={{ color: 'var(--text-muted)' }}>Deep-dive into organizational performance and resource efficiency.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ExportDropdown 
            filename={`admin-full-report-${new Date().toISOString().split('T')[0]}`} 
            onBeforeExport={fetchAllTasks} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard title="Task Success Rate" value={`${successRate}%`} icon={<TrendingUp />} color="#10b981" />
        <StatCard title="Overdue Criticality" value={stats?.overdueTasks || 0} icon={<AlertTriangle />} color="#ef4444" />
        <StatCard title="Resource Density" value={`${Math.round(stats?.totalTasks / (stats?.totalUsers || 1))} tasks/user`} icon={<Users />} color="#7c3aed" />
        <StatCard title="Active Projects" value={stats?.totalProjects || 0} icon={<BarChart />} color="#2563eb" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Clock size={18} /> Performance Velocity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {stats?.tasksByStatus?.map(s => (
              <div key={s.status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600 }}>{s.status}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{s.count} ({Math.round((s.count/totalTasks)*100)}%)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(s.count / totalTasks) * 100}%`, 
                    height: '100%', 
                    backgroundColor: s.status === 'Completed' ? 'var(--success)' : (s.status === 'In Progress' ? 'var(--primary)' : 'var(--warning)') 
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} /> Organizational Structure
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {stats?.byRole?.map(r => (
              <div key={r.role}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600 }}>{r.role.replace('_', ' ').toUpperCase()}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{r.count} accounts</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(r.count / stats.totalUsers) * 100}%`, height: '100%', backgroundColor: '#7c3aed' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
         <h3 style={{ marginBottom: '1rem' }}>Project Risk Assessment</h3>
         <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Projects classified by proximity to deadline and task completion percentage.</p>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
               <div style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.5rem' }}>STABLE</div>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>DEADLINE &gt; 7 DAYS</div>
            </div>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
               <div style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '1.5rem' }}>WATCH</div>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>DEADLINE 4-7 DAYS</div>
            </div>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
               <div style={{ color: '#f97316', fontWeight: 800, fontSize: '1.5rem' }}>URGENT</div>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>DEADLINE 2-4 DAYS</div>
            </div>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'var(--danger)' }}>
               <div style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '1.5rem' }}>CRITICAL</div>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>DEADLINE &lt; 2 DAYS</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminReports;
