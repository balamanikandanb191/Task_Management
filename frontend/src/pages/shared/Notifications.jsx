import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, CheckCircle2, Info, AlertTriangle, 
    XCircle, CheckSquare, Trash2, ArrowRight,
    RefreshCw, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/notifications');
            setNotifications(data.data.notifications);
            setUnreadCount(data.data.unreadCount);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={20} color="#10b981" />;
            case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
            case 'error': return <XCircle size={20} color="#ef4444" />;
            default: return <Info size={20} color="#3b82f6" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { x: 20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    return (
        <div className="page-wrapper fade-in" style={{ padding: '2rem 2.5rem' }}>
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ 
                            width: '32px', height: '32px', borderRadius: '10px', 
                            background: 'var(--primary-soft)', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' 
                        }}>
                            <Bell size={18} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SIGNAL HUB</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
                        Personal <span className="text-gradient">Alerts</span>
                    </h1>
                </motion.div>

                {unreadCount > 0 && (
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={markAllRead}
                        style={{ 
                            padding: '0.75rem 1.5rem', borderRadius: '14px', 
                            background: '#fff', border: '1px solid var(--border-color)',
                            fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                        }}
                    >
                        <CheckSquare size={16} /> Mark all as read
                    </motion.button>
                )}
            </div>

            <div className="card" style={{ padding: '0', borderRadius: '32px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '5rem', textAlign: 'center' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block' }}>
                            <RefreshCw size={32} color="var(--primary)" />
                        </motion.div>
                        <p style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Updating your feed...</p>
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ display: 'flex', flexDirection: 'column' }}
                    >
                        <AnimatePresence>
                            {notifications.length > 0 ? notifications.map((n) => (
                                <motion.div 
                                    key={n.id}
                                    variants={itemVariants}
                                    layout
                                    onClick={() => {
                                        if (n.link) navigate(n.link);
                                        if (!n.is_read) markAsRead(n.id);
                                    }}
                                    style={{ 
                                        padding: '1.5rem 2.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottom: '1px solid #f1f5f9',
                                        background: n.is_read ? 'transparent' : 'rgba(37, 99, 235, 0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                    className="notification-item"
                                >
                                    {!n.is_read && (
                                        <div style={{ 
                                            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                                            width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)',
                                            boxShadow: '0 0 10px var(--primary)'
                                        }}></div>
                                    )}
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                                        <div style={{ 
                                            width: '44px', height: '44px', borderRadius: '12px', 
                                            background: '#f8fafc', display: 'flex', 
                                            alignItems: 'center', justifyContent: 'center', 
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div>
                                            <div style={{ 
                                                fontSize: '1rem', fontWeight: n.is_read ? 600 : 800, 
                                                color: n.is_read ? 'var(--text-muted)' : 'var(--text-main)',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {n.message}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                {new Date(n.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        {n.link && <ArrowRight size={18} color="var(--text-muted)" style={{ opacity: 0.5 }} />}
                                    </div>
                                </motion.div>
                            )) : (
                                <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Bell size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                    <p style={{ fontWeight: 600 }}>Zero alerts. Your radar is clear.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
