import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Skin from './pages/Skin';
import Xray from './pages/Xray';
import Fracture from './pages/Fracture';
import Auto from './pages/Auto';
import BrainTumor from './pages/BrainTumor';
import Retinopathy from './pages/Retinopathy';
import History from './pages/History';
import Admin from './pages/Admin';
import { Reports, Analytics, SettingsPage } from './pages/Placeholders';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15,22,40,0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(0,212,255,0.2)',
              backdropFilter: 'blur(12px)',
              fontSize: '13px',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/skin" element={<Skin />} />
            <Route path="/xray" element={<Xray />} />
            <Route path="/fracture" element={<Fracture />} />
            <Route path="/auto" element={<Auto />} />
            <Route path="/brain-tumor" element={<BrainTumor />} />
            <Route path="/retinopathy" element={<Retinopathy />} />
            <Route path="/history" element={<History />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
