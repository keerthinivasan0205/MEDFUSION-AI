import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { Users, ScanLine, FileText, Brain, Microscope, Stethoscope, Bone, Zap, TrendingUp, Activity } from 'lucide-react';

const monthlyData = [
  { month: 'Oct', scans: 42 }, { month: 'Nov', scans: 68 }, { month: 'Dec', scans: 55 },
  { month: 'Jan', scans: 89 }, { month: 'Feb', scans: 73 }, { month: 'Mar', scans: 112 },
  { month: 'Apr', scans: 98 },
];

const diseaseCards = [
  { title: 'Skin Disease', icon: Microscope, to: '/skin', color: '#ff6b9d', desc: 'Dermatology AI' },
  { title: 'X-Ray Analysis', icon: Stethoscope, to: '/xray', color: '#00d4ff', desc: 'Pneumonia Detection' },
  { title: 'Fracture Detection', icon: Bone, to: '/fracture', color: '#f59e0b', desc: 'Bone Analysis' },
  { title: 'Auto Detection', icon: Zap, to: '/auto', color: '#a78bfa', desc: 'Smart Classification' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
        <p style={{ color: '#00d4ff' }}>{label}</p>
        <p className="text-white font-semibold">{payload[0].value} scans</p>
      </div>
    );
  }
  return null;
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/history/').then(({ data }) => setHistory(data)).catch(() => {});
  }, []);

  const typeCount = history.reduce((acc, h) => { acc[h.disease_type] = (acc[h.disease_type] || 0) + 1; return acc; }, {});
  const highRisk = history.filter((h) => h.risk_level === 'High').length;

  const stats = [
    { label: 'Total Scans', value: history.length, icon: ScanLine, color: '#00d4ff', change: '+12%' },
    { label: 'Skin Analyses', value: typeCount.skin || 0, icon: Microscope, color: '#ff6b9d', change: '+5%' },
    { label: 'X-Ray Scans', value: typeCount.xray || 0, icon: Stethoscope, color: '#a78bfa', change: '+8%' },
    { label: 'High Risk Cases', value: highRisk, icon: Brain, color: '#ff3366', change: '' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={fadeUp} className="glass-strong rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at right, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Welcome back</p>
            <h2 className="font-display font-bold text-2xl text-white">{user?.name || 'Doctor'}</h2>
            <p className="text-slate-400 text-sm mt-1">Here's your diagnostic overview for today</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00ff88' }} />
              <span className="text-xs text-slate-300">AI Models Online</span>
            </div>
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" style={{ color: '#00d4ff' }} />
              <span className="text-xs text-slate-300">System Healthy</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="stat-card">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              {change && (
                <span className="text-xs font-medium flex items-center gap-1" style={{ color: '#00ff88' }}>
                  <TrendingUp className="w-3 h-3" />{change}
                </span>
              )}
            </div>
            <p className="text-3xl font-display font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Chart + Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 glass neon-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-white">Monthly Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Total scans per month</p>
            </div>
            <div className="glass rounded-xl px-3 py-1.5 text-xs" style={{ color: '#00d4ff' }}>Last 7 months</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="scans" stroke="#00d4ff" strokeWidth={2}
                fill="url(#scanGrad)" dot={{ fill: '#00d4ff', r: 3 }} activeDot={{ r: 5, fill: '#00d4ff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Body visualization */}
        <motion.div variants={fadeUp} className="glass neon-border rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.05) 0%, transparent 70%)' }} />
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">AI Body Scanner</p>
          {/* SVG human body placeholder */}
          <div className="relative float-anim">
            <svg viewBox="0 0 100 200" className="w-28 h-48" fill="none">
              {/* Head */}
              <circle cx="50" cy="20" r="14" stroke="#00d4ff" strokeWidth="1.5" fill="rgba(0,212,255,0.05)" />
              {/* Neck */}
              <rect x="44" y="33" width="12" height="8" rx="2" stroke="#00d4ff" strokeWidth="1" fill="rgba(0,212,255,0.03)" />
              {/* Torso */}
              <rect x="28" y="41" width="44" height="60" rx="6" stroke="#00d4ff" strokeWidth="1.5" fill="rgba(0,212,255,0.04)" />
              {/* Left arm */}
              <rect x="10" y="43" width="16" height="50" rx="6" stroke="rgba(0,212,255,0.5)" strokeWidth="1" fill="rgba(0,212,255,0.02)" />
              {/* Right arm */}
              <rect x="74" y="43" width="16" height="50" rx="6" stroke="rgba(0,212,255,0.5)" strokeWidth="1" fill="rgba(0,212,255,0.02)" />
              {/* Left leg */}
              <rect x="28" y="103" width="18" height="70" rx="6" stroke="rgba(0,212,255,0.5)" strokeWidth="1" fill="rgba(0,212,255,0.02)" />
              {/* Right leg */}
              <rect x="54" y="103" width="18" height="70" rx="6" stroke="rgba(0,212,255,0.5)" strokeWidth="1" fill="rgba(0,212,255,0.02)" />
              {/* Heart pulse */}
              <circle cx="50" cy="62" r="6" stroke="#ff3366" strokeWidth="1" fill="rgba(255,51,102,0.1)">
                <animate attributeName="r" values="5;7;5" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.5;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
              {/* Scan lines */}
              <line x1="28" y1="55" x2="72" y2="55" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="28" y1="70" x2="72" y2="70" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="28" y1="85" x2="72" y2="85" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5" strokeDasharray="2 2" />
            </svg>
            {/* Scan overlay */}
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
              <div className="scan-line" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00ff88' }} />
            <span className="text-xs text-slate-400">All systems nominal</span>
          </div>
        </motion.div>
      </div>

      {/* Disease cards */}
      <motion.div variants={fadeUp}>
        <h3 className="font-display font-semibold text-white mb-4">Start Diagnosis</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {diseaseCards.map(({ title, icon: Icon, to, color, desc }) => (
            <Link key={to} to={to}>
              <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="glass rounded-2xl p-5 cursor-pointer transition-all duration-200 group"
                style={{ border: `1px solid ${color}20` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="font-semibold text-white text-sm group-hover:text-white transition-colors">{title}</p>
                <p className="text-xs text-slate-500 mt-1">{desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs" style={{ color }}>
                  <span>Analyze</span>
                  <span>→</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent history */}
      {history.length > 0 && (
        <motion.div variants={fadeUp} className="glass neon-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Recent Predictions</h3>
            <Link to="/history" className="text-xs hover:opacity-80 transition-opacity" style={{ color: '#00d4ff' }}>View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {['Type', 'Result', 'Confidence', 'Risk', 'Date'].map((h) => (
                    <th key={h} className="pb-3 text-xs font-medium uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((h, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                    <td className="py-3 capitalize font-medium text-slate-300">{h.disease_type}</td>
                    <td className="py-3 capitalize text-slate-400">{h.prediction?.replace(/_/g, ' ')}</td>
                    <td className="py-3 text-slate-400">{h.confidence}%</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: h.risk_level === 'High' ? 'rgba(255,51,102,0.15)' : h.risk_level === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(0,255,136,0.15)',
                          color: h.risk_level === 'High' ? '#ff3366' : h.risk_level === 'Medium' ? '#f59e0b' : '#00ff88',
                        }}>
                        {h.risk_level}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">{h.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
