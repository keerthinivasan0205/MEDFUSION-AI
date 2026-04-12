import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, FlaskConical, AlertTriangle, CheckCircle, Construction } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const DUMMY_RESULTS = [
  { predicted_class: 'No DR', grade: 0, confidence: 94.2, risk_level: 'Low', recommendation: 'No diabetic retinopathy detected. Annual screening recommended.' },
  { predicted_class: 'Mild DR', grade: 1, confidence: 78.5, risk_level: 'Low', recommendation: 'Mild non-proliferative DR. Monitor every 12 months.' },
  { predicted_class: 'Moderate DR', grade: 2, confidence: 83.1, risk_level: 'Medium', recommendation: 'Moderate DR detected. Ophthalmology follow-up in 6 months.' },
  { predicted_class: 'Severe DR', grade: 3, confidence: 88.7, risk_level: 'High', recommendation: 'Severe DR detected. Urgent ophthalmology referral required.' },
  { predicted_class: 'Proliferative DR', grade: 4, confidence: 91.4, risk_level: 'High', recommendation: 'Proliferative DR detected. Immediate laser treatment consultation needed.' },
];

const riskConfig = {
  High:   { color: '#ff3366', bg: 'rgba(255,51,102,0.1)',  border: 'rgba(255,51,102,0.3)',  icon: AlertTriangle },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  icon: AlertTriangle },
  Low:    { color: '#00ff88', bg: 'rgba(0,255,136,0.1)',   border: 'rgba(0,255,136,0.3)',   icon: CheckCircle },
};

const gradeColors = ['#00ff88', '#a3e635', '#f59e0b', '#f97316', '#ff3366'];

export default function Retinopathy() {
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
    }, 2000);
  };

  const risk = result ? (riskConfig[result.risk_level] || riskConfig.Low) : null;
  const gradeColor = result ? gradeColors[result.grade] : '#00d4ff';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Coming soon banner */}
      <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3"
        style={{ border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.06)' }}>
        <Construction className="w-4 h-4 flex-shrink-0" style={{ color: '#06b6d4' }} />
        <p className="text-sm" style={{ color: '#06b6d4' }}>
          <span className="font-semibold">Demo Mode</span> — Diabetic Retinopathy model is under development. Results shown are simulated for UI preview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload */}
        <div className="space-y-4">
          <div className="glass neon-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
                <Eye className="w-5 h-5" style={{ color: '#06b6d4' }} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white text-sm">Diabetic Retinopathy Detection</h3>
                <p className="text-xs text-slate-500">Upload a retinal fundus image for grading</p>
              </div>
            </div>

            <ImageUpload onFileSelect={handleFileSelect} preview={preview} onClear={handleClear}
              label="Upload Retinal Fundus Image" />

            <div className="flex gap-3 mt-4">
              <button onClick={handleAnalyze} disabled={loading || !file}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}>
                {loading
                  ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Analyzing...</>
                  : <><Eye className="w-4 h-4" /> Analyze Retina</>}
              </button>
              {file && <button onClick={handleClear} className="btn-outline-neon px-4">Clear</button>}
            </div>
          </div>

          {/* DR Grade Scale */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">DR Grading Scale</p>
            <div className="space-y-2">
              {[
                { grade: 0, label: 'No DR', color: '#00ff88' },
                { grade: 1, label: 'Mild', color: '#a3e635' },
                { grade: 2, label: 'Moderate', color: '#f59e0b' },
                { grade: 3, label: 'Severe', color: '#f97316' },
                { grade: 4, label: 'Proliferative', color: '#ff3366' },
              ].map(({ grade, label, color }) => (
                <div key={grade} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-4">{grade}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(grade + 1) * 20}%`, background: color }} />
                  </div>
                  <span className="text-xs text-slate-400 w-20">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="glass neon-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: loading ? '#f59e0b' : result ? '#00ff88' : '#475569' }} />
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              {loading ? 'Grading Retina...' : result ? 'Analysis Complete' : 'Awaiting Input'}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-6 py-16">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(6,182,212,0.1)', borderTopColor: '#06b6d4' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Eye className="w-7 h-7" style={{ color: '#06b6d4' }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-sm">Analyzing Retinal Patterns</p>
                <p className="text-slate-500 text-xs mt-1">Detecting microaneurysms & lesions...</p>
              </div>
              <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#0891b2,#06b6d4)' }}
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

              {/* Class + Grade */}
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Detected Condition</p>
                <p className="text-xl font-display font-bold" style={{ color: gradeColor }}>
                  {result.predicted_class}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-500">DR Grade:</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((g) => (
                      <div key={g} className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                        style={{
                          background: g <= result.grade ? `${gradeColors[result.grade]}20` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${g <= result.grade ? gradeColors[result.grade] : 'rgba(255,255,255,0.08)'}`,
                          color: g <= result.grade ? gradeColors[result.grade] : '#475569',
                        }}>
                        {g}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confidence */}
              <div className="glass rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Confidence Score</p>
                  <span className="font-display font-bold text-lg" style={{ color: '#06b6d4' }}>{result.confidence}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ background: 'linear-gradient(90deg,#0891b2,#06b6d4)', boxShadow: '0 0 10px rgba(6,182,212,0.5)' }} />
                </div>
              </div>

              {/* Demo note */}
              <div className="glass rounded-xl p-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 flex-shrink-0" style={{ color: '#06b6d4' }} />
                <p className="text-xs text-slate-500">This is a simulated result. Real model coming soon.</p>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center py-16">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.1)' }}>
                <Eye className="w-9 h-9 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">Awaiting Retinal Image</p>
              <p className="text-slate-600 text-sm">Upload a fundus image and click Analyze</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
