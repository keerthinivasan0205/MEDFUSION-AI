import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, FlaskConical, AlertTriangle, CheckCircle, Construction } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const DUMMY_RESULTS = [
  { predicted_class: 'Glioma Tumor', confidence: 87.4, risk_level: 'High', recommendation: 'Glioma detected. Immediate neurosurgery consultation recommended.' },
  { predicted_class: 'Meningioma Tumor', confidence: 72.1, risk_level: 'Medium', recommendation: 'Meningioma detected. Schedule MRI follow-up and neurology consult.' },
  { predicted_class: 'Pituitary Tumor', confidence: 91.3, risk_level: 'High', recommendation: 'Pituitary tumor detected. Endocrinology and neurosurgery referral advised.' },
  { predicted_class: 'No Tumor', confidence: 96.8, risk_level: 'Low', recommendation: 'No tumor detected. Brain MRI appears normal.' },
];

const riskConfig = {
  High:   { color: '#ff3366', bg: 'rgba(255,51,102,0.1)',  border: 'rgba(255,51,102,0.3)',  icon: AlertTriangle },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  icon: AlertTriangle },
  Low:    { color: '#00ff88', bg: 'rgba(0,255,136,0.1)',   border: 'rgba(0,255,136,0.3)',   icon: CheckCircle },
};

export default function BrainTumor() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (f) => { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); };
  const handleClear = () => { setFile(null); setPreview(null); setResult(null); };

  const handleAnalyze = () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const r = DUMMY_RESULTS[Math.floor(Math.random() * DUMMY_RESULTS.length)];
      setResult(r);
      setLoading(false);
    }, 2200);
  };

  const risk = result ? (riskConfig[result.risk_level] || riskConfig.Low) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Coming soon banner */}
      <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3"
        style={{ border: '1px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.06)' }}>
        <Construction className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
        <p className="text-sm" style={{ color: '#a78bfa' }}>
          <span className="font-semibold">Demo Mode</span> — Brain Tumor MRI model is under development. Results shown are simulated for UI preview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload */}
        <div className="space-y-4">
          <div className="glass neon-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)' }}>
                <Brain className="w-5 h-5" style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white text-sm">Brain Tumor MRI Detection</h3>
                <p className="text-xs text-slate-500">Upload a brain MRI scan for analysis</p>
              </div>
            </div>

            <ImageUpload onFileSelect={handleFileSelect} preview={preview} onClear={handleClear}
              label="Upload Brain MRI Image" />

            <div className="flex gap-3 mt-4">
              <button onClick={handleAnalyze} disabled={loading || !file}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', boxShadow: '0 0 20px rgba(167,139,250,0.3)' }}>
                {loading
                  ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Analyzing...</>
                  : <><Brain className="w-4 h-4" /> Analyze MRI</>}
              </button>
              {file && <button onClick={handleClear} className="btn-outline-neon px-4">Clear</button>}
            </div>
          </div>

          {/* Tips */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Upload Tips</p>
            <ul className="space-y-2">
              {[
                'Use T1 or T2 weighted MRI sequences',
                'Axial, coronal, or sagittal views supported',
                'Ensure full brain coverage in the image',
                'DICOM exports converted to PNG/JPG work best',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#a78bfa' }} />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Results */}
        <div className="glass neon-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: loading ? '#f59e0b' : result ? '#00ff88' : '#475569' }} />
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              {loading ? 'Processing MRI...' : result ? 'Analysis Complete' : 'Awaiting Input'}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-6 py-16">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(167,139,250,0.1)', borderTopColor: '#a78bfa' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-7 h-7" style={{ color: '#a78bfa' }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-sm">Scanning MRI Patterns</p>
                <p className="text-slate-500 text-xs mt-1">Analyzing brain tissue...</p>
              </div>
              <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} />
              </div>
            </div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Risk */}
              <div className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: risk.bg, border: `1px solid ${risk.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${risk.color}20` }}>
                  <risk.icon className="w-5 h-5" style={{ color: risk.color }} />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest" style={{ color: risk.color }}>
                    {result.risk_level.toUpperCase()} RISK
                  </p>
                  <p className="text-sm text-slate-300 mt-0.5">{result.recommendation}</p>
                </div>
              </div>

              {/* Class */}
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Detected Condition</p>
                <p className="text-xl font-display font-bold"
                  style={{ color: result.risk_level === 'High' ? '#ff3366' : result.risk_level === 'Medium' ? '#f59e0b' : '#00ff88' }}>
                  {result.predicted_class}
                </p>
              </div>

              {/* Confidence */}
              <div className="glass rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Confidence Score</p>
                  <span className="font-display font-bold text-lg" style={{ color: '#a78bfa' }}>{result.confidence}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', boxShadow: '0 0 10px rgba(167,139,250,0.5)' }} />
                </div>
              </div>

              {/* Demo note */}
              <div className="glass rounded-xl p-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                <p className="text-xs text-slate-500">This is a simulated result. Real model coming soon.</p>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center py-16">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.1)' }}>
                <Brain className="w-9 h-9 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">Awaiting MRI Upload</p>
              <p className="text-slate-600 text-sm">Upload a brain MRI and click Analyze</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
