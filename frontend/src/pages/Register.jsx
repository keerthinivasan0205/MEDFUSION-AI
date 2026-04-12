import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Activity, User, Mail, Lock } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. John Doe', icon: User },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@hospital.com', icon: Mail },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: Lock },
    { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••', icon: Lock },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid relative overflow-hidden"
      style={{ background: '#0B0F1A' }}>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,102,255,0.07) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-pulse"
            style={{ background: 'linear-gradient(135deg,#0066ff,#00d4ff)' }}>
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join MEDFUSION AI Platform</p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">{label}</label>
                <div className="relative">
                  <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="input-dark pl-10" type={type} placeholder={placeholder} required
                    value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Creating account...</>
                : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:opacity-80 transition-colors" style={{ color: '#00d4ff' }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
