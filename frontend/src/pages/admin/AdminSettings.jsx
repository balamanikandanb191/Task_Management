import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, User, Bell, Shield, Moon, Globe } from 'lucide-react';

const AdminSettings = () => {
  const { user } = useAuth();

  return (
    <div className="page-wrapper fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure your profile and system preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 280px) 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '1rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn" style={{ justifyContent: 'flex-start', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: 'var(--primary)' }}>
              <User size={18} />
              Account Profile
            </button>
            <button className="btn" style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}>
              <Bell size={18} />
              Notifications
            </button>
            <button className="btn" style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}>
              <Shield size={18} />
              Security
            </button>
            <button className="btn" style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}>
              <Moon size={18} />
              Appearance
            </button>
            <button className="btn" style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}>
              <Globe size={18} />
              Integrations
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" defaultValue={user?.name} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" defaultValue={user?.email} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Organization</label>
                <input type="text" className="form-input" defaultValue="TaskMaster Global" />
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Save Changes</button>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Email Notifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>New Task Assignments</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get notified when a task is assigned to you.</div>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Project Updates</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Receive updates on projects you are watching.</div>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>System Maintenance</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Notifications regarding scheduled downtime.</div>
                </div>
                <input type="checkbox" />
              </div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>System Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Default Task Priority</label>
                <select className="form-input">
                  <option>Medium</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Auto-Lock Completed Projects</label>
                <select className="form-input">
                  <option>Enabled</option>
                  <option>Disabled</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Session Timeout (minutes)</label>
                <input type="number" className="form-input" defaultValue="60" />
              </div>
              <div className="form-group">
                <label className="form-label">Max File Upload Size (MB)</label>
                <input type="number" className="form-input" defaultValue="10" />
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Apply System Config</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
