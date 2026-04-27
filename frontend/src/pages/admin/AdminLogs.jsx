import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, RefreshCcw, Calendar, User as UserIcon, Shield } from 'lucide-react';
import Badge from '../../components/common/Badge';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    userId: 'All Users',
    startDate: '',
    endDate: ''
  });

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    (log.user_name && log.user_name.toLowerCase().includes(search.toLowerCase())) ||
    (log.user_email && log.user_email.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/activity', { params: filters });
      setLogs(data.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleReset = () => {
    setFilters({ userId: 'All Users', startDate: '', endDate: '' });
    // setTimeout to allow state to update before fetch
    setTimeout(fetchLogs, 100);
  };

  return (
    <div className="page-wrapper fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Log Details</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor system activities and login records.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <form onSubmit={handleApplyFilter} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>User ID/Email</label>
            <input 
              type="text"
              className="form-input" 
              placeholder="All Users"
              value={filters.userId === 'All Users' ? '' : filters.userId} 
              onChange={(e) => setFilters({...filters, userId: e.target.value || 'All Users'})}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Start Date</label>
            <input 
              type="datetime-local" 
              className="form-input" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>End Date</label>
            <input 
              type="datetime-local" 
              className="form-input" 
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} /> Apply Filter
          </button>
          <button type="button" className="btn" onClick={handleReset} style={{ height: '42px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCcw size={16} /> Reset
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Login Records</h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by action or user..." 
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>S.NO</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>USER ID</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>ROLE</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>LOGIN DATE & TIME RANGE</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>MODULE NAME</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading records...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>No records found.</td></tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>{index + 1}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{log.user_id || 'SYSTEM'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.user_email}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <Badge status="info">{log.user_role || 'system'}</Badge>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {log.entity_type || 'General'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <Badge status={log.action.toLowerCase().includes('logged in') ? 'success' : 'info'}>
                        {log.action.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing {logs.length} Entries
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} disabled>Previous</button>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>1</button>
            <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
