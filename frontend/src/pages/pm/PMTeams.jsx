import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Search, Plus, User, X, Trash2, 
  Briefcase, Users, Activity, ExternalLink,
  ChevronRight, AlertCircle, CheckCircle2,
  TrendingUp, BarChart3, ChevronDown
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';

const PMTeams = () => {
  const [data, setData] = useState({
    teams: [],
    projects: [],
    leaders: [],
    users: [],
    loading: true
  });
  
  const [view, setView] = useState('list'); // 'list', 'create'
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    project_id: '',
    team_leader_id: '',
    member_ids: []
  });
  const [memberSearch, setMemberSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, teamId: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, projectsRes, usersRes] = await Promise.all([
        axios.get('/api/teams'),
        axios.get('/api/projects'),
        axios.get('/api/users')
      ]);
      setData({
        teams: teamsRes.data.data,
        projects: projectsRes.data.data,
        leaders: usersRes.data.data.filter(u => u.role === 'team_leader' || u.role === 'project_manager'),
        users: usersRes.data.data.filter(u => u.role === 'team_member'),
        loading: false
      });
    } catch (err) {
      console.error('Failed to fetch data', err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const getWorkloadLevel = (memberCount) => {
    if (memberCount === 0) return { label: 'Empty', color: 'var(--text-muted)', level: 'info' };
    if (memberCount <= 3) return { label: 'Underutilized', color: '#0ea5e9', level: 'info' };
    if (memberCount <= 6) return { label: 'Optimal', color: '#10b981', level: 'success' };
    return { label: 'Heavy Load', color: '#f59e0b', level: 'warning' };
  };


  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.project_id || !formData.team_leader_id) {
       return showToast('Please fill all the required fields', 'error');
    }
    
    setIsSubmitting(true);
    try {
      await axios.post('/api/teams', formData);
      showToast('Team constructed successfully!');
      setTimeout(() => {
        setView('list');
        fetchData();
        resetForm();
      }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Construction failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', project_id: '', team_leader_id: '', member_ids: [] });
    setMemberSearch('');
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/teams/${deleteConfirm.teamId}`);
      showToast('Team decommissioned successfully');
      setDeleteConfirm({ show: false, teamId: null });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Authorization required for team deletion', 'error');
      setDeleteConfirm({ show: false, teamId: null });
    }
  };

  const openMemberManagement = (team) => {
    setSelectedTeam(team);
    setShowMemberModal(true);
  };

  if (data.loading) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="pulse-animation" style={{ fontWeight: 800, color: 'var(--primary)' }}>LOADING TEAMS...</div>
    </div>
  );

  if (view === 'create') {
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
            <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Assemble New Team</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.4rem' }}>Define mission parameters and assign leadership.</p>
          </div>
        </div>

        <form onSubmit={handleCreateTeam}>
          <div className="card" style={{ padding: '3.5rem', borderRadius: '40px', maxWidth: '800px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem' }}>TEAM NOMENCLATURE</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ borderRadius: '18px', padding: '1.25rem' }} 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Core System Alpha" 
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem' }}>TARGET PROJECT</label>
                  <select className="form-input" style={{ borderRadius: '18px', padding: '1.25rem' }} value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})}>
                    <option value="">Select Project...</option>
                    {data.projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem' }}>APPOINTED LEADER</label>
                  <select className="form-input" style={{ borderRadius: '18px', padding: '1.25rem' }} value={formData.team_leader_id} onChange={(e) => setFormData({...formData, team_leader_id: e.target.value})}>
                    <option value="">Select Leader...</option>
                    {data.leaders.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role.replace('_', ' ').toUpperCase()})</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                   <label className="form-label" style={{ fontWeight: 800, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      REINFORCE UNIT (SELECT TEAM MEMBERS)
                      <span style={{ color: 'var(--primary)', fontSize: '0.7rem' }}>{formData.member_ids.length} SELECTED</span>
                   </label>
                   
                   <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        className="form-input" 
                        placeholder="Search personnel directory..." 
                        style={{ borderRadius: '14px', paddingLeft: '2.75rem', fontSize: '0.9rem' }}
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                      />
                   </div>

                   <div style={{ 
                      maxHeight: '280px', 
                      overflowY: 'auto', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                      gap: '1rem',
                      padding: '0.5rem'
                   }}>
                      {data.users
                        .filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()) || u.email.toLowerCase().includes(memberSearch.toLowerCase()))
                        .map(user => {
                          const isSelected = formData.member_ids.includes(user.id);
                          return (
                            <div 
                              key={user.id}
                                onClick={() => {
                                  setFormData(prev => {
                                    const isSelected = prev.member_ids.includes(user.id);
                                    if (isSelected) {
                                      return { ...prev, member_ids: prev.member_ids.filter(id => id !== user.id) };
                                    } else {
                                      return { ...prev, member_ids: [...prev.member_ids, user.id] };
                                    }
                                  });
                                }}
                              className="glass-hover"
                              style={{ 
                                padding: '1rem', 
                                borderRadius: '18px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                border: isSelected ? '2px solid var(--primary)' : '1px solid #f1f5f9',
                                background: isSelected ? 'rgba(124, 58, 237, 0.05)' : 'white',
                                transition: 'all 0.2s'
                              }}
                            >
                               <div style={{ 
                                  width: '32px', height: '32px', borderRadius: '10px', 
                                  background: isSelected ? 'var(--primary)' : '#f1f5f9', 
                                  color: isSelected ? 'white' : 'var(--text-muted)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.8rem', fontWeight: 800
                               }}>
                                  {isSelected ? <CheckCircle2 size={16} /> : user.name.charAt(0)}
                               </div>
                               <div style={{ overflow: 'hidden' }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.email}</div>
                               </div>
                            </div>
                          );
                        })}
                   </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3.5rem' }}>
              <button type="button" className="btn" style={{ flex: 1, borderRadius: '18px', padding: '1.25rem', fontWeight: 800 }} onClick={() => setView('list')}>Abort</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2, borderRadius: '18px', padding: '1.25rem', fontWeight: 800 }} disabled={isSubmitting}>
                 {isSubmitting ? 'Commencing...' : 'Authorize Team Creation'}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Team Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Manage team members and their project assignments.</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: '16px', fontWeight: 800, boxShadow: '0 8px 24px var(--primary-light)' }} onClick={() => { resetForm(); setView('create'); }}>
          <Plus size={20} /> Add New Team
        </button>
      </div>

      {/* Resource High-level Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
         <div className="card" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Users size={28} />
            </div>
            <div>
               <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Members</div>
               <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{data.users.length}</div>
            </div>
         </div>
         <div className="card" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <TrendingUp size={28} />
            </div>
            <div>
               <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Number of Teams</div>
               <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{data.teams.length}</div>
            </div>
         </div>
         <div className="card" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Activity size={28} />
            </div>
            <div>
               <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Capacity</div>
               <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>84%</div>
            </div>
         </div>
      </div>

      {/* Teams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
        {data.teams.map(team => {
          const workload = getWorkloadLevel(team.member_count);
          return (
            <motion.div 
              key={team.id} 
              className="card glass-hover" 
              style={{ padding: '2.25rem', borderRadius: '32px', position: 'relative' }}
              whileHover={{ y: -5 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                       <Layers size={26} />
                    </div>
                    <div>
                       <h3 style={{ fontSize: '1.35rem', fontWeight: 950, letterSpacing: '-0.5px' }}>{team.name}</h3>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>PROJECT : {team.project_title}</div>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div 
                      onClick={() => setDeleteConfirm({ show: true, teamId: team.id })}
                      style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.5rem', borderRadius: '12px', color: 'var(--danger)', cursor: 'pointer' }}
                      title="Decommission Team"
                    >
                        <Trash2 size={18} />
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <ExternalLink size={18} />
                    </div>
                 </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
                 <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Team Leader</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                       {team.team_leader_name?.charAt(0) || '?'}
                    </div>
                    <div>
                       <div style={{ fontWeight: 800, fontSize: '1rem' }}>{team.team_leader_name || 'Unassigned'}</div>
                       <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>TEAM LEADER</div>
                    </div>
                 </div>
              </div>

              {/* Member Names Preview */}
              <div style={{ marginBottom: '1.5rem' }}>
                 <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Team Members</div>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(team.member_names ? team.member_names.split(',').map(s => s.trim()) : []).slice(0, 5).map((name, i) => (
                       <div key={i} className="glass" style={{ padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {name}
                       </div>
                    ))}
                    {(team.member_names ? team.member_names.split(',') : []).length > 5 && (
                       <div className="glass" style={{ padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                          +{(team.member_names ? team.member_names.split(',') : []).length - 5}
                       </div>
                    )}
                    {(!team.member_names || team.member_names.trim() === '') && (
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No members added yet.</span>
                    )}
                 </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.25rem' }}>{team.member_count} Members</div>
                    <Badge status={workload.level}>{workload.label}</Badge>
                 </div>
                 <button 
                  className="btn" 
                  onClick={() => openMemberManagement(team)}
                  style={{ fontWeight: 800, fontSize: '0.85rem', padding: '0.6rem 1.25rem', borderRadius: '12px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid #f1f5f9' }}
                >
                    View Details
                 </button>
              </div>
            </motion.div>
          );
        })}
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
                onClick={() => setDeleteConfirm({ show: false, teamId: null })}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '0.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>Delete Team?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                 This action is permanent and cannot be undone. The team and its assignments will be lost.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={confirmDelete}
                  style={{ 
                    backgroundColor: 'var(--danger)', color: 'white', 
                    padding: '1rem', borderRadius: '16px', fontWeight: 800,
                    flex: 1, border: 'none', cursor: 'pointer'
                  }}
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setDeleteConfirm({ show: false, teamId: null })}
                  style={{ 
                    backgroundColor: '#f1f5f9', color: 'var(--text-main)', 
                    padding: '1rem', borderRadius: '16px', fontWeight: 800,
                    flex: 1, border: 'none', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: MANAGE MEMBERS */}
      <ManageMembersModal 
        isOpen={showMemberModal}
        onClose={() => { setShowMemberModal(false); setSelectedTeam(null); fetchData(); }}
        team={selectedTeam}
        allUsers={data.users}
      />
    </div>
  );
};

// Internal Component for Member Management
const ManageMembersModal = ({ isOpen, onClose, team, allUsers }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && team) {
      fetchCurrentMembers();
    }
  }, [isOpen, team]);

  const fetchCurrentMembers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/teams/${team.id}`);
      setTeamMembers(data.data.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await axios.post(`/api/teams/${team.id}/members`, { user_id: userId });
      showToast('Unit reinforced. Personnel added.', 'success');
      fetchCurrentMembers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failure to add personnel', 'error');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await axios.delete(`/api/teams/${team.id}/members/${userId}`);
      showToast('Personnel decoupled. Unit updated.', 'success');
      fetchCurrentMembers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failure to remove personnel', 'error');
    }
  };

  if (!isOpen || !team) return null;

  const currentMemberIds = teamMembers.map(m => m.id);
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card" style={{ maxWidth: '700px', width: '100%', borderRadius: '32px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2.5rem', borderBottom: '1px solid #f1f5f9' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                 <h2 style={{ fontSize: '1.75rem', fontWeight: 950 }}>Manage Members</h2>
                 <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Editing members for <span style={{ color: 'var(--primary)' }}>{team.name}</span></p>
              </div>
              <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}><X size={24} /></button>
           </div>
           
           <div style={{ marginTop: '2rem', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                className="form-input" 
                placeholder="Search potential members..." 
                style={{ borderRadius: '14px', paddingLeft: '3rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2.5rem' }}>
           {loading ? (
             <p style={{ textAlign: 'center', padding: '2rem' }}>Loading current members...</p>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>User Directory ({filteredUsers.length})</h4>
                {filteredUsers.map(user => {
                  const isMember = currentMemberIds.includes(user.id);
                  return (
                    <div key={user.id} className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--grad-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                             {user.name.charAt(0)}
                          </div>
                          <div>
                             <div style={{ fontWeight: 800 }}>{user.name}</div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                          </div>
                       </div>
                       
                       {isMember ? (
                         <button 
                          onClick={() => handleRemoveMember(user.id)}
                          style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontWeight: 800, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                         >
                            Remove
                         </button>
                       ) : (
                         <button 
                          onClick={() => handleAddMember(user.id)}
                          style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 800, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                         >
                            Add to Team
                         </button>
                       )}
                    </div>
                  );
                })}
             </div>
           )}
        </div>

        <div style={{ padding: '1.5rem 2.5rem', background: '#f8fafc', textAlign: 'right' }}>
           <button className="btn btn-primary" onClick={onClose} style={{ borderRadius: '12px', padding: '0.75rem 2rem' }}>Done</button>
        </div>
      </motion.div>
    </div>
  );
};

export default PMTeams;
