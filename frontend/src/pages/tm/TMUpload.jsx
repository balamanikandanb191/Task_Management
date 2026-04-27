import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileUp, Search, FileText, Download, 
  Trash2, Briefcase, Calendar, HardDrive, Users 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TMUpload = () => {
    const [taskFiles, setTaskFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            // Fetch all accessible tasks (now includes project-level tasks)
            const { data } = await axios.get('/api/tasks');
            const accessibleTasks = data.data;
            
            let allFiles = [];
            // Fetch files for every task visible to this member (shared team visibility)
            for (const task of accessibleTasks) {
                const fileRes = await axios.get(`/api/files/task/${task.id}`);
                const files = (fileRes.data.data || []).map(f => ({ ...f, task_title: task.title }));
                allFiles = [...allFiles, ...files];
            }
            setTaskFiles(allFiles);
        } catch (err) {
            console.error('Failed to fetch submissions', err);
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const filteredFiles = taskFiles.filter(f => 
        f.file_name.toLowerCase().includes(search.toLowerCase()) ||
        f.task_title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pulse-animation" style={{ color: '#2563eb', fontWeight: 800 }}>COLLECTING DIGITAL ASSETS...</div>
    </div>;

    return (
        <div className="page-wrapper fade-in" style={{ padding: '2rem 2.5rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
                    Shared <span className="text-gradient" style={{ color: '#2563eb' }}>Artifact Vault</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
                    A centralized repository of project deliverables and mission-critical assets.
                </p>
            </div>

            <div className="card" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        className="form-input"
                        placeholder="Search team assets or task origins..."
                        style={{ paddingLeft: '3.5rem', borderRadius: '16px', background: '#f8fafc', height: '56px' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredFiles.map(file => (
                        <div key={file.id} className="card" style={{ 
                            padding: '1.5rem', 
                            background: '#fff', 
                            border: '1.5px solid #f1f5f9',
                            borderRadius: '24px',
                            transition: 'all 0.2s',
                            position: 'relative'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ 
                                    width: '56px', height: '56px', borderRadius: '16px', 
                                    background: 'rgba(37, 99, 235, 0.05)', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' 
                                }}>
                                    <FileText size={26} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {file.file_name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                                        ORIGIN: {file.task_title}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <HardDrive size={14} /> {formatSize(file.file_size)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {file.uploaded_by === user.id ? <FileText size={14} /> : <Users size={14} />}
                                    {file.uploaded_by === user.id ? 'My Artifact' : `By ${file.uploaded_by_name || 'Teammate'}`}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <Calendar size={14} /> {new Date(file.uploaded_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <a 
                                    href={`/uploads/${file.file_path}`} 
                                    download={file.file_name} 
                                    style={{ flex: 1, textDecoration: 'none' }}
                                >
                                    <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Download size={16} /> Download
                                    </button>
                                </a>
                            </div>
                        </div>
                    ))}

                    {filteredFiles.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem' }}>
                            <FileUp size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                            <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No team artifacts found in the vault.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TMUpload;
