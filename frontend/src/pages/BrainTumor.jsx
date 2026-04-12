import { motion } from 'framer-motion';
import { Brain, Construction } from 'lucide-react';

export default function BrainTumor() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-96 gap-5">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
        <Brain className="w-9 h-9" style={{ color: '#a78bfa' }} />
      </div>
      <div className="text-center">
        <h3 className="font-display font-semibold text-white text-lg">Brain Tumor MRI Detection</h3>
        <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5 justify-center">
          <Construction className="w-3.5 h-3.5" /> Coming soon
        </p>
      </div>
    </motion.div>
  );
}
