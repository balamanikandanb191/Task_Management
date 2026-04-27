-- ============================================================
-- Task Management System — MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS task_management_db 
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE task_management_db;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin','project_manager','team_leader','team_member') NOT NULL DEFAULT 'team_member',
  avatar      VARCHAR(255) DEFAULT NULL,
  is_active   TINYINT(1)  DEFAULT 1,
  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initialize Default Admin
INSERT IGNORE INTO users (name, email, password, role) 
VALUES ('System Admin', 'admin123@gmail.com', '$2b$10$7/O8M7mXqU8sQG5h1yK.O.a77G5P8Y0N3h4m0R/iG7h/9K1O0zS.', 'admin');

-- ============================================================
-- 2. PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  status      ENUM('active','completed','on_hold') DEFAULT 'active',
  deadline    DATE DEFAULT NULL,
  created_by  INT NOT NULL,                        -- FK → users (PM)
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- ============================================================
-- 3. TEAMS (one team per project, one TL per team)
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  project_id      INT NOT NULL,
  team_leader_id  INT DEFAULT NULL,                -- FK → users (TL)
  name            VARCHAR(150) NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id)     REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (team_leader_id) REFERENCES users(id)    ON DELETE SET NULL
);

-- ============================================================
-- 4. TEAM MEMBERS (many TMs per team)
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  team_id    INT NOT NULL,
  user_id    INT NOT NULL,                         -- FK → users (TM)
  joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_team_member (team_id, user_id),
  FOREIGN KEY (team_id)  REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  project_id       INT NOT NULL,
  team_id          INT DEFAULT NULL,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  priority         ENUM('Low','Medium','High')     DEFAULT 'Medium',
  status           ENUM('Pending','In Progress','Completed') DEFAULT 'Pending',
  approval_status  ENUM('pending_review','approved','rejected') DEFAULT 'pending_review',
  rejection_reason TEXT DEFAULT NULL,
  submission_notes TEXT DEFAULT NULL,
  submission_link  VARCHAR(255) DEFAULT NULL,
  assigned_to      INT DEFAULT NULL,               -- FK → users (TM)
  created_by       INT DEFAULT NULL,               -- FK → users (TL)
  deadline         DATE DEFAULT NULL,
  submitted_at     TIMESTAMP DEFAULT NULL,
  approved_at      TIMESTAMP DEFAULT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id)     REFERENCES teams(id)    ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id)    ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id)    ON DELETE SET NULL
);

-- ============================================================
-- 6. TASK FILES
-- ============================================================
CREATE TABLE IF NOT EXISTS task_files (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  task_id       INT NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_type     VARCHAR(100) DEFAULT NULL,
  file_size     INT DEFAULT NULL,
  uploaded_by   INT NOT NULL,
  uploaded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id)     REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 7. TASK COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS task_comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  task_id    INT NOT NULL,
  user_id    INT NOT NULL,
  comment    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id)  REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(50) DEFAULT 'info',           -- info | success | warning | error
  is_read    TINYINT(1)  DEFAULT 0,
  link       VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 9. ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT DEFAULT NULL,
  action      VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50)  DEFAULT NULL,           -- project | task | user | team
  entity_id   INT          DEFAULT NULL,
  details     TEXT         DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 10. PROJECT FILES
-- ============================================================
CREATE TABLE IF NOT EXISTS project_files (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  project_id    INT NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_type     VARCHAR(100) DEFAULT NULL,
  file_size     INT DEFAULT NULL,
  uploaded_by   INT NOT NULL,
  uploaded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 11. PROJECT COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS project_comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id    INT NOT NULL,
  comment    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

-- ============================================================
-- 12. PASSWORD RESET REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  email       VARCHAR(150) NOT NULL,
  status      ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_tasks_assigned   ON tasks(assigned_to);
CREATE INDEX idx_tasks_project    ON tasks(project_id);
CREATE INDEX idx_tasks_status     ON tasks(status);
CREATE INDEX idx_tasks_approval   ON tasks(approval_status);
CREATE INDEX idx_notif_user       ON notifications(user_id, is_read);
CREATE INDEX idx_activity_user    ON activity_logs(user_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_proj_comm_proj    ON project_comments(project_id);
CREATE INDEX idx_pwd_reset_email   ON password_reset_requests(email);
