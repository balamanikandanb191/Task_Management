/**
 * Returns a color and urgency label based on the deadline.
 * Rules:
 * - Red: <= 3 days away
 * - Orange: 4 - 7 days away
 * - Yellow: 8 - 14 days away
 * - Green: > 14 days away
 */
export const getUrgencyInfo = (deadline) => {
  if (!deadline) return { color: 'var(--success)', label: 'Stable' };
  
  const now = new Date();
  const target = new Date(deadline);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return { color: '#ef4444', label: 'Overdue', level: 'critical' }; // Bright Red
  if (diffDays <= 3) return { color: '#f43f5e', label: 'Critical', level: 'danger' }; // Soft Red
  if (diffDays <= 7) return { color: '#f97316', label: 'Urgent', level: 'orange' }; // Orange
  if (diffDays <= 14) return { color: '#eab308', label: 'Mid-term', level: 'warning' }; // Yellow
  
  return { color: '#10b981', label: 'Healthy', level: 'success' }; // Green
};
