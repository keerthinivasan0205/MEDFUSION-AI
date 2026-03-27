import { Link } from 'react-router-dom'
import { API_BASE } from '../utils/auth'

export default function ReportsPage({ reports, setReports }) {
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
