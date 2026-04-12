import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageMeta = {
  '/dashboard':    { title: 'Dashboard',                  subtitle: 'AI Medical Diagnostics Overview' },
  '/skin':         { title: 'Skin Disease Detection',     subtitle: 'Dermatology AI Analysis' },
  '/xray':         { title: 'X-Ray Analysis',             subtitle: 'Pneumonia Detection via Chest X-Ray' },
  '/fracture':     { title: 'Fracture Detection',         subtitle: 'Bone Abnormality Analysis' },
  '/auto':         { title: 'Auto Detection',             subtitle: 'AI-Powered Automatic Disease Classification' },
  '/brain-tumor':  { title: 'Brain Tumor Detection',      subtitle: 'MRI-Based Neural Analysis — Demo' },
  '/retinopathy':  { title: 'Diabetic Retinopathy',       subtitle: 'Retinal Fundus Grading — Demo' },
  '/history':      { title: 'Patient Records',            subtitle: 'Prediction History & Reports' },
  '/reports':      { title: 'Reports',                    subtitle: 'Generated Medical Reports' },
  '/analytics':    { title: 'Analytics',                  subtitle: 'System Performance & Statistics' },
  '/settings':     { title: 'Settings',                   subtitle: 'System Configuration' },
  '/admin':        { title: 'Admin Panel',                subtitle: 'User & System Management' },
};

export default function Layout() {
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] || { title: 'MEDFUSION AI', subtitle: '' };

  return (
    <div className="flex h-screen" style={{ background: '#0B0F1A' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6 bg-grid">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
