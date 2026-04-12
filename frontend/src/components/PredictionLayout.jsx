import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';
import ResultPanel from './ResultPanel';

export default function PredictionLayout({ title, endpoint, icon: Icon, color, tips = [] }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (f) => { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); };
  const handleClear = () => { setFile(null); setPreview(null); setResult(null); };

  const handleSubmit = async () => {
    if (!file) return toast.error('Please select an image first');
    const formData = new FormData();
    formData.append('image', file);
    setLoading(true);
    try {
      const { data } = await api.post(`/prediction/${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      toast.success('Analysis complete');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left: Upload */}
      <div className="space-y-4">
        <div className="glass neon-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-sm">Upload Image</h3>
              <p className="text-xs text-slate-500">Select or drag a medical image</p>
            </div>
          </div>

          <ImageUpload onFileSelect={handleFileSelect} preview={preview} onClear={handleClear} />

          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} disabled={loading || !file} className="btn-neon flex-1 flex items-center justify-center gap-2">
              {loading
                ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Analyzing...</>
                : <><Icon className="w-4 h-4" /> Analyze Image</>}
            </button>
            {file && (
              <button onClick={handleClear} className="btn-outline-neon px-4">Clear</button>
            )}
          </div>
        </div>

        {/* Tips */}
        {tips.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Upload Tips</p>
            <ul className="space-y-2">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right: Results */}
      <div className="glass neon-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: loading ? '#f59e0b' : result ? '#00ff88' : '#475569' }} />
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            {loading ? 'Processing...' : result ? 'Analysis Complete' : 'Awaiting Input'}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-6 py-16">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(0,212,255,0.1)', borderTopColor: '#00d4ff' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="w-7 h-7" style={{ color }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-sm">AI Model Processing</p>
              <p className="text-slate-500 text-xs mt-1">Analyzing image patterns...</p>
            </div>
            <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}, #00d4ff)` }}
                animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
          </div>
        ) : (
          <ResultPanel result={result} reportPath={result?.report_path} />
        )}
      </div>
    </motion.div>
  );
}
