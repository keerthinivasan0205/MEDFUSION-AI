import { motion } from 'framer-motion';
import { FileText, BarChart3, Settings as SettingsIcon, Construction } from 'lucide-react';

function PlaceholderPage({ icon: Icon, title, color }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-96 gap-5">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
        <Icon className="w-9 h-9" style={{ color }} />
      </div>
      <div className="text-center">
        <h3 className="font-display font-semibold text-white text-lg">{title}</h3>
        <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5 justify-center">
          <Construction className="w-3.5 h-3.5" /> Coming soon
        </p>
      </div>
    </motion.div>
  );
}

export function Reports() {
  return <PlaceholderPage icon={FileText} title="Reports" color="#00d4ff" />;
}

export function Analytics() {
  return <PlaceholderPage icon={BarChart3} title="Analytics" color="#a78bfa" />;
}

export function SettingsPage() {
  return <PlaceholderPage icon={SettingsIcon} title="Settings" color="#f59e0b" />;
}
