// utils/constants.js — App-wide constants
module.exports = {
  ROLES: {
    ADMIN: 'admin',
    PROJECT_MANAGER: 'project_manager',
    TEAM_LEADER: 'team_leader',
    TEAM_MEMBER: 'team_member',
  },

  TASK_STATUS: {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
  },

  APPROVAL_STATUS: {
    PENDING_REVIEW: 'pending_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  PROJECT_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ON_HOLD: 'on_hold',
  },

  PRIORITY: {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  },

  ALLOWED_FILE_TYPES: ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png', 'image/gif', 'application/zip', 'application/x-zip-compressed'],

  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.zip'],
};
