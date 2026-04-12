import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Activity, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.access_token, data.name || form.email.split('@')[0]);
      toast.success('Access granted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid relative overflow-hidden"
      style={{ background: '#0B0F1A' }}>
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,102,255,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-pulse"
            style={{ background: 'linear-gradient(135deg,#0066ff,#00d4ff)' }}>
            <Activity className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="font-display font-bold text-2xl text-white tracking-wide">MEDFUSION AI</h1>
          <p className="text-slate-500 text-sm mt-1">Advanced Medical Diagnostics Platform</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8">
          <h2 className="font-display font-semibold text-white text-lg mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="input-dark pl-10" type="email" placeholder="you@example.com" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="input-dark pl-10 pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Authenticating...</>
                : 'Access System'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            New user?{' '}
            <Link to="/register" className="font-medium transition-colors hover:opacity-80" style={{ color: '#00d4ff' }}>
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Protected by end-to-end encryption · HIPAA compliant
        </p>
      </motion.div>
    </div>
  );
}
