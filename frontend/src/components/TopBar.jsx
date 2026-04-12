import { motion } from 'framer-motion';
import { Bell, Search, Wifi } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between px-8 py-4 border-b"
      style={{ borderColor: 'rgba(0,212,255,0.08)', background: 'rgba(11,15,26,0.8)', backdropFilter: 'blur(12px)' }}
    >
      <div>
        <h2 className="font-display font-semibold text-white text-lg">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* System status */}
        <div className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
          <Wifi className="w-3.5 h-3.5" style={{ color: '#00ff88' }} />
          <span style={{ color: '#00ff88' }}>System Active</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input placeholder="Search..." className="input-dark pl-9 w-44 text-xs py-2" />
        </div>

        {/* Notifications */}
        <button className="relative glass rounded-xl p-2.5 hover:border-cyan-500/30 transition-colors">
          <Bell className="w-4 h-4 text-slate-400" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#0066ff,#00d4ff)' }}>
          {(user?.name || 'U')[0].toUpperCase()}
        </div>
      </div>
    </motion.header>
  );
}
