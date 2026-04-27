import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color = 'var(--primary)' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flex: 1,
        padding: '1.75rem',
        background: '#fff',
        border: '1px solid #f1f5f9',
        borderRadius: '24px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default'
      }}
    >
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: `${color}10`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          boxShadow: `0 0 20px ${color}15`,
          flexShrink: 0,
          zIndex: 1
        }}
      >
        {React.cloneElement(icon, { size: 28, className: 'icon-glow' })}
      </motion.div>
      <div style={{ zIndex: 1 }}>
        <div style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem',
          fontFamily: "'Outfit', sans-serif"
        }}>
          {title}
        </div>
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          style={{
            fontSize: '1.75rem',
            fontWeight: 900,
            color: 'var(--text-main)',
            letterSpacing: '-1px',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          {value}
        </motion.div>
      </div>

      {/* Decorative Gradient Blob */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '100px',
        height: '100px',
        background: `${color}05`,
        borderRadius: '50%',
        filter: 'blur(30px)',
        zIndex: 0
      }}></div>
    </motion.div>
  );
};

export default StatCard;
