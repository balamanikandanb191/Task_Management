import React from 'react';

const ProgressBar = ({ progress, size = 'md', showText = true }) => {
  const heights = { sm: '4px', md: '8px', lg: '12px' };
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: showText ? '0.5rem' : 0 
      }}>
        {showText && <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Progress</span>}
        {showText && <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{progress}%</span>}
      </div>
      <div style={{ 
        width: '100%', 
        height: heights[size], 
        backgroundColor: '#e2e8f0', 
        borderRadius: '999px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          width: `${progress}%`, 
          height: '100%', 
          backgroundColor: progress === 100 ? 'var(--success)' : 'var(--primary)',
          transition: 'width 0.5s ease-out'
        }} />
      </div>
    </div>
  );
};

export default ProgressBar;
