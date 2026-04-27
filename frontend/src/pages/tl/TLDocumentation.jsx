import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Upload, Download, Trash2, CheckCircle2, AlertCircle,
  ExternalLink, File, Briefcase, Plus, Search
} from 'lucide-react';
import Badge from '../../components/common/Badge';

const TLDocumentation = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await axios.get('/api/projects');
            setProjects(data.data);
            if (data.data.length > 0) {
                setSelectedProject(data.data[0]);
                fetchProjectReports(data.data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch projects', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectReports = async (projectId) => {
        try {
            const { data } = await axios.get(`/api/files/project/${projectId}`);
            setReports(data.data);
        } catch (err) {
            console.error('Failed to fetch reports', err);
        }
    };

    const handleProjectChange = (id) => {
        const proj = projects.find(p => p.id === parseInt(id));
        setSelectedProject(proj);
        fetchProjectReports(id);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedProject) return;

        setUploading(true);
        setMessage('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`/api/files/upload/project/${selectedProject.id}`, formData);
            setMessage('Document uploaded successfully!');
            fetchProjectReports(selectedProject.id);
        } catch (err) {
            setMessage('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await axios.delete(`/api/files/${id}/project`);
            fetchProjectReports(selectedProject.id);
        } catch (err) {
            alert('Delete failed');
        }
    };

    if (loading) return <div className="page-wrapper">Initializing documentation center...</div>;

    return (
        <div className="page-wrapper fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-1px' }}>Project Documentation</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Final reports and official project deliverables.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.75rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Project Centralized Sync Active</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Selector Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={20} color="var(--primary)" /> Select Project
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {projects.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => handleProjectChange(p.id)}
                                    style={{ 
                                        padding: '1rem', textAlign: 'left', borderRadius: '14px', border: '1px solid',
                                        borderColor: selectedProject?.id === p.id ? 'var(--primary)' : 'transparent',
                                        background: selectedProject?.id === p.id ? 'rgba(37, 99, 235, 0.05)' : '#f8fafc',
                                        color: selectedProject?.id === p.id ? 'var(--primary)' : 'var(--text-main)',
                                        fontWeight: 700, transition: 'all 0.2s', cursor: 'pointer'
                                    }}
                                >
                                    {p.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '2rem', borderRadius: '24px', background: 'var(--grad-dark)', color: 'white' }}>
                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Need Help?</h3>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.5, marginBottom: '1.5rem' }}>
                            Reports should be in PDF or Word format for compatibility with Admin/PM review systems.
                        </p>
                        <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%', fontWeight: 700 }}>Guidelines</button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="card" style={{ padding: '3rem', borderRadius: '32px' }}>
                    {selectedProject ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                                <div>
                                    <Badge status={selectedProject.status}>{selectedProject.status}</Badge>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '1rem' }}>{selectedProject.title}</h2>
                                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Overseen by <span style={{ fontWeight: 700 }}>{selectedProject.created_by_name || 'Project Manager'}</span></p>
                                </div>
                                <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '1rem 1.5rem', borderRadius: '16px', fontWeight: 800 }}>
                                    {uploading ? 'UPLOADING...' : <><Upload size={20} /> Upload Report</>}
                                    <input type="file" hidden onChange={handleFileUpload} disabled={uploading} />
                                </label>
                            </div>

                            {message && (
                                <div style={{ 
                                    padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem',
                                    background: message.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: message.includes('success') ? '#059669' : '#dc2626',
                                    fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    {message.includes('success') ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    {message}
                                </div>
                            )}

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Uploaded Documentation</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {reports.map(r => (
                                    <div key={r.id} className="card" style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '20px', transition: 'transform 0.2s' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                                <FileText size={24} />
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.file_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    {new Date(r.uploaded_at).toLocaleDateString()} • {(r.file_size / 1024).toFixed(1)} KB
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', pt: '1.5rem', borderTop: '1px solid #edf2f7' }}>
                                            <a href={`/uploads/${r.file_path}`} download style={{ flex: 1, textDecoration: 'none' }}>
                                                <button className="btn" style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem', fontWeight: 800, background: 'white', border: '1px solid #e2e8f0' }}>
                                                    <Download size={16} />
                                                </button>
                                            </a>
                                            <button 
                                                onClick={() => handleDelete(r.id)}
                                                className="btn" 
                                                style={{ padding: '0.6rem 1rem', background: 'rgba(239, 68, 68, 0.05)', border: 'none', color: '#ef4444' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {reports.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <File size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>No documentation found</div>
                                        <p>Upload the final report or technical documentation for this project.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
                            <Search size={64} style={{ opacity: 0.1, marginBottom: '2rem' }} />
                            <h2>Select a project to manage documentation</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TLDocumentation;
