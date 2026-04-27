# 📋 Task Management System

A production-level, full-stack Task Management System with role-based access control.

## 🏗️ Tech Stack
- **Frontend:** React.js + Vite
- **Backend:** Node.js + Express.js
- **Database:** MySQL

## 👥 Roles
| Role | Access |
|------|--------|
| Admin | Full system control |
| Project Manager | Projects, Teams, Reports |
| Team Leader | Tasks, Approvals |
| Team Member | My Tasks, File Upload |

## 📁 Folder Structure
```
task-management-system/
├── backend/
│   ├── config/          # DB & env config
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, roles, validation
│   ├── models/          # SQL schema
│   ├── routes/          # API routes
│   ├── services/        # Shared services
│   ├── utils/           # Logger, helpers, constants
│   ├── uploads/         # File storage
│   ├── scripts/         # Seed script
│   ├── app.js
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── common/  # Reusable UI
        │   ├── layout/  # Sidebar, Topbar
        │   └── forms/   # Form components
        ├── context/     # AuthContext
        ├── hooks/       # Custom hooks
        ├── pages/       # All page components
        │   ├── admin/
        │   ├── pm/
        │   ├── tl/
        │   └── tm/
        ├── routes/      # AppRoutes.jsx
        ├── services/    # API service layer
        └── styles/      # Global styles
```

## 🚀 Quick Start

### 1. Setup Database
```bash
# Login to MySQL
mysql -u root -p
# Run the schema
source backend/models/schema.sql
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 3. Seed Default Admin
```bash
cd backend
npm run seed
```

### 4. Install & Run
```bash
# Install all dependencies
npm run install:all

# Run both servers (dev mode)
npm run dev
```

The app runs at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔑 Default Login (after seed)
| Email | Password | Role |
|-------|----------|------|
| admin@taskmaster.com | admin123 | Admin |

## 📡 API Endpoints
- `POST /api/auth/login`
- `GET /api/projects`
- `POST /api/teams`
- `GET /api/tasks`
- `PUT /api/tasks/:id/approve`
- Full docs in `/docs`
