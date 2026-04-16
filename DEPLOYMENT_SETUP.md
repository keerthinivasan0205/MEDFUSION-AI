# Multi-Platform Deployment Setup

Your application is now configured to run on **3 different platforms**:

## Architecture
```
┌─────────────────────────────────────────────────────┐
│ Frontend (React/Vite) - Render Static Site         │
│ URL: https://your-frontend.onrender.com             │
└──────────────────┬──────────────────────────────────┘
                   │ VITE_API_URL=
                   ▼
┌─────────────────────────────────────────────────────┐
│ Backend (Flask/Python) - Railways                   │
│ URL: https://calm-enjoyment-production.up.railway.app│
└──────────────────┬──────────────────────────────────┘
                   │ DATABASE_URL=
                   ▼
┌─────────────────────────────────────────────────────┐
│ Database (PostgreSQL) - Render                      │
│ Connection: $DATABASE_URL (from Render)             │
└─────────────────────────────────────────────────────┘
```

---

## 1️⃣ Backend Setup (Railways)

### Prerequisites:
- Railways account with your repo connected
- PostgreSQL database URL available

### Required Environment Variables on Railways:

```
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
PYTHON_VERSION=3.10.13
```

### Railway Service Configuration:

**Service Name:** MEDFUSION-AI  
**Runtime:** Python  
**Build Command:** `pip install -r requirements.txt`  
**Start Command:** `gunicorn main:app --bind 0.0.0.0:$PORT --timeout 120 --workers 1`

### Key Files Modified:
- ✅ `backend/main.py` - CORS configured for all origins
- ✅ `backend/app/routes/report.py` - Supports multiple deployment paths
- ✅ `backend/app/predictors/xray_predictor.py` - Grad CAM returns base64

---

## 2️⃣ Frontend Setup (Render Static Site)

### Prerequisites:
- Render account
- Your frontend GitHub repo

### Build Environment:
```yaml
buildCommand: npm install && VITE_API_URL=https://calm-enjoyment-production.up.railway.app/api npm run build
```

### Render Configuration (render.yaml):
```yaml
services:
  - type: web
    name: MEDFUSION-AI-FRONTEND
    env: static
    rootDir: frontend
    buildCommand: npm install && VITE_API_URL=https://calm-enjoyment-production.up.railway.app/api npm run build
    staticPublishPath: dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### Key Files Modified:
- ✅ `frontend/src/services/api.js` - Uses VITE_API_URL env var
- ✅ `frontend/src/components/ResultPanel.jsx` - Dynamic URLs
- ✅ `frontend/src/components/PredictionPage.jsx` - Dynamic URLs
- ✅ `frontend/src/pages/History.jsx` - Dynamic URLs

---

## 3️⃣ Database Setup (Render PostgreSQL)

### Setup:
1. Create PostgreSQL instance on Render
2. Get the connection string `DATABASE_URL`
3. Add to Railways backend environment variables

### Connection String Format:
```
postgresql://username:password@host:port/database
```

---

## 🚀 Deployment Checklist

### Step 1: Update Railways Backend
- [ ] Push changes to your GitHub repository
- [ ] Railways will auto-deploy if connected
- [ ] Verify backend is running: Visit `https://calm-enjoyment-production.up.railway.app/api/auth/health`

### Step 2: Update Render Frontend
- [ ] Ensure `render.yaml` is at root of repository
- [ ] Connect your GitHub repo to Render
- [ ] Render will auto-deploy on push
- [ ] Verify frontend loads and API calls work

### Step 3: Test the Full Flow
- [ ] Go to frontend URL
- [ ] Login with a test account
- [ ] Upload an image
- [ ] Verify prediction works
- [ ] Download PDF report ✅
- [ ] Verify Grad CAM image displays ✅

---

## 🔧 API Endpoints Reference

### Report Download (Updated URL Structure)
```
GET /report/<filename>
Example: https://calm-enjoyment-production.up.railway.app/report/medical_report_1_20260416_120000.pdf
```

### Predictions with Grad CAM
```
POST /api/prediction/xray
Returns: {
  "gradcam_image": "base64_encoded_string",
  "report_path": "reports/medical_report_1_timestamp.pdf",
  ...
}
```

---

## ⚠️ Important Notes

### About File Persistence
- **Render**: Ephemeral filesystem - reports deleted on redeploy
- **Railways**: Also ephemeral - reports deleted on restart
- **Solution**: Use S3 or similar cloud storage for production

### CORS Configuration
- Backend allows all origins: `"origins": "*"`
- Report endpoint accessible from any domain
- For production, restrict to specific frontend URL

### Environment Variables
Always use environment variables, never hardcode:
```javascript
// ✅ Correct
const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000/api';

// ❌ Wrong
const apiUrl = 'https://my-backend.com/api';
```

---

## 📝 Quick Reference: URLs to Replace

**If your Railways URL changes**, update in:
1. `render.yaml` - buildCommand line
2. `frontend/.env.production` (if you create one)

---

## 🆘 Troubleshooting

### Frontend can't connect to backend
- Check CORS is enabled on backend
- Verify Railway backend URL in buildCommand
- Check browser console for exact error

### Reports not downloading
- Check path: `/report/<filename>` (not `/api/report/`)
- Verify file exists on backend
- Check browser network tab for 404 errors

### Grad CAM not showing
- Verify backend returns base64 string
- Check frontend receives `gradcam_image` field
- Inspect Network tab - is image data present?

---

## 📚 File Structure Reminder

```
project/
├── render.yaml              ← Updated for frontend only
├── backend/
│   ├── main.py             ← ✅ Updated CORS
│   ├── config.py
│   ├── requirements.txt
│   └── app/
│       ├── routes/report.py    ← ✅ Updated paths
│       ├── predictors/
│       │   └── xray_predictor.py ← ✅ Updated base64
│       └── utils/pdf_generator.py
└── frontend/
    ├── src/
    │   ├── services/api.js      ← Uses VITE_API_URL
    │   └── components/
    │       ├── ResultPanel.jsx   ← ✅ Updated URLs
    │       └── PredictionPage.jsx ← ✅ Updated URLs
    └── package.json
```

---

## ✅ What's Ready to Deploy

All fixes are in place! Just:
1. Commit and push to GitHub
2. Railways auto-deploys backend
3. Render auto-deploys frontend
4. Everything should work! 🎉
