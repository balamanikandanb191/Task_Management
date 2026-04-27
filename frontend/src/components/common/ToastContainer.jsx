import React from 'react';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            pointerEvents: 'none'
        }}>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        layout
                        style={{
                            pointerEvents: 'all',
                            minWidth: '320px',
                            maxWidth: '450px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '18px',
                            padding: '1.25rem',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: toast.type === 'success' ? '#10b981' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: `0 8px 16px ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                            }}>
                                {toast.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                            </div>
                            <div>
                                <div style={{ 
                                    fontWeight: 900, 
                                    fontSize: '0.95rem', 
                                    color: 'var(--text-main)',
                                    marginBottom: '2px',
                                    fontFamily: "'Outfit', sans-serif"
                                }}>
                                    {toast.type === 'success' ? 'Mission Success' : 'Operation Alert'}
                                </div>
                                <div style={{ 
                                    fontSize: '0.85rem', 
                                    color: 'var(--text-muted)', 
                                    fontWeight: 600,
                                    lineHeight: 1.4
                                }}>
                                    {toast.message}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'rgba(0,0,0,0.05)',
                                border: 'none',
                                borderRadius: '8px',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
