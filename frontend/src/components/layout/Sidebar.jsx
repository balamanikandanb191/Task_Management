import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CheckSquare,
  PieChart,
  Settings,
  LogOut,
  Layers,
  ClipboardList,
  CheckCircle2,
  FileUp,
  History,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/admin' },
      { id: 'users', label: 'Manage Users', icon: <Users size={22} />, path: '/admin/users' },
      { id: 'projects', label: 'Manage Projects', icon: <Briefcase size={22} />, path: '/admin/projects' },
      { id: 'teams', label: 'Manage Teams', icon: <Layers size={22} />, path: '/admin/teams' },
      { id: 'tasks', label: 'Manage Tasks', icon: <ClipboardList size={22} />, path: '/admin/tasks' },
      { id: 'documentation', label: 'Documentation', icon: <FileText size={22} />, path: '/admin/documentation' },
      { id: 'logs', label: 'Log Details', icon: <History size={22} />, path: '/admin/logs' },
      { id: 'reports', label: 'Reports', icon: <PieChart size={22} />, path: '/admin/reports' },
    ],
    project_manager: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/pm' },
      { id: 'projects', label: 'Projects', icon: <Briefcase size={22} />, path: '/pm/projects' },
      { id: 'teams', label: 'Teams', icon: <Layers size={22} />, path: '/pm/teams' },
      { id: 'tasks', label: 'Task Overview', icon: <ClipboardList size={22} />, path: '/pm/task-overview' },
      { id: 'documentation', label: 'Documentation', icon: <FileText size={22} />, path: '/pm/documentation' },
      { id: 'reports', label: 'Reports', icon: <PieChart size={22} />, path: '/pm/reports' },
    ],
    team_leader: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/tl' },
      { id: 'my-tasks', label: 'My Tasks', icon: <CheckSquare size={22} />, path: '/tl/my-tasks' },
      { id: 'assigned', label: 'Assigned Projects', icon: <Briefcase size={22} />, path: '/tl/projects' },
      { id: 'tasks', label: 'Tasks Management', icon: <ClipboardList size={22} />, path: '/tl/tasks' },
      { id: 'members', label: 'Team Members', icon: <Users size={22} />, path: '/tl/members' },
      { id: 'approvals', label: 'Approvals', icon: <CheckCircle2 size={22} />, path: '/tl/approvals' },
      { id: 'documentation', label: 'Documentation', icon: <FileText size={22} />, path: '/tl/documentation' },
    ],
    team_member: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/tm' },
      { id: 'my-tasks', label: 'My Tasks', icon: <CheckSquare size={22} />, path: '/tm/my-tasks' },
      { id: 'upload', label: 'Upload Work', icon: <FileUp size={22} />, path: '/tm/upload' },
      { id: 'history', label: 'Task History', icon: <History size={22} />, path: '/tm/history' },
    ],
  };

  const navItems = menuItems[user.role] || [];

  return (
    <aside className="glass-sidebar" style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      padding: '2rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      boxShadow: '10px 0 30px rgba(0,0,0,0.1)'
    }}>
      <div style={{ padding: '0 0.75rem', marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'var(--grad-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 8px 16px rgba(37, 99, 235, 0.4)'
        }}>
          <CheckCircle2 size={26} />
        </div>
        <span style={{
          fontWeight: 900,
          fontSize: '1.5rem',
          color: '#fff',
          letterSpacing: '-1.5px',
          fontFamily: "'Outfit', sans-serif"
        }}>
          Task<span style={{ color: 'var(--primary-light)' }}>Master</span>
        </span>
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '0 0.75rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Principal Menu</p>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.id === 'dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.9rem 1.25rem',
              borderRadius: '14px',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              backgroundColor: isActive ? 'var(--sidebar-item-active)' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.95rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
            })}
            className={({ isActive }) => isActive ? 'icon-glow' : ''}
          >
            {({ isActive }) => (
              <>
                <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                <span style={{ fontFamily: "'Outfit', sans-serif" }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '0 0.75rem'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'var(--grad-primary)',
            border: '2px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {user.avatar ? (
              <img src={`http://localhost:5173${user.avatar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontWeight: 900, color: 'white' }}>{user.name.charAt(0)}</div>
            )}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800 }}>{user.role.replace('_', ' ')}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            color: '#ff4d4d',
            backgroundColor: 'rgba(255,77,77,0.05)',
            fontWeight: 700,
            fontSize: '0.95rem',
            textAlign: 'left',
            transition: 'all 0.2s',
            border: '1px solid transparent',
            fontFamily: "'Outfit', sans-serif"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255,77,77,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,77,77,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255,77,77,0.05)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <LogOut size={22} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
