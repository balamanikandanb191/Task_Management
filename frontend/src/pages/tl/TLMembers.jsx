import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from '../../components/common/Badge';
import { Users, Mail, Phone, Calendar, Search, Shield, User } from 'lucide-react';

const TLMembers = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const { data } = await axios.get('/api/teams');
            // Fetch detailed info for each team to get members
            const detailedTeams = await Promise.all(
                data.data.map(async (team) => {
                    const detailRes = await axios.get(`/api/teams/${team.id}`);
                    return detailRes.data.data;
                })
            );
            setTeams(detailedTeams);
        } catch (err) {
            console.error('Failed to fetch teams', err);
        } finally {
            setLoading(false);
        }
    };

    const allMembers = teams.reduce((acc, team) => {
        const membersWithTeam = (team.members || []).map(m => ({ ...m, teamName: team.name, projectTitle: team.project_title }));
        return [...acc, ...membersWithTeam];
    }, []);

    // Remove duplicates (a user can be in multiple teams)
    const uniqueMembers = Array.from(new Map(allMembers.map(m => [m.id, m])).values());

    const filteredMembers = uniqueMembers.filter(m => 
        m.name.toLowerCase().includes(search.toLowerCase()) || 
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="page-wrapper">Loading team directory...</div>;

    return (
        <div className="page-wrapper fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Team Members</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Directory of all members under your leadership across projects.</p>
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="form-input" 
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredMembers.map((member) => (
                    <div key={member.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ 
                                width: '56px', 
                                height: '56px', 
                                borderRadius: '16px', 
                                backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                                color: 'var(--primary)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 700
                            }}>
                                {member.name.charAt(0)}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.125rem' }}>{member.name}</h3>
                                <Badge status="info">{member.role.replace('_', ' ')}</Badge>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Mail size={16} />
                                <span>{member.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Shield size={16} />
                                <span>Member of: {member.teamName}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Calendar size={16} />
                                <span>Joined: {new Date(member.joined_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
                             <button className="btn" style={{ flex: 1, fontSize: '0.8rem', backgroundColor: 'var(--bg-main)' }}>View Profile</button>
                             <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem' }}>Contact</button>
                        </div>
                    </div>
                ))}

                {filteredMembers.length === 0 && (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        No team members found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TLMembers;
