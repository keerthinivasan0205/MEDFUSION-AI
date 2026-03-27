import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE, clearSession, isAuthError } from '../utils/auth'

const SECTION_META = {
  skin: {
    title: 'Skin Disease Analysis',
    subtitle: 'Upload a skin image for AI-powered lesion classification',
    icon: '🔬',
    color: '#0ea5e9',
  },
  pneumonia: {
    title: 'Pneumonia Detection',
    subtitle: 'Upload a chest X-ray for pneumonia screening',
    icon: '🫁',
    color: '#6366f1',
  },
  fracture: {
    title: 'Bone Fracture Detection',
    subtitle: 'Upload a bone X-ray for fracture analysis',
    icon: '🦴',
    color: '#10b981',
  },
}

const RISK_CONFIG = {
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   label: '⚠ High Risk'   },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  label: '⚡ Medium Risk' },
  Low:    { color: '#10b981', bg: 'rgba(16,185,129,0.10)',  label: '✓ Low Risk'    },
}

function ConfidenceBar({ value }) {
  const pct = typeof value === 'number' ? value : parseFloat(value) || 0
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="conf-bar-wrap">
      <div className="conf-bar-track">
        <div className="conf-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="conf-bar-label" style={{ color }}>{pct}%</span>
    </div>
  )
}

function ProbabilityBars({ probs }) {
  if (!probs || typeof probs !== 'object') return null
  const entries = Object.entries(probs).sort((a, b) => b[1] - a[1])
  return (
    <div className="prob-grid">
      {entries.map(([cls, val]) => (
        <div key={cls} className="prob-row">
          <span className="prob-label">{cls.replace(/_/g, ' ')}</span>
          <div className="prob-track">
            <div className="prob-fill" style={{ width: `${val}%` }} />
          </div>
          <span className="prob-val">{val}%</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage({ user, token, setToken, setUser, theme, setTheme, reports, setReports }) {
  const navigate = useNavigate()
  const [section, setSection] = useState('skin')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
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

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setResult(null)
    setError('')
    if (f) setPreview(URL.createObjectURL(f))
    else setPreview(null)
  }

  const handleSectionChange = (s) => {
    setSection(s)
    setResult(null)
    setError('')
    setFile(null)
    setPreview(null)
    setReportStatus('')
    setReportPath('')
  }

  const analyze = async () => {
    if (!file) { setError('Please upload an image first'); return }
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
      try { data = await res.json() }
      catch {
        const text = await res.text().catch(() => '')
        throw new Error(`Unexpected response (${res.status}): ${text || 'empty body'}`)
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
      setReportStatus(`Could not reach backend: ${err?.message || 'unknown error'}`)
    }
  }

  const meta = SECTION_META[section]
  const risk = result?.risk_level ? RISK_CONFIG[result.risk_level] || RISK_CONFIG.Low : null

  return (
    <div className="dashboard-page">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div>
          <p className="small">Welcome back</p>
          <h1>Hi, {user.name}</h1>
          <p className="subtitle">Your MedFusion AI workspace</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="main-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <Link to="/dashboard/profile">
            <button className="action">👤 Profile</button>
          </Link>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* ── Sidebar ── */}
        <nav className="sidebar">
          <p className="sidebar-label">Diagnostics</p>
          {Object.entries(SECTION_META).map(([key, m]) => (
            <button
              key={key}
              className={section === key ? 'active' : ''}
              onClick={() => handleSectionChange(key)}
            >
              <span>{m.icon}</span> {m.title.split(' ')[0]} {m.title.split(' ')[1]}
            </button>
          ))}
          <div className="sidebar-divider" />
          <p className="sidebar-label">Records</p>
          <Link to="/dashboard/reports" className="nav-item">📋 Reports</Link>
        </nav>

        {/* ── Main Content ── */}
        <main className="dashboard-content">

          {/* ── Analysis Panel ── */}
          <div className="analysis-row">

            {/* Left: Upload + Result */}
            <section className="card analysis-main">
              <div className="section-header">
                <span className="section-icon" style={{ background: `${meta.color}18`, color: meta.color }}>
                  {meta.icon}
                </span>
                <div>
                  <h2>{meta.title}</h2>
                  <p>{meta.subtitle}</p>
                </div>
              </div>

              {/* Upload Zone */}
              <label className="upload-zone" htmlFor="file-input">
                {preview ? (
                  <img src={preview} alt="preview" className="upload-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📁</span>
                    <span className="upload-hint">Click or drag an image here</span>
                    <span className="upload-sub">PNG, JPG, JPEG supported</span>
                  </div>
                )}
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                <button className="action" onClick={analyze} disabled={loading} style={{ flex: 1 }}>
                  {loading ? (
                    <><span className="spinner" /> Analyzing...</>
                  ) : (
                    <> 🧠 Analyze Image</>
                  )}
                </button>
                {file && (
                  <button className="main-btn" onClick={() => { setFile(null); setPreview(null); setResult(null); setError('') }}>
                    ✕ Clear
                  </button>
                )}
              </div>

              {error && <p className="error-text">⚠ {error}</p>}

              {/* ── Result Panel ── */}
              {result && (
                <div className="result-panel">
                  <div className="result-panel-header">
                    <span className="result-title">Analysis Result</span>
                    {risk && (
                      <span className="risk-badge" style={{ color: risk.color, background: risk.bg }}>
                        {risk.label}
                      </span>
                    )}
                  </div>

                  <div className="result-grid">
                    <div className="result-item">
                      <span className="result-item-label">Predicted Class</span>
                      <span className="result-item-value" style={{ color: meta.color }}>
                        {result.predicted_class?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="result-item">
                      <span className="result-item-label">Confidence</span>
                      <ConfidenceBar value={result.confidence} />
                    </div>
                    <div className="result-item result-item-full">
                      <span className="result-item-label">Recommendation</span>
                      <span className="result-recommendation">{result.recommendation}</span>
                    </div>
                  </div>

                  {result.class_probabilities && (
                    <div className="result-probs">
                      <span className="result-item-label">Class Probabilities</span>
                      <ProbabilityBars probs={result.class_probabilities} />
                    </div>
                  )}
                </div>
              )}

              {/* Placeholder when no result */}
              {!result && !loading && (
                <div className="result-empty">
                  <span className="result-empty-icon">📊</span>
                  <p>Upload an image and click <strong>Analyze</strong> to see results here</p>
                </div>
              )}

              {loading && (
                <div className="result-empty">
                  <span className="spinner large" />
                  <p>Running AI analysis...</p>
                </div>
              )}
            </section>

            {/* Right: Report Generation */}
            <section className="card report-sidebar">
              <h3>📄 Report Generation</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
                Generate a PDF report from your latest analysis result.
              </p>

              <button
                className="action"
                onClick={generateReport}
                disabled={!result}
                style={{ width: '100%', opacity: result ? 1 : 0.5, cursor: result ? 'pointer' : 'not-allowed' }}
              >
                📥 Generate Report
              </button>

              {reportStatus && (
                <p className={reportStatus.toLowerCase().includes('successfully') ? 'success-text' : 'error-text'}>
                  {reportStatus.toLowerCase().includes('successfully') ? '✓' : '⚠'} {reportStatus}
                </p>
              )}

              {reportPath && (
                <div className="report-download-box">
                  <span className="report-file-icon">📑</span>
                  <div className="report-file-info">
                    <span className="report-file-name">{reportFilename || reportPath.replace(/\\/g, '/').split('/').pop()}</span>
                    <span className="report-file-sub">PDF Report · Ready</span>
                  </div>
                  <a
                    href={`${API_BASE}/api/report/download/${encodeURIComponent(reportFilename || reportPath.replace(/\\/g, '/').split('/').pop())}`}
                    className="action"
                    style={{ marginTop: 0, padding: '8px 14px', fontSize: '0.82rem' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ⬇ Download
                  </a>
                </div>
              )}

              {/* Recent reports mini list */}
              {reports.length > 0 && (
                <div className="mini-reports">
                  <span className="result-item-label" style={{ marginBottom: '8px', display: 'block' }}>Recent Reports</span>
                  {reports.slice(0, 3).map((r) => (
                    <div key={r.id} className="mini-report-item">
                      <span className="mini-report-id">{r.id}</span>
                      <span className="mini-report-label">{r.label}</span>
                      <span className="mini-report-status">✓</span>
                    </div>
                  ))}
                  <Link to="/dashboard/reports" style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '6px', display: 'block' }}>
                    View all reports →
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* ── Quick Insights ── */}
          <section className="card">
            <h3 style={{ marginBottom: '14px' }}>📈 Quick Insights</h3>
            <div className="insight-grid">
              <div className="insight">
                <span className="insight-icon">⏱</span>
                <span className="insight-label">Avg Diagnosis Time</span>
                <strong>1m 34s</strong>
              </div>
              <div className="insight">
                <span className="insight-icon">🔍</span>
                <span className="insight-label">Pending Reviews</span>
                <strong>5</strong>
              </div>
              <div className="insight">
                <span className="insight-icon">📅</span>
                <span className="insight-label">Monthly Scans</span>
                <strong>196</strong>
              </div>
              <div className="insight">
                <span className="insight-icon">✅</span>
                <span className="insight-label">Reports Generated</span>
                <strong>{reports.length}</strong>
              </div>
              <div className="insight">
                <span className="insight-icon">🎯</span>
                <span className="insight-label">Model Accuracy</span>
                <strong>{section === 'skin' ? '89%' : section === 'pneumonia' ? '91%' : '87%'}</strong>
              </div>
              <div className="insight">
                <span className="insight-icon">🧬</span>
                <span className="insight-label">Active Module</span>
                <strong>{SECTION_META[section].title.split(' ')[0]}</strong>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}
