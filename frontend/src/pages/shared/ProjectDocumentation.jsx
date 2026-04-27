import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText, Download, Briefcase, Search, ExternalLink,
  File, Filter, Eye, Calendar, HardDrive, User, Shield
} from 'lucide-react';
import Badge from '../../components/common/Badge';

const ProjectDocumentation = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/api/projects');
      const projectList = data.data || [];
      setProjects(projectList);
      if (projectList.length > 0) {
        setSelectedProject(projectList[0]);
        fetchFiles(projectList[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (projectId) => {
    setFilesLoading(true);
    try {
      const { data } = await axios.get(`/api/files/project/${projectId}`);
      setFiles(data.data || []);
    } catch (err) {
      console.error('Failed to fetch files', err);
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    fetchFiles(project.id);
    setSearchTerm('');
  };

  const filteredFiles = files.filter(f =>
    f.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const colors = { pdf: '#ef4444', doc: '#2563eb', docx: '#2563eb', jpg: '#10b981', jpeg: '#10b981', png: '#7c3aed', gif: '#f59e0b' };
    return colors[ext] || '#6b7280';
  };

  const getFileExt = (fileName) => fileName?.split('.').pop()?.toUpperCase() || 'FILE';

  if (loading) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading documentation vault...</p>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
            Documentation Vault
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Review all project reports and deliverables submitted by team leaders.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(37,99,235,0.06)', padding: '0.75rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(37,99,235,0.12)' }}>
          <Shield size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Read-Only View</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Sidebar — Project List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={16} /> Projects
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleProjectSelect(p)}
                  style={{
                    padding: '0.9rem 1rem',
                    textAlign: 'left',
                    borderRadius: '14px',
                    border: '2px solid',
                    borderColor: selectedProject?.id === p.id ? 'var(--primary)' : 'transparent',
                    background: selectedProject?.id === p.id ? 'rgba(37, 99, 235, 0.06)' : '#f8fafc',
                    color: selectedProject?.id === p.id ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
                    {p.status?.replace('_', ' ')}
                  </div>
                </button>
              ))}
              {projects.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No projects found</p>
              )}
            </div>
          </div>

          {/* Stats Card */}
          {selectedProject && (
            <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--grad-dark)', color: 'white' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Project Stats</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Total Files</span>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem' }}>{files.length}</span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Total Size</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {formatSize(files.reduce((acc, f) => acc + (f.file_size || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Content — Files */}
        <div className="card" style={{ padding: '2.5rem', borderRadius: '32px', minHeight: '500px' }}>
          {selectedProject ? (
            <>
              {/* Project Header */}
              <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Badge status={selectedProject.status}>{selectedProject.status?.replace('_', ' ')}</Badge>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                      {selectedProject.title}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Managed by <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedProject.created_by_name || 'Project Manager'}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <Eye size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{files.length} document{files.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Search */}
              {files.length > 0 && (
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '3rem', borderRadius: '14px', height: '48px' }}
                  />
                </div>
              )}

              {/* Files Grid */}
              {filesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                  <div style={{ width: '36px', height: '36px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : filteredFiles.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {filteredFiles.map(file => (
                    <div
                      key={file.id}
                      className="card"
                      style={{
                        padding: '1.5rem',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        borderRadius: '20px',
                        transition: 'all 0.2s',
                        cursor: 'default'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                        {/* File Type Badge */}
                        <div style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '14px',
                          background: `${getFileIcon(file.file_name)}18`,
                          border: `1.5px solid ${getFileIcon(file.file_name)}30`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <FileText size={20} color={getFileIcon(file.file_name)} />
                          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: getFileIcon(file.file_name), marginTop: '2px' }}>
                            {getFileExt(file.file_name)}
                          </span>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.4rem' }}>
                            {file.file_name}
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <HardDrive size={12} /> {formatSize(file.file_size)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={12} /> {new Date(file.uploaded_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Uploader */}
                      {file.uploaded_by_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'white', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white' }}>{file.uploaded_by_name.charAt(0)}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Uploaded by <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{file.uploaded_by_name}</span>
                          </span>
                        </div>
                      )}

                      {/* Download Button */}
                      <a href={`/uploads/${file.file_path}`} download={file.file_name} style={{ textDecoration: 'none', display: 'block' }}>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 800, borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <Download size={16} /> Download Document
                        </button>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-muted)' }}>
                  <File size={72} style={{ opacity: 0.08, marginBottom: '1.5rem' }} />
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    {searchTerm ? 'No documents match your search' : 'No documents uploaded yet'}
                  </div>
                  <p style={{ fontSize: '0.9rem' }}>
                    {searchTerm ? 'Try a different search term.' : 'The team leader has not uploaded any documentation for this project yet.'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '10rem 2rem', color: 'var(--text-muted)' }}>
              <Briefcase size={72} style={{ opacity: 0.08, marginBottom: '1.5rem' }} />
              <h2 style={{ fontWeight: 800 }}>Select a project</h2>
              <p>Choose a project from the left panel to view its documentation.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ProjectDocumentation;
