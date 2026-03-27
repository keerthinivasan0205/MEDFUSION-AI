import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './styles.css'

import { API_BASE, initialUser, safeJsonParse } from './utils/auth'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ReportsPage from './pages/ReportsPage'

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(() => safeJsonParse(localStorage.getItem('medfusion-user'), initialUser))
  const [token, setToken] = useState(() => localStorage.getItem('medfusion-token') || '')
  const [theme, setTheme] = useState(() => localStorage.getItem('medfusion-theme') || 'light')
  const [reports, setReports] = useState(() => safeJsonParse(localStorage.getItem('medfusion-reports'), []))
  const [backendStatus, setBackendStatus] = useState('Checking...')

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark')
    document.body.classList.add(`theme-${theme}`)
    localStorage.setItem('medfusion-theme', theme)
  }, [theme])

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status === 'ok' ? 'Connected' : 'Unavailable'))
      .catch(() => setBackendStatus('Unavailable'))
  }, [])

  const sharedProps = { user, token, setToken, setUser, theme, setTheme, reports, setReports }

  return (
    <div className="app-shell">
      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: backendStatus === 'Connected' ? '#059669' : '#dc2626', marginBottom: 8 }}>
        Backend: {backendStatus}
      </div>
      <Routes>
        <Route path="/" element={<LoginPage setToken={setToken} setUser={setUser} />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute token={token}>
            <DashboardPage {...sharedProps} />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/profile" element={
          <ProtectedRoute token={token}>
            <ProfilePage user={user} setUser={setUser} />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/reports" element={
          <ProtectedRoute token={token}>
            <ReportsPage reports={reports} setReports={setReports} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
