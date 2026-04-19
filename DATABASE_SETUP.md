# Database Configuration - Render PostgreSQL

## Overview
Your project uses a **PostgreSQL database hosted on Render** for global production deployment. This is the cloud database that powers your application in production.

---

## 🗄️ Render PostgreSQL Database

### Database Type
- **Type:** PostgreSQL
- **Hosting Platform:** Render
- **Environment:** Production

### Connection String Format
```
postgresql://username:password@host:port/database
```

**Example:**
```
postgresql://user:password@dpg-xyz.render.com:5432/ai_disease_db
```

---

## 🔧 Configuration Details

### Environment Variable
Your backend retrieves the database connection via:
```
DATABASE_URL=postgresql://username:password@host:port/dbname
```

This environment variable is set in your **Render backend service** and automatically used by Flask-SQLAlchemy.

### Configuration in [config.py](backend/config.py)
```python
db_url = os.getenv("DATABASE_URL")  # Gets URL from Render

if db_url:
    # Fix postgres:// → postgresql:// (Render compatibility)
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = db_url  # Use Render PostgreSQL
```

### Key Features:
- ✅ **Automatic protocol conversion** - Handles `postgres://` to `postgresql://` format
- ✅ **Environment-based connection** - Uses `DATABASE_URL` from Render
- ✅ **SQLAlchemy integration** - Via Flask-SQLAlchemy (v3.0.5)
- ✅ **PostgreSQL driver** - psycopg2-binary for secure connections

---

## 📊 Database Tables & Structure

### Table 1: **users**
Stores user account information and authentication details.

```
Column Name    | Type           | Constraints
───────────────────────────────────────────────
id             | Integer        | PRIMARY KEY
name           | String(100)    | NOT NULL
email          | String(120)    | UNIQUE, NOT NULL
password       | String(255)    | NOT NULL (hashed)
role           | String(20)     | DEFAULT: "user"
created_at     | DateTime       | DEFAULT: UTC NOW
```

**Purpose:** Authentication, user profiles, role-based access control

---

### Table 2: **prediction_history**
Logs all medical predictions made by the AI models.

```
Column Name     | Type           | Constraints
────────────────────────────────────────────────
id              | Integer        | PRIMARY KEY
user_id         | Integer        | FOREIGN KEY → users.id
disease_type    | String(50)     | Optional
predicted_class | String(100)    | Optional
confidence      | Float          | Optional
risk_level      | String(20)     | Optional
report_path     | String(255)    | Optional
created_at      | DateTime       | DEFAULT: UTC NOW
```

**Purpose:** Store ML model predictions, results, and generated reports for audit trail

---

## 🔗 Database Relationships

```
users (1) ──────────── (Many) prediction_history
   │
   ├─ id (Primary Key)
   │
   └─ predictions (Relationship: backref)
                    │
                    ├─ user_id (Foreign Key)
                    └─ Links to parent User record
```

**Relationship Type:** One-to-Many
- Each user can have multiple predictions
- Each prediction belongs to exactly one user
- Cascading operations link user records to their prediction history

---

## 🚀 Render Deployment Setup

### Required Environment Variables on Render Backend Service

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
```

### How to Set Up on Render:

1. **Create PostgreSQL Database on Render**
   - Log in to Render dashboard
   - Create new PostgreSQL instance
   - Copy the connection string

2. **Add to Backend Service Environment**
   - Go to Railways/Backend service settings
   - Add environment variable: `DATABASE_URL`
   - Paste the PostgreSQL connection string

3. **Verify Connection**
   - Backend will automatically initialize tables on first run
   - Check Render logs for successful connection

---

## 💾 Database Dependencies

From [requirements.txt](backend/requirements.txt):
- **Flask-SQLAlchemy** (3.0.5) - ORM and database abstraction layer
- **psycopg2-binary** (2.9.9) - PostgreSQL database driver for Python

---

## 📝 Database Operations

Your application performs the following operations:

1. **User Management**
   - Register new users (stores in `users` table)
   - Authenticate users (email/password validation)
   - Manage user roles (admin/user permissions)

2. **Prediction Logging**
   - Store all ML predictions (disease type, confidence, risk level)
   - Link predictions to user accounts
   - Track prediction history over time

3. **Report Generation**
   - Store path to generated PDF reports
   - Associate reports with specific predictions
   - Enable report retrieval by users

4. **Audit Trail**
   - Track creation timestamps for all records
   - Maintain user-prediction relationships
   - Enable historical analysis

---

## 🔒 Security Features

- ✅ **Foreign Key Constraints** - Maintains data integrity
- ✅ **Unique Email Constraint** - Prevents duplicate accounts
- ✅ **Password Hashing** - Via Flask-Bcrypt
- ✅ **Environment Variables** - Never expose credentials in code
- ✅ **SQLAlchemy ORM** - Prevents SQL injection attacks

---

## ✅ Configuration Summary

| Setting | Value |
|---------|-------|
| **Database Type** | PostgreSQL |
| **Hosting** | Render Cloud |
| **Connection Method** | Environment Variable (`DATABASE_URL`) |
| **ORM Framework** | SQLAlchemy |
| **Driver** | psycopg2-binary |
| **Primary Key Strategy** | Auto-incrementing Integer |
| **Timestamp Format** | UTC DateTime |
| **Track Modifications** | Disabled (performance optimization) |

---

## 🌍 Production Architecture

```
┌──────────────────────────────────────┐
│ Frontend (React)                     │
│ Hosted on Render Static Site         │
└────────────────┬─────────────────────┘
                 │ API Requests
                 ▼
┌──────────────────────────────────────┐
│ Backend (Flask/Python)               │
│ Hosted on Railways                   │
└────────────────┬─────────────────────┘
                 │ DATABASE_URL
                 ▼
┌──────────────────────────────────────┐
│ PostgreSQL Database                  │
│ Hosted on Render                     │
│ Connection: Global/Cloud             │
└──────────────────────────────────────┘
```

This PostgreSQL database is the **global, persistent data store** for your production application, ensuring all user data and predictions are safely stored and accessible across deployments.
