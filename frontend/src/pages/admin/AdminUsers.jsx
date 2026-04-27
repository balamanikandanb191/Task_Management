import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../../components/common/Badge';
import { 
  Users, Search, Plus, X, Shield, CheckCircle2, Edit2, Trash2, Key, RefreshCw, Calendar
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [editingUser, setEditingUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'team_member'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, userId: null });
  const [resetRequests, setResetRequests] = useState([]);
  const [fetchingRequests, setFetchingRequests] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchResetRequests();
  }, []);

  const fetchResetRequests = async () => {
    try {
      setFetchingRequests(true);
      const { data } = await axios.get('/api/users/reset-requests');
      setResetRequests(data.data);
    } catch (err) {
      console.error('Failed to fetch reset requests', err);
    } finally {
      setFetchingRequests(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/users');
      setUsers(data.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name) return showToast('Full name is required', 'error');
    if (!formData.email) return showToast('Email address is required', 'error');
    if (!formData.password) return showToast('Password is required', 'error');
    if (!formData.confirmPassword) return showToast('Please confirm password', 'error');
    if (formData.password.length < 6) return showToast('Password must be at least 6 characters long', 'error');
    if (formData.password !== formData.confirmPassword) return showToast('Passwords do not match', 'error');

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('role', formData.role);
      if (selectedFile) {
        data.append('avatar', selectedFile);
      }

      await axios.post('/api/auth/register', data);
      
      showToast('User created successfully!', 'success');
      setTimeout(() => {
        setView('list');
        fetchUsers();
        resetForm();
      }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return showToast('Name and Email are required', 'error');

    setIsSubmitting(true);
    try {
      await axios.put(`/api/users/${editingUser.id}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
      showToast('User updated successfully!', 'success');
      setTimeout(() => {
        setView('list');
        fetchUsers();
        resetForm();
      }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.password) return showToast('New password is required', 'error');
    if (formData.password !== formData.confirmPassword) return showToast('Passwords do not match', 'error');

    setIsSubmitting(true);
    try {
      await axios.put(`/api/users/${editingUser.id}/password`, {
        newPassword: formData.password
      });
      showToast('Password reset successfully!', 'success');
      setTimeout(() => {
        setView('list');
        resetForm();
      }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Reset failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, userId: id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.userId;
    try {
      await axios.delete(`/api/users/${id}`);
      showToast('User deleted successfully', 'success');
      setDeleteConfirm({ show: false, userId: null });
      fetchUsers();
    } catch (err) {
      showToast('Failed to delete user', 'error');
    }
  };

  const handleRequestAction = async (requestId, userId, status) => {
    try {
      await axios.put(`/api/users/reset-requests/${requestId}`, { status });
      if (status === 'approved') {
        const user = users.find(u => u.id === userId);
        if (user) {
          openPasswordView(user);
          showToast('Request approved. Please set the new password.', 'success');
        }
      } else {
        showToast('Request rejected.', 'info');
      }
      fetchResetRequests();
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const openEditView = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setView('edit');
  };

  const openPasswordView = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setView('password');
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'team_member' });
    setSelectedFile(null);
    setFilePreview(null);
    setEditingUser(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading && users.length === 0) return (
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

  // Render for Create, Edit, or Password
  if (view === 'create' || view === 'edit' || view === 'password') {
    const isEdit = view === 'edit';
    const isPassword = view === 'password';

    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="page-wrapper">
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-2px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
              {isPassword ? 'Reset Password' : (isEdit ? 'Modify Access' : 'Onboard Member')}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
              {isPassword ? `Updating security credentials for ${editingUser?.name}` : (isEdit ? `Updating profile permissions for ${editingUser?.name}` : 'Adding a new verified member to the system.')}
            </p>
          </div>
          <button className="btn" onClick={() => setView('list')} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', fontWeight: 800 }}>
            Back to Directory
          </button>
        </motion.div>

        <form onSubmit={isPassword ? handleResetPassword : (isEdit ? handleUpdateUser : handleCreateUser)} noValidate>
          <motion.div variants={itemVariants} className="card" style={{ marginBottom: '2rem', padding: '2.5rem', borderRadius: '32px' }}>
            {isPassword ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" style={{ borderRadius: '12px' }} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">Verify Password</label>
                  <input type="password" className="form-input" style={{ borderRadius: '12px' }} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="••••••••" />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Legal Name</label>
                  <input type="text" className="form-input" style={{ borderRadius: '12px' }} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Electronic Mail</label>
                  <input type="email" className="form-input" style={{ borderRadius: '12px' }} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                </div>
                
                {!isEdit && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-input" style={{ borderRadius: '12px' }} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Verify Password</label>
                      <input type="password" className="form-input" style={{ borderRadius: '12px' }} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="••••••••" />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label className="form-label">System Privileges</label>
                  <select className="form-input" style={{ borderRadius: '12px' }} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="admin">Administrator</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="team_member">Collaborator</option>
                  </select>
                </div>

                {!isEdit && (
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Profile Visualization</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '24px', 
                        background: 'white', 
                        border: '2px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Plus size={32} color="#94a3b8" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>Select a professional display identity (JPG, PNG, WebP supported).</p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          id="avatar-upload"
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="avatar-upload" className="btn" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}>
                          Choose Image File
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', marginBottom: '4rem' }}>
            <button type="button" className="btn" onClick={() => setView('list')} style={{ background: 'white', border: '1px solid var(--border-color)', padding: '0.75rem 2rem', fontWeight: 800 }}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-premium" style={{ padding: '0.75rem 2.5rem', fontWeight: 800 }} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : (isPassword ? 'Reset Access' : (isEdit ? 'Sync Changes' : 'Finalize Onboarding'))}
            </button>
          </motion.div>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="page-wrapper">
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
                HUMAN RESOURCES
              </span>
            </div>
            <h1 style={{ fontSize: '2.75rem', fontWeight: 950, letterSpacing: '-2px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
              Access <span className="text-gradient">Control</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
              Strategic oversight for <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{users.length} verified system agents</span>.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary btn-premium" style={{ padding: '0.875rem 1.75rem', borderRadius: '14px', fontWeight: 800 }} onClick={() => { resetForm(); setView('create'); }}>
            <Plus size={20} /> Onboard User
          </motion.button>
        </div>
      </motion.div>

      {/* Password Reset Requests Section */}
      {resetRequests.length > 0 && (
        <motion.div variants={itemVariants} className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '32px', border: '1px solid #fee2e2', background: '#fff', marginBottom: '2.5rem' }}>
          <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid #fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Key size={20} color="#ef4444" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: '#991b1b' }}>Pending Security Requests</h3>
            </div>
            <span style={{ background: '#ef4444', color: '#fff', padding: '0.2rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800 }}>{resetRequests.length} URGENT</span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#fff5f5', borderBottom: '1px solid #fee2e2' }}>
                  <th style={{ padding: '1rem 2.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Identity</th>
                  <th style={{ padding: '1rem 2.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Signal</th>
                  <th style={{ padding: '1rem 2.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Timestamp</th>
                  <th style={{ padding: '1rem 2.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Authorization</th>
                </tr>
              </thead>
              <tbody>
                {resetRequests.map((req, i) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #fef2f2' }}>
                    <td style={{ padding: '1.25rem 2.5rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{req.user_name}</div>
                    </td>
                    <td style={{ padding: '1.25rem 2.5rem' }}>
                      <code style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>{req.email}</code>
                    </td>
                    <td style={{ padding: '1.25rem 2.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(req.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '1.25rem 2.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleRequestAction(req.id, req.user_id, 'approved')}
                          className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '8px', background: '#10b981' }}>
                          Approve & Reset
                        </button>
                        <button 
                          onClick={() => handleRequestAction(req.id, req.user_id, 'rejected')}
                          className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid #fee2e2', color: '#ef4444' }}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '32px', border: '1px solid #f1f5f9', background: '#fff' }}>
        <div style={{ padding: '1.75rem 2.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>Directory Interface</h3>
          <div style={{ position: 'relative', width: '380px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by identity or signal..." 
              className="form-input" 
              style={{ paddingLeft: '3rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem 2.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Identity</th>
                <th style={{ padding: '1.25rem 2.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Strategic Role</th>
                <th style={{ padding: '1.25rem 2.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pulse</th>
                <th style={{ padding: '1.25rem 2.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enrolled</th>
                <th style={{ padding: '1.25rem 2.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Interactions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={u.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fcfdfe'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '1.5rem 2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '14px', 
                        backgroundColor: 'var(--primary-soft)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 900, 
                        color: 'var(--primary)', 
                        fontSize: '1.2rem',
                        overflow: 'hidden'
                      }}>
                        {u.avatar ? (
                          <img src={`http://localhost:5173${u.avatar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          u.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px' }}>{u.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 2.5rem' }}>
                    <Badge status={u.role === 'admin' ? 'success' : 'info'}>
                      {u.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: '1.5rem 2.5rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.is_active ? '#10b981' : '#ef4444' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{u.is_active ? 'Online' : 'Offline'}</span>
                     </div>
                  </td>
                  <td style={{ padding: '1.5rem 2.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} />
                      {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 2.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openPasswordView(u)} style={{ color: '#f59e0b', padding: '10px', background: '#fff7ed', borderRadius: '10px' }} title="Change Password"><Key size={18} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEditView(u)} style={{ color: 'var(--primary)', padding: '10px', background: 'var(--primary-soft)', borderRadius: '10px' }} title="Edit User"><Edit2 size={18} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteClick(u.id)} style={{ color: 'var(--danger)', padding: '10px', background: '#fef2f2', borderRadius: '10px' }} title="Delete User"><Trash2 size={18} /></motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              padding: '2rem', zIndex: 1100 
            }}>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ 
                backgroundColor: 'white', padding: '2.5rem', borderRadius: '32px', 
                width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                position: 'relative'
              }}>
              <button 
                onClick={() => setDeleteConfirm({ show: false, userId: null })}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '1.5rem' }}>
                <Trash2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>Confirm Removal</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.5, fontWeight: 500 }}>
                This action is irreversible. All associated data for this identity will be purged from the system.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setDeleteConfirm({ show: false, userId: null })}
                  style={{ 
                    backgroundColor: '#f8fafc', color: 'var(--text-main)', 
                    padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 800,
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  style={{ 
                    backgroundColor: '#ef4444', color: 'white', 
                    padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 800,
                    flex: 1,
                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  Purge User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUsers;
