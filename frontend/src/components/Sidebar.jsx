import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Microscope, Stethoscope, Bone, Zap,
  FileText, BarChart3, Settings, LogOut, Activity, Users, Brain, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/skin', icon: Microscope, label: 'Skin Disease' },
  { to: '/xray', icon: Stethoscope, label: 'X-Ray Analysis' },
  { to: '/fracture', icon: Bone, label: 'Fracture Detection' },
  { to: '/auto', icon: Zap, label: 'Auto Detection' },
  { to: '/brain-tumor', icon: Brain, label: 'Brain Tumor', badge: 'Demo' },
  { to: '/retinopathy', icon: Eye, label: 'Retinopathy', badge: 'Demo' },
  { to: '/history', icon: Users, label: 'Patient Records' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40"
      style={{ background: 'rgba(11,15,26,0.97)', borderRight: '1px solid rgba(0,212,255,0.1)' }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b flex-shrink-0" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0066ff,#00d4ff)', boxShadow: '0 0 20px rgba(0,212,255,0.4)' }}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2"
              style={{ borderColor: '#0B0F1A' }} />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-sm tracking-wide">MEDFUSION</h1>
            <p className="text-xs" style={{ color: '#00d4ff' }}>AI Diagnostics</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontSize: '10px' }}>
                {badge}
              </span>
            )}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
        <div className="glass rounded-xl p-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#0066ff,#00d4ff)' }}>
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs capitalize" style={{ color: '#00d4ff' }}>{user?.role || 'user'}</p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="sidebar-link w-full"
          style={{ color: 'rgba(248,113,113,0.8)' }}>
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
