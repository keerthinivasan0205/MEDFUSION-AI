import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:5000`

// Defined before clearSession so the reference is valid
const initialUser = {
  name: 'MedFusion User',
  email: '',
  age: 25,
  gender: 'Other',
  phone: '',
}

function clearSession(setToken, setUser, navigate, messageSetter) {
  localStorage.removeItem('medfusion-token')
  localStorage.removeItem('medfusion-user')
  setToken('')
  setUser(initialUser)
  if (messageSetter) messageSetter('Session expired. Please log in again.')
  if (navigate) navigate('/')
}

function isAuthError(status, data) {
  if (!status) return false
  if (status === 401 || status === 422) return true
  const msg = ((data && (data.msg || data.message || data.error)) || '').toLowerCase()
  return msg.includes('token') || msg.includes('authorization') || msg.includes('expired')
}

function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback
  } catch {
    return fallback
  }
}

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/" replace />
  return children
}

function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')

  const handleSignUp = async () => {
    if (!form.name || !form.email || !form.password) {
      setMessage('Complete all fields')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Registered. Redirecting to login...')
        setTimeout(() => navigate('/'), 1000)
      } else {
        setMessage(data.message || 'Register failed')
      }
    } catch {
      setMessage('Cannot reach backend')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p>Start diagnosing with MedFusion AI.</p>
        <label>Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
        <label>Email</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
        <button onClick={handleSignUp}>Sign Up</button>
        {message && <p style={{ color: '#dc2626' }}>{message}</p>}
        <p>
          Already a member? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  )
}

function Login({ setToken, setUser }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please enter credentials')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        const userData = { ...initialUser, name: data.user?.name || 'MedFusion User', email: data.user?.email || form.email }
        localStorage.setItem('medfusion-token', data.access_token)
        localStorage.setItem('medfusion-user', JSON.stringify(userData))
        setToken(data.access_token)
        setUser(userData)
        navigate('/dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch {
      setError('Failed to connect to backend')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login to MedFusion</h1>
        <p>Access your AI diagnostics dashboard.</p>
        <label>Email</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
        <button onClick={handleLogin}>Login</button>
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        <p>
          New? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  )
}

function Dashboard({ user, token, setToken, setUser, theme, setTheme, reports, setReports }) {
  const navigate = useNavigate()
  const [section, setSection] = useState('skin')
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportStatus, setReportStatus] = useState('')
  const [reportPath, setReportPath] = useState('')
  const [reportFilename, setReportFilename] = useState('')

  const endpointMap = {
    skin: '/api/prediction/skin',
    pneumonia: '/api/prediction/xray',
    fracture: '/api/prediction/fracture',
  }

  const sectionLabels = {
    skin: 'Skin classification',
    pneumonia: 'Pneumonia analysis',
    fracture: 'Fracture detection',
  }

  const analyze = async () => {
    if (!file) {
      setError('Upload image first')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${API_BASE}${endpointMap[section]}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        const errorText = data.error || data.message || 'Prediction failed'

        if (isAuthError(res.status, { error: data.error, msg: data.msg, message: data.message })) {
          clearSession(setToken, setUser, navigate, setError)
          return
        }

        setError(errorText)
      }
    } catch {
      setError('Backend not reachable')
    }
    setLoading(false)
  }

  const generateReport = async () => {
    if (!token) {
      setReportStatus('Please log in to generate reports.')
      return
    }

    setReportStatus('Generating report...')

    try {
      const res = await fetch(`${API_BASE}/api/report/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })

      let data
      try {
        data = await res.json()
      } catch {
        const text = await res.text().catch(() => '')
        throw new Error(`Unexpected response format (${res.status}): ${text || 'empty body'}`)
      }

      if (res.ok) {
        setReportStatus('Report generated successfully.')
        setReportPath(data.report_path)
        setReportFilename(data.report_filename)

        const filename = data.report_filename || data.report_path?.replace(/\\/g, '/').split('/').pop() || ''
        const newReport = {
          id: `RPT-${Date.now()}`,
          label: sectionLabels[section],
          path: data.report_path,
          filename,
          status: 'Completed',
          createdAt: new Date().toLocaleString(),
        }

        setReports((prev) => {
          const updated = [newReport, ...prev]
          localStorage.setItem('medfusion-reports', JSON.stringify(updated))
          return updated
        })
      } else {
        const errorText = data.error || data.msg || data.message || `Report generation failed with status ${res.status}`

        if (isAuthError(res.status, { error: data.error, msg: data.msg, message: data.message })) {
          clearSession(setToken, setUser, navigate, setReportStatus)
          return
        }

        setReportStatus(errorText)
      }
    } catch (err) {
      console.error('Report generation request failed:', err)
      setReportStatus(`Could not reach backend for report generation: ${err?.message || 'unknown error'}`)
    }
  }

  const cards = {
    skin: { title: 'Skin Disease', subtitle: 'Skin image analytics', cases: 124, accuracy: '89%' },
    pneumonia: { title: 'Pneumonia Disease', subtitle: 'Chest X-ray analytics', cases: 93, accuracy: '91%' },
    fracture: { title: 'Bone Fracture', subtitle: 'Bone X-ray analytics', cases: 78, accuracy: '87%' },
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="small">Welcome back</p>
          <h1>Hi, {user.name}</h1>
          <p className="subtitle">Your MedFusion workspace</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="main-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
          <Link to="/dashboard/profile" className="nav-item">
            <button className="action">Profile</button>
          </Link>
        </div>
      </header>

      <div className="dashboard-grid">
        <nav className="sidebar">
          <button className={section === 'skin' ? 'active' : ''} onClick={() => setSection('skin')}>Skin Disease</button>
          <button className={section === 'pneumonia' ? 'active' : ''} onClick={() => setSection('pneumonia')}>Pneumonia</button>
          <button className={section === 'fracture' ? 'active' : ''} onClick={() => setSection('fracture')}>Bone Fracture</button>
          <Link to="/dashboard/reports" className="nav-item">Reports</Link>
        </nav>

        <main className="dashboard-content">
          <div className="analysis-row">
            <section className="card analysis-main">
              <h2>{cards[section].title}</h2>
              <p>{cards[section].subtitle}</p>
              <div className="upload-row">
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                <button className="action" onClick={analyze} disabled={loading}>{loading ? 'Analyzing...' : 'Upload & Analyze'}</button>
              </div>

              <div className="result-block">
                <p><strong>Class:</strong> {result?.predicted_class || '-'}</p>
                <p><strong>Confidence:</strong> {result?.confidence || '-'}</p>
                <p><strong>Risk:</strong> {result?.risk_level || '-'}</p>
                <p><strong>Recommendation:</strong> {result?.recommendation || '-'}</p>
              </div>

              {error && <p className="error-text">{error}</p>}
            </section>

            <section className="reports report-sidebar">
              <h3>Report Generation</h3>
              <button className="action" onClick={generateReport}>Generate</button>
              {reportStatus && (
                <p className={reportStatus.toLowerCase().includes('successfully') ? 'success-text' : 'error-text'}>
                  {reportStatus}
                </p>
              )}
              {reportPath && (
                <div style={{ marginTop: '8px' }}>
                  <p>Saved: <strong>{reportPath}</strong></p>
                  <a
                    href={`${API_BASE}/api/report/download/${encodeURIComponent(reportFilename || reportPath.replace(/\\/g, '/').split('/').pop())}`}
                    className="action"
                    style={{ display: 'inline-block', textDecoration: 'none' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download PDF
                  </a>
                </div>
              )}
            </section>
          </div>

          <section className="reports">
            <h3>Quick Insights</h3>
            <div className="insight-grid">
              <div className="insight">Avg diagnosis time: <strong>1m 34s</strong></div>
              <div className="insight">Pending reviews: <strong>5</strong></div>
              <div className="insight">Monthly scans: <strong>196</strong></div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function Profile({ user, setUser }) {
  const [form, setForm] = useState(user)
  const [saved, setSaved] = useState(false)

  const save = () => {
    setUser(form)
    localStorage.setItem('medfusion-user', JSON.stringify(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  return (
    <div className="details-page">
      <div className="details-card">
        <div className="details-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><p className="small">Your profile</p><h2>{form.name}</h2><p>{form.email}</p></div>
          <div style={{ display:'flex', gap:'10px' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <button className="action">Home</button>
            </Link>
            <button className="main-btn">Details</button>
          </div>
        </div>
        <div className="details-grid"><div><strong>Name</strong><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div><strong>Email</strong><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div><div><strong>Age</strong><input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} /></div><div><strong>Gender</strong><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option>Female</option><option>Male</option><option>Other</option></select></div><div><strong>Phone</strong><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div></div>
        <div style={{ marginTop: '12px' }}><button className="action" onClick={save}>Save profile</button> {saved && <span style={{ color: '#059669' }}>Saved!</span>}</div>
      </div>
      <div className="details-card"><h3>Medical notes</h3><textarea style={{ width: '100%', minHeight: '100px', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px' }} value={form.notes || ''} placeholder="Add medical notes..." onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
    </div>
  )
}

function Reports({ reports, setReports }) {
  const clearReports = () => {
    setReports([])
    localStorage.removeItem('medfusion-reports')
  }

  return (
    <div className="reports-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2>Generated Reports</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {reports.length > 0 && (
            <button className="action" style={{ background: '#dc2626' }} onClick={clearReports}>
              Clear All
            </button>
          )}
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="action">Home</button>
          </Link>
        </div>
      </div>

      {reports.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No reports generated yet. Go to the dashboard and click Generate.</p>
      ) : (
        <div className="report-list">
          {reports.map((r) => (
            <div className="report-item" key={r.id}>
              <strong>{r.id}</strong> | {r.label} | {r.createdAt} |{' '}
              <span style={{ color: r.status === 'Completed' ? '#059669' : '#d97706' }}>{r.status}</span>
              {r.filename && (
                <>
                  {' '}|{' '}
                  <a
                    href={`${API_BASE}/api/report/download/${encodeURIComponent(r.filename)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#2563eb' }}
                  >
                    Download PDF
                  </a>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  // Safe localStorage parsing — prevents crash on corrupted data
  const storedUser = safeJsonParse(localStorage.getItem('medfusion-user'), initialUser)
  const storedToken = localStorage.getItem('medfusion-token') || ''
  const storedTheme = localStorage.getItem('medfusion-theme') || 'light'
  const storedReports = safeJsonParse(localStorage.getItem('medfusion-reports'), [])

  const [user, setUser] = useState(storedUser)
  const [token, setToken] = useState(storedToken)
  const [backendStatus, setBackendStatus] = useState('Checking...')
  const [theme, setTheme] = useState(storedTheme)
  const [reports, setReports] = useState(storedReports)

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark')
    document.body.classList.add(`theme-${theme}`)
    localStorage.setItem('medfusion-theme', theme)
  }, [theme])

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/health`, { method: 'GET' })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') setBackendStatus('Connected')
        else setBackendStatus('Unavailable')
      })
      .catch(() => setBackendStatus('Unavailable'))
  }, [])

  return (
    <div className="app-shell">
      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: backendStatus === 'Connected' ? '#059669' : '#dc2626', marginBottom: 8 }}>
        Backend: {backendStatus}
      </div>
      <Routes>
        <Route path="/" element={<Login setToken={setToken} setUser={setUser} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute token={token}>
              <Dashboard
                user={user}
                token={token}
                setToken={setToken}
                setUser={setUser}
                theme={theme}
                setTheme={setTheme}
                reports={reports}
                setReports={setReports}
              />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard/profile" element={
          <ProtectedRoute token={token}>
            <Profile user={user} setUser={setUser} />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/reports" element={
          <ProtectedRoute token={token}>
            <Reports reports={reports} setReports={setReports} />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App
