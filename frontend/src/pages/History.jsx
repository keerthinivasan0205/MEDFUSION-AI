import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Download, FileText, Search } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/history/').then(({ data }) => setHistory(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = history.filter((h) =>
    h.disease_type?.toLowerCase().includes(search.toLowerCase()) ||
    h.prediction?.toLowerCase().includes(search.toLowerCase())
  );

  const riskStyle = (risk) => ({
    High: { bg: 'rgba(255,51,102,0.12)', color: '#ff3366' },
    Medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    Low: { bg: 'rgba(0,255,136,0.12)', color: '#00ff88' },
  }[risk] || { bg: 'rgba(100,116,139,0.12)', color: '#64748b' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="glass neon-border rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <FileText className="w-5 h-5" style={{ color: '#00d4ff' }} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white">Patient Records</h3>
            <p className="text-xs text-slate-500">{history.length} total predictions</p>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-dark pl-9 w-52 text-xs py-2" placeholder="Search records..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="glass neon-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00d4ff' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="text-slate-500">No records found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                {['#', 'Date', 'Disease Type', 'Result', 'Confidence', 'Risk Level', 'Report'].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-medium uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => {
                const rs = riskStyle(h.risk_level);
                return (
                  <motion.tr key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="transition-colors hover:bg-white/[0.02]"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="px-5 py-4 text-slate-600 text-xs">{i + 1}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{h.date}</td>
                    <td className="px-5 py-4 capitalize font-medium text-slate-300">{h.disease_type}</td>
                    <td className="px-5 py-4 capitalize text-slate-400">{h.prediction?.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${h.confidence}%`, background: '#00d4ff' }} />
                        </div>
                        <span className="text-slate-400 text-xs">{h.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: rs.bg, color: rs.color }}>
                        {h.risk_level}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {h.report_path ? (
                        <a href={`http://127.0.0.1:5000/${h.report_path}`} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                          style={{ color: '#00d4ff' }}>
                          <Download className="w-3.5 h-3.5" /> PDF
                        </a>
                      ) : <span className="text-slate-700">—</span>}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
