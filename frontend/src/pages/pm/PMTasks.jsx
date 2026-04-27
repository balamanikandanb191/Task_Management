import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Search, Filter, Calendar, User, 
  CheckCircle2, Clock, AlertCircle, ChevronDown, 
  ArrowUpRight, Target, Flag, Layers, Plus, Trash2, Edit2, X,
  FileText, Upload
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { getUrgencyInfo } from '../../utils/urgency';
import TaskSubmissionModal from '../../components/common/TaskSubmissionModal';
import { Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const PMTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all'
  });
  
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    priority: 'Medium',
    assigned_to: '',
    deadline: '',
    status: 'Pending'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const [projects, setProjects] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, taskId: null });
  const [submissionView, setSubmissionView] = useState({ isOpen: false, task: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, projRes, userRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/projects'),
        axios.get('/api/users') // PM gets TLs and TMs via this endpoint
      ]);
      setTasks(taskRes.data.data);
      setProjects(projRes.data.data);
      setAssignees(userRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.project_id) return showToast('Title and Project are required', 'error');
    setIsSubmitting(true);
    try {
      const { data } = await axios.post('/api/tasks', formData);
      const newTaskId = data.data.id;

      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append('file', selectedFile);
        await axios.post(`/api/files/upload/${newTaskId}`, fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      showToast('Task launched successfully!');
      setTimeout(() => { setView('list'); fetchData(); resetForm(); }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create task', 'error');
    } finally { setIsSubmitting(false); }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!formData.title) return showToast('Title is required', 'error');
    setIsSubmitting(true);
    try {
      await axios.put(`/api/tasks/${editingTask.id}`, formData);
      showToast('Task updated successfully!');
      setTimeout(() => { setView('list'); fetchData(); resetForm(); }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally { setIsSubmitting(false); }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/tasks/${deleteConfirm.taskId}`);
      showToast('Task terminated successfully');
      setDeleteConfirm({ show: false, taskId: null });
      fetchData();
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  const openEditView = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      project_id: task.project_id || '',
      priority: task.priority || 'Medium',
      assigned_to: task.assigned_to || '',
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      status: task.status || 'Pending'
    });
    setView('edit');
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', project_id: '', priority: 'Medium', assigned_to: '', deadline: '', status: 'Pending' });
    setEditingTask(null);
    setSelectedFile(null);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.project_title?.toLowerCase().includes(search.toLowerCase()) ||
                          t.assigned_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filters.status === 'all' || t.status === filters.status;
    const matchesPriority = filters.priority === 'all' || t.priority === filters.priority;
    const matchesProject = filters.project === 'all' || t.project_id.toString() === filters.project;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const getUserRole = (userId, taskRole) => {
    if (taskRole && taskRole !== 'SYSTEM') return taskRole;
    const user = assignees.find(u => u.id === userId);
    return user ? user.role : taskRole || 'team_member';
  };

  if (loading) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="pulse-animation" style={{ fontWeight: 800, color: 'var(--primary)' }}>LOADING TASKS...</div>
    </div>
  );

  if (view === 'create' || view === 'edit') {
    const isEdit = view === 'edit';
    return (
      <div className="page-wrapper fade-in" style={{ padding: '2rem 3rem' }}>
        <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <motion.button 
            whileHover={{ x: -5 }}
            onClick={() => setView('list')}
            style={{ 
              width: '48px', height: '48px', borderRadius: '16px', 
              background: '#fff', border: '1px solid #f1f5f9', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', color: 'var(--text-main)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
            }}
          >
            <ChevronDown style={{ transform: 'rotate(90deg)' }} size={24} />
          </motion.button>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>{isEdit ? 'Modify Task' : 'Launch New Task'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.4rem' }}>{isEdit ? `Updating parameters for ${editingTask?.title}` : 'Define task scope and delegation.'}</p>
          </div>
        </div>

        <form onSubmit={isEdit ? handleUpdateTask : handleCreateTask}>
          <div className="card" style={{ padding: '3.5rem', borderRadius: '40px', maxWidth: '1000px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ borderRadius: '18px', padding: '1.25rem' }} 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Implement GraphQL API" required 
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Scope Description</label>
                <textarea 
                  className="form-input" 
                  style={{ borderRadius: '18px', padding: '1.25rem', minHeight: '120px', resize: 'vertical' }} 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Detail the technical requirements..." 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Initiative (Project)</label>
                <select className="form-input" style={{ borderRadius: '18px', padding: '1.25rem' }} value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})} required>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Execution Priority</label>
                <select className="form-input" style={{ borderRadius: '18px', padding: '1.25rem' }} value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assignee Delegation</label>
                <select className="form-input" style={{ borderRadius: '18px', padding: '1.25rem' }} value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}>
                  <option value="">Select Assignee</option>
                  {assignees.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Strategic Deadline</label>
                <input 
                  type="date" 
                  className="form-input" 
                  style={{ borderRadius: '18px', padding: '1.25rem' }} 
                  value={formData.deadline} 
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} /> TECHNICAL BRIEF / REPORT (OPTIONAL)
                </label>
                <div style={{ position: 'relative', border: '2px dashed #e2e8f0', borderRadius: '18px', padding: '2rem', textAlign: 'center', transition: 'all 0.2s', backgroundColor: selectedFile ? '#f0f9ff' : 'transparent', borderColor: selectedFile ? '#3b82f6' : '#e2e8f0' }}>
                   <input 
                     type="file" 
                     onChange={(e) => setSelectedFile(e.target.files[0])}
                     style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                   />
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Upload size={24} color={selectedFile ? '#3b82f6' : '#94a3b8'} />
                      {selectedFile ? (
                        <div style={{ fontWeight: 700, color: '#1e40af' }}>{selectedFile.name} <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span></div>
                      ) : (
                        <div style={{ color: '#94a3b8', fontWeight: 600 }}>Click or drag a strategic document to attach</div>
                      )}
                   </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3.5rem' }}>
              <button type="button" className="btn" style={{ flex: 1, borderRadius: '18px', padding: '1.25rem', fontWeight: 800 }} onClick={() => setView('list')}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2, borderRadius: '18px', padding: '1.25rem', fontWeight: 800 }} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : (isEdit ? 'Commit Changes' : 'Initialize Task')}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in" style={{ padding: '2rem 2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Task Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>View and manage all tasks across the company.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setView('create'); }}
          className="btn btn-primary"
          style={{ padding: '1rem 2rem', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 25px -5px var(--primary-light)' }}
        >
          <Plus size={20} /> Initialize Task
        </motion.button>
      </div>

      {/* Advanced Filters */}
      <div className="card" style={{ padding: '2rem', borderRadius: '32px', marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)' }}>SEARCH</label>
            <div style={{ position: 'relative' }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                className="form-input" 
                placeholder="Search by task, member, or project..." 
                style={{ paddingLeft: '3.5rem', borderRadius: '16px', background: '#f8fafc' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROJECT</label>
            <select className="form-input" style={{ borderRadius: '16px', background: '#f8fafc' }} value={filters.project} onChange={(e) => setFilters({...filters, project: e.target.value})}>
              <option value="all">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRIORITY</label>
            <select className="form-input" style={{ borderRadius: '16px', background: '#f8fafc' }} value={filters.priority} onChange={(e) => setFilters({...filters, priority: e.target.value})}>
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)' }}>TASK STATUS</label>
            <select className="form-input" style={{ borderRadius: '16px', background: '#f8fafc' }} value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="pending_review">TL Review</option>
              <option value="tl_approved">Final Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="card" style={{ padding: 0, borderRadius: '32px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>TASK</th>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>PROJECT</th>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>TEAM MEMBER</th>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>STATUS / APPROVAL</th>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>DEADLINE</th>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => {
              const urgency = getUrgencyInfo(task.deadline);
              return (
                <motion.tr 
                  key={task.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${urgency.color}15`, color: urgency.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Target size={20} />
                       </div>
                       <div>
                          <div style={{ fontWeight: 900, fontSize: '1rem' }}>{task.title} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>#{task.id}</span></div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                             <Flag size={12} /> {task.priority} Priority
                          </div>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                       <Layers size={16} color="var(--primary)" />
                       {task.project_title}
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                       <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.8rem' }}>
                          {task.assigned_name?.charAt(0) || '?'}
                       </div>
                       <div>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', display: 'block', color: 'var(--text-main)' }}>{task.assigned_name || 'UNASSIGNED'}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.1rem', display: 'block' }}>
                            {getUserRole(task.assigned_to, task.assigned_to_role).replace('_', ' ')}
                          </span>
                       </div>
                    </div>
                  </td>

                  <td style={{ padding: '1.5rem 2rem' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Badge status={task.status}>{task.status}</Badge>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: task.approval_status === 'tl_approved' ? 'var(--primary)' : 'var(--text-muted)' }}>
                           {task.approval_status === 'approved' ? (
                             <><CheckCircle2 size={12} color="var(--success)" /> FULLY APPROVED</>
                           ) : task.approval_status === 'tl_approved' ? (
                             <><Clock size={12} color="var(--primary)" /> FINAL SIGN-OFF REQUIRED</>
                           ) : task.approval_status === 'pending_review' ? (
                             <><Clock size={12} color="#f59e0b" /> TM SUBMITTED (TL REVIEW)</>
                           ) : (
                             <><Clock size={12} /> Pending</>
                           )}
                        </div>
                     </div>
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                       <div style={{ fontSize: '0.95rem', fontWeight: 900, color: urgency.color }}>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'TBD'}</div>
                       <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{urgency.label}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                     <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        {(task.status === 'Completed' || task.status === 'Review' || task.approval_status === 'pending_review' || task.approval_status === 'tl_approved') && (
                          <button onClick={() => setSubmissionView({ isOpen: true, task })} style={{ color: task.approval_status === 'tl_approved' ? 'var(--primary)' : 'var(--success)', background: task.approval_status === 'tl_approved' ? 'var(--primary-soft)' : 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '10px', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }} title={task.approval_status === 'tl_approved' ? "Process Final Approval" : "View Submission"}><Eye size={18} /></button>
                        )}
                       <button onClick={() => openEditView(task)} style={{ color: 'var(--primary)', background: 'var(--primary-soft)', padding: '10px', borderRadius: '10px', transition: 'all 0.2s' }} title="Edit Task"><Edit2 size={18} /></button>
                       <button onClick={() => setDeleteConfirm({ show: true, taskId: task.id })} style={{ color: 'var(--danger)', background: '#fef2f2', padding: '10px', borderRadius: '10px', transition: 'all 0.2s' }} title="Delete Task"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {filteredTasks.length === 0 && (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
             <Search size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
             <p style={{ fontWeight: 600 }}>No tasks found matching your search.</p>
          </div>
        )}
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
                onClick={() => setDeleteConfirm({ show: false, taskId: null })}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '0.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>Delete Task?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                This action is permanent and cannot be undone. All task data will be lost.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={confirmDelete}
                  style={{ 
                    backgroundColor: 'var(--danger)', color: 'white', 
                    padding: '1rem', borderRadius: '16px', fontWeight: 800,
                    flex: 1
                  }}
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setDeleteConfirm({ show: false, taskId: null })}
                  style={{ 
                    backgroundColor: '#f1f5f9', color: 'var(--text-main)', 
                    padding: '1rem', borderRadius: '16px', fontWeight: 800,
                    flex: 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TaskSubmissionModal 
        isOpen={submissionView.isOpen} 
        onClose={() => setSubmissionView({ isOpen: false, task: null })} 
        task={submissionView.task} 
      />
    </div>
  );
};

export default PMTasks;
