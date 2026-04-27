import React from 'react';

const Badge = ({ children, status }) => {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'active':
      case 'success':
        return { bg: '#10b98115', text: '#10b981' };
      case 'in progress':
      case 'pending_review':
      case 'warning':
        return { bg: '#f59e0b15', text: '#f59e0b' };
      case 'pending':
      case 'on_hold':
      case 'rejected':
      case 'danger':
        return { bg: '#ef444415', text: '#ef4444' };
      default:
        return { bg: '#e2e8f0', text: '#64748b' };
    }
  };

  const { bg, text } = getStyles();

  return (
    <span className="badge" style={{ backgroundColor: bg, color: text }}>
      {children}
    </span>
  );
};

export default Badge;
