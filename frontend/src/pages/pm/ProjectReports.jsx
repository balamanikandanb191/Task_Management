import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Download, Search, Calendar, User, 
  Briefcase, Filter, ChevronRight, FileDown
} from 'lucide-react';
import Badge from '../../components/common/Badge';

const ProjectReports = () => {
    const [reports, setReports] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [projectsRes] = await Promise.all([
                axios.get('/api/projects')
            ]);
            const projs = projectsRes.data.data;
            setProjects(projs);
            
            // Fetch reports for all projects
            const reportPromises = projs.map(p => axios.get(`/api/files/project/${p.id}`));
            const allReportResponses = await Promise.all(reportPromises);
            
            const allReports = allReportResponses.flatMap((res, index) => {
                return res.data.data.map(r => ({
                    ...r,
                    project_title: projs[index].title,
                    project_status: projs[index].status
                }));
            });
            
            setReports(allReports);
        } catch (err) {
            console.error('Failed to fetch reports', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r => 
        r.file_name.toLowerCase().includes(search.toLowerCase()) || 
        r.project_title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="page-wrapper">Compiling executive reports...</div>;

    return (
        <div className="page-wrapper fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Project Documentation</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Review official project reports and technical deliverables.</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL ASSETS</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{reports.length}</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        className="form-input" 
                        placeholder="Search by file name or initiative..." 
                        style={{ paddingLeft: '3.5rem', borderRadius: '14px' }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>DOCUMENT DETAILS</th>
                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>STRATEGIC INITIATIVE</th>
                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>UPLOADED BY</th>
                            <th style={{ padding: '1.25rem 2rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map(report => (
                            <tr key={report.id} className="hover-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.05)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>{report.file_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(report.uploaded_at).toLocaleDateString()} • {(report.file_size / 1024).toFixed(1)} KB</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{report.project_title}</div>
                                    <Badge status={report.project_status}>{report.project_status}</Badge>
                                </td>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={14} color="var(--primary)" />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{report.uploaded_by_name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
                                    <a href={`/uploads/${report.file_path}`} download style={{ textDecoration: 'none' }}>
                                        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                                            <Download size={16} /> Download
                                        </button>
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredReports.length === 0 && (
                    <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileDown size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>No documents identified</div>
                        <p>Adjust your search/filters or check back later.</p>
                    </div>
                )}
            </div>
            <style>{`
                .hover-row:hover { background-color: #f8fafc; }
            `}</style>
        </div>
    );
};

export default ProjectReports;
