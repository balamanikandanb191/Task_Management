import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Plus, Search, Filter, Calendar, User, X, CheckSquare, Clock, AlertCircle, ChevronRight, ChevronDown, FileText, Upload } from 'lucide-react';
import TaskDetailsModal from '../../components/tasks/TaskDetailsModal';
import { useToast } from '../../context/ToastContext';

const TLTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);
    const [members, setMembers] = useState([]);
    const [allMembers, setAllMembers] = useState([]); // Global registry for role lookup
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const { user } = useAuth();

    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_id: '',
        team_id: '',
        assigned_to: '',
        priority: 'Medium',
        deadline: '',
        parent_task_id: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, projectsRes, teamsRes, usersRes] = await Promise.all([
                axios.get('/api/tasks'),
                axios.get('/api/projects'),
                axios.get('/api/teams'),
                axios.get('/api/users')
            ]);
            setTasks(tasksRes.data.data);
            setProjects(projectsRes.data.data);
            setTeams(teamsRes.data.data);
            setAllMembers(usersRes.data.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    // When project changes, filter teams and fetch members
    useEffect(() => {
        if (formData.project_id) {
            const projectTeams = teams.filter(t => t.project_id === parseInt(formData.project_id));
            if (projectTeams.length > 0) {
                // If there's only one team, select it automatically
                if (projectTeams.length === 1) {
                    setFormData(prev => ({ ...prev, team_id: projectTeams[0].id }));
                    fetchTeamMembers(projectTeams[0].id);
                }
            }
        }
    }, [formData.project_id, teams]);

    const fetchTeamMembers = async (teamId) => {
        if (!teamId) return;
        setMembers([]); // Reset members while loading
        try {
            const { data } = await axios.get(`/api/teams/${teamId}`);
            if (data.success && data.data && data.data.members) {
                setMembers(data.data.members);
            } else {
                console.error('Invalid member data structure', data);
                setMembers([]);
            }
        } catch (err) {
            console.error('Failed to fetch members', err);
            showToast('Warning: Synchronization delayed. Team roster partially loaded.', 'error');
            setMembers([]);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await axios.post('/api/tasks', formData);
            if (selectedFile) {
                const fileFormData = new FormData();
                fileFormData.append('file', selectedFile);
                await axios.post(`/api/files/upload/${data.data.id}`, fileFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            showToast('Strategic task assigned and synchronization engaged.', 'success');
            setFormData({ title: '', description: '', project_id: '', team_id: '', assigned_to: '', priority: 'Medium', deadline: '' });
            setSelectedFile(null);
            fetchData();
            setTimeout(() => {
                setShowModal(false);
            }, 1500);
        } catch (err) {
            showToast(err.response?.data?.message || 'Protocol failure. Task assignment rejected.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.project_title?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || t.status === filter;
        const isNotPersonal = t.assigned_to !== user.id;
        return matchesSearch && matchesFilter && isNotPersonal;
    });

    const getUserRole = (userId, taskRole) => {
        if (taskRole) return taskRole;
        const member = allMembers.find(m => m.id === userId);
        return member ? member.role : 'team_member';
    };

    if (loading) return <div className="page-wrapper">Loading task management...</div>;

    return (
        <div className="page-wrapper fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Task Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Assign work to your team and monitor execution.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Assign New Task
                </button>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search tasks or projects..."
                        className="form-input"
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'pending', 'in_progress', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                backgroundColor: filter === f ? 'var(--primary)' : 'white',
                                color: filter === f ? 'white' : 'var(--text-muted)',
                                border: filter === f ? 'none' : '1px solid var(--border-color)',
                                textTransform: 'capitalize'
                            }}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Task Details</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Project</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Team Member</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Approval</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map(task => {
                            if (task.parent_task_id) return null; // We'll render subtasks under parents

                            const subtasks = filteredTasks.filter(st => st.parent_task_id === task.id);

                            return (
                                <React.Fragment key={task.id}>
                                    <tr
                                        onClick={() => setSelectedTaskId(task.id)}
                                        style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {subtasks.length > 0 && <div style={{ color: 'var(--primary)' }}><ChevronDown size={14} /></div>}
                                                <div style={{ fontWeight: 600 }}>{task.title}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                                                <Calendar size={12} />
                                                <span>Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No date'}</span>
                                                <User size={12} style={{ marginLeft: '0.5rem' }} />
                                                <span>By: {task.created_by_name || 'Admin'}</span>
                                                {task.file_count > 0 && <span style={{ marginLeft: '1rem', color: '#2563eb', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><FileText size={12} /> BRIEF ATTACHED</span>}
                                                {subtasks.length > 0 && <span style={{ marginLeft: '1rem', color: 'var(--primary)', fontWeight: 700 }}>{subtasks.length} Subtasks</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem' }}>
                                            <Badge status="info">{task.project_title}</Badge>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                                                    {task.assigned_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>{task.assigned_name || 'Not assigned'}</span>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{getUserRole(task.assigned_to, task.assigned_to_role).replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <Badge status={task.status}>{task.status.replace('_', ' ')}</Badge>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {task.approval_status === 'approved' ? <CheckSquare size={16} color="var(--success)" /> :
                                                    task.approval_status === 'rejected' ? <AlertCircle size={16} color="var(--danger)" /> :
                                                        <Clock size={16} color="var(--warning)" />}
                                                <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{task.approval_status?.replace('_', ' ') || 'Pending'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Subtasks rendering */}
                                    {subtasks.map(sub => (
                                        <tr
                                            key={sub.id}
                                            onClick={() => setSelectedTaskId(sub.id)}
                                            style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: 'rgba(248, 250, 252, 0.5)' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.5)'}
                                        >
                                            <td style={{ padding: '0.75rem 1.5rem 0.75rem 3rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <ChevronRight size={12} color="var(--text-muted)" />
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{sub.title}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1.5rem', opacity: 0.5 }}><Badge status="info">{sub.project_title}</Badge></td>
                                            <td style={{ padding: '0.75rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600 }}>
                                                        {sub.assigned_name?.charAt(0) || '?'}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem' }}>{sub.assigned_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1.5rem' }}>
                                                <Badge status={sub.status}>{sub.status.replace('_', ' ')}</Badge>
                                            </td>
                                            <td style={{ padding: '0.75rem 1.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.approval_status?.replace('_', ' ')}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
                {filteredTasks.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No tasks found matching your criteria.
                    </div>
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card fade-in" style={{ maxWidth: '600px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: 'var(--text-muted)' }}><X size={20} /></button>
                        <h2 style={{ marginBottom: '1.5rem' }}>Assign New Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <div className="form-group">
                                <label className="form-label">Task Title</label>
                                <input type="text" className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Design User Interface" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" style={{ minHeight: '100px', resize: 'vertical' }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What needs to be done?" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Project</label>
                                    <select className="form-input" value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })} required>
                                        <option value="">Select Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Team</label>
                                    <select
                                        className="form-input"
                                        value={formData.team_id}
                                        onChange={(e) => {
                                            setFormData({ ...formData, team_id: e.target.value });
                                            if (e.target.value) fetchTeamMembers(e.target.value);
                                        }}
                                        required
                                        disabled={!formData.project_id}
                                    >
                                        <option value="">Select Team</option>
                                        {teams.filter(t => t.project_id === parseInt(formData.project_id)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Assign To</label>
                                    <select className="form-input" value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} required disabled={!formData.team_id}>
                                        <option value="">{members.length === 0 ? 'Searching for Team Members...' : 'Select Member'}</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <select className="form-input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} required>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Parent Task (Optional - for Subtasks)</label>
                                <select
                                    className="form-input"
                                    value={formData.parent_task_id}
                                    onChange={(e) => setFormData({ ...formData, parent_task_id: e.target.value })}
                                    disabled={!formData.project_id}
                                >
                                    <option value="">This is a main task</option>
                                    {tasks.filter(t => t.project_id === parseInt(formData.project_id) && !t.parent_task_id).map(t => (
                                        <option key={t.id} value={t.id}>{t.title}</option>
                                    ))}
                                </select>
                            </div>
                             <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={16} /> Technical Brief / Report (Optional)
                                </label>
                                <div style={{ 
                                    position: 'relative', border: '2px dashed #e2e8f0', borderRadius: '12px', 
                                    padding: '1.5rem', textAlign: 'center', transition: 'all 0.2s', 
                                    backgroundColor: selectedFile ? '#f0f9ff' : 'transparent', 
                                    borderColor: selectedFile ? '#3b82f6' : '#e2e8f0' 
                                }}>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                        <Upload size={20} color={selectedFile ? '#3b82f6' : '#94a3b8'} />
                                        {selectedFile ? (
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e40af' }}>{selectedFile.name}</div>
                                        ) : (
                                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Click or drag a brief to attach</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deadline</label>
                                <input type="date" className="form-input" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, backgroundColor: 'var(--bg-main)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={isSubmitting}>{isSubmitting ? 'Assigning...' : 'Assign Task'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedTaskId && (
                <TaskDetailsModal
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                    onUpdate={fetchData}
                />
            )}
        </div>
    );
};

export default TLTasks;
