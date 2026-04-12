import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Sun, Moon, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/skin', label: 'Skin' },
  { to: '/xray', label: 'X-Ray' },
  { to: '/fracture', label: 'Fracture' },
  { to: '/auto', label: 'Auto' },
  { to: '/history', label: 'History' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (to) => location.pathname === to;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Activity className="w-6 h-6" />
          MEDFUSION AI
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(to) ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-purple-50 text-purple-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              Admin
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Hi, {user?.name || 'User'}</span>
          <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive(to) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-purple-600">Admin</Link>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 mt-1">
            <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
