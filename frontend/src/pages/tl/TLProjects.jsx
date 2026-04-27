import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { Briefcase, Calendar, Clock, CheckSquare } from 'lucide-react';

const TLProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await axios.get('/api/projects');
            setProjects(data.data);
        } catch (err) {
            console.error('Failed to fetch projects', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="page-wrapper">Loading assigned projects...</div>;

    return (
        <div className="page-wrapper fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Assigned Projects</h1>
                <p style={{ color: 'var(--text-muted)' }}>Projects you are currently leading and managing.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {projects.map((project) => (
                    <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <Badge status={project.status}>{project.status.replace('_', ' ')}</Badge>
                                <h3 style={{ marginTop: '0.75rem', fontSize: '1.25rem' }}>{project.title}</h3>
                            </div>
                            <div style={{ color: 'var(--primary)', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                <Briefcase size={20} />
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>{project.description}</p>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                    <Calendar size={16} />
                                    <span>Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
                                </div>
                                <div style={{ fontWeight: 600 }}>{project.total_tasks || 0} Tasks</div>
                            </div>
                            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                <span>Execution Progress</span>
                                <span>{project.progress || 0}%</span>
                            </div>
                            <ProgressBar progress={project.progress || 0} />

                            {project.workflow_path && (
                                <a
                                    href={`/uploads/${project.workflow_path}`}
                                    download
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%', marginTop: '1.25rem', padding: '0.6rem',
                                        borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800,
                                        justifyContent: 'center', textDecoration: 'none'
                                    }}
                                >
                                    Download Workflow
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Briefcase size={32} color="var(--text-muted)" />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>No projects assigned</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Contact your Project Manager to get assigned to a project team.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TLProjects;
