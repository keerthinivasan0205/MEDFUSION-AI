import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Trash2, Users, BarChart3, ShieldCheck } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Legend as CJSLegend, Tooltip as CJSTooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, CJSLegend, CJSTooltip);

const COLORS = ['#00d4ff', '#a78bfa', '#f59e0b', '#ff6b9d'];
const RISK_COLORS = { High: '#ff3366', Medium: '#f59e0b', Low: '#00ff88' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
        <p className="text-slate-400">{label}</p>
        <p className="text-white font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/users').catch(() => ({ data: [] })),
      api.get('/admin/predictions').catch(() => ({ data: [] })),
    ]).then(([u, p]) => { setUsers(u.data); setPredictions(p.data); }).finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/delete-user/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const typeCount = predictions.reduce((acc, p) => { acc[p.disease] = (acc[p.disease] || 0) + 1; return acc; }, {});
  const riskCount = predictions.reduce((acc, p) => { acc[p.risk] = (acc[p.risk] || 0) + 1; return acc; }, {});
  const barData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  const pieData = Object.entries(riskCount).map(([name, value]) => ({ name, value }));

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'predictions', label: 'Predictions', icon: BarChart3 },
    { id: 'stats', label: 'Analytics', icon: ShieldCheck },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Tabs */}
      <div className="glass neon-border rounded-2xl p-1 flex gap-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={tab === id
              ? { background: 'rgba(0,212,255,0.12)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }
              : { color: '#64748b' }}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00d4ff' }} />
        </div>
      ) : (
        <>
          {/* Users */}
          {tab === 'users' && (
            <div className="glass neon-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    {['ID', 'Name', 'Email', 'Role', 'Action'].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-medium uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="px-5 py-4 text-slate-600 text-xs">{u.id}</td>
                      <td className="px-5 py-4 font-medium text-slate-300">{u.name}</td>
                      <td className="px-5 py-4 text-slate-400">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={u.role === 'admin'
                            ? { background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }
                            : { background: 'rgba(0,212,255,0.12)', color: '#00d4ff' }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {u.role !== 'admin' && (
                          <button onClick={() => deleteUser(u.id)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: '#ff3366' }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Predictions */}
          {tab === 'predictions' && (
            <div className="glass neon-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    {['ID', 'User ID', 'Type', 'Result', 'Confidence', 'Risk'].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-medium uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="px-5 py-4 text-slate-600 text-xs">{p.id}</td>
                      <td className="px-5 py-4 text-slate-500">{p.user_id}</td>
                      <td className="px-5 py-4 capitalize font-medium text-slate-300">{p.disease}</td>
                      <td className="px-5 py-4 capitalize text-slate-400">{p.prediction?.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-4 text-slate-400">{p.confidence}%</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: `${RISK_COLORS[p.risk] || '#64748b'}20`, color: RISK_COLORS[p.risk] || '#64748b' }}>
                          {p.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats */}
          {tab === 'stats' && (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Users', value: users.length, color: '#00d4ff' },
                  { label: 'Total Predictions', value: predictions.length, color: '#a78bfa' },
                  { label: 'High Risk Cases', value: riskCount['High'] || 0, color: '#ff3366' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass neon-border rounded-2xl p-5 text-center">
                    <p className="text-3xl font-display font-bold" style={{ color }}>{value}</p>
                    <p className="text-xs text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass neon-border rounded-2xl p-6">
                  <h4 className="font-display font-semibold text-white text-sm mb-5">Predictions by Type</h4>
                  {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-slate-600 text-sm text-center py-8">No data yet</p>}
                </div>
                <div className="glass neon-border rounded-2xl p-6">
                  <h4 className="font-display font-semibold text-white text-sm mb-5">Risk Distribution</h4>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {pieData.map((entry, i) => <Cell key={i} fill={RISK_COLORS[entry.name] || COLORS[i]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-slate-600 text-sm text-center py-8">No data yet</p>}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
