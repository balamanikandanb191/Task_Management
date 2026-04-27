import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';

const Topbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get('/api/notifications');
      setUnreadCount(data.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  if (!user) return null;

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'white',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px', width: '300px' }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search tasks, projects..."
          style={{ background: 'none', border: 'none', marginLeft: '0.5rem', outline: 'none', fontSize: '0.875rem', width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button
          onClick={() => navigate('/notifications')}
          style={{ position: 'relative', border: 'none', background: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }}
          className="hover-bg"
        >
          <Bell size={20} color={unreadCount > 0 ? 'var(--primary)' : 'var(--text-muted)'} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: 'var(--danger)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 900,
              minWidth: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user.role.replace('_', ' ')}
            </div>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
