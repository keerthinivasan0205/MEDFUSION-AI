import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE, clearSession, isAuthError } from '../utils/auth'

export default function DashboardPage({ user, token, setToken, setUser, theme, setTheme, reports, setReports }) {
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

  const cards = {
    skin: { title: 'Skin Disease', subtitle: 'Skin image analytics' },
    pneumonia: { title: 'Pneumonia Disease', subtitle: 'Chest X-ray analytics' },
    fracture: { title: 'Bone Fracture', subtitle: 'Bone X-ray analytics' },
  }

  const analyze = async () => {
    if (!file) { setError('Upload image first'); return }
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
        if (isAuthError(res.status, data)) {
          clearSession(setToken, setUser, navigate, setError)
          return
        }
        setError(data.error || data.message || 'Prediction failed')
      }
    } catch {
      setError('Backend not reachable')
    }
    setLoading(false)
  }

  const generateReport = async () => {
    setReportStatus('Generating report...')
    try {
      const res = await fetch(`${API_BASE}/api/report/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
        if (isAuthError(res.status, data)) {
          clearSession(setToken, setUser, navigate, setReportStatus)
          return
        }
        setReportStatus(data.error || data.msg || data.message || `Failed with status ${res.status}`)
      }
    } catch (err) {
      console.error('Report generation failed:', err)
      setReportStatus(`Could not reach backend: ${err?.message || 'unknown error'}`)
    }
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
                <button className="action" onClick={analyze} disabled={loading}>
                  {loading ? 'Analyzing...' : 'Upload & Analyze'}
                </button>
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
