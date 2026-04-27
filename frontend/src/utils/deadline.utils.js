/**
 * Calculate the deadline status color based on days remaining
 * @param {string|Date} deadlineDate 
 * @returns {object} { color, label, daysLeft }
 */
export const getDeadlineStatus = (deadlineDate) => {
  if (!deadlineDate) return { color: 'var(--text-muted)', label: 'No Deadline', daysLeft: Infinity };

  const now = new Date();
  const deadline = new Date(deadlineDate);
  const diffTime = deadline.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { color: '#000000', label: 'Overdue', daysLeft, status: 'red' };
  }
  
  if (daysLeft <= 2) {
    return { color: 'var(--danger)', label: 'Urgent', daysLeft, status: 'red' };
  }
  
  if (daysLeft <= 4) {
    return { color: '#f97316', label: 'Halfway', daysLeft, status: 'orange' }; // Orange
  }
  
  if (daysLeft <= 7) {
    return { color: 'var(--warning)', label: 'Approaching', daysLeft, status: 'yellow' };
  }

  return { color: 'var(--success)', label: 'Healthy', daysLeft, status: 'green' };
};
