import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Activity, FileDown, Brain } from 'lucide-react';

const riskConfig = {
  High:   { color: '#ff3366', bg: 'rgba(255,51,102,0.1)',  border: 'rgba(255,51,102,0.3)',  icon: AlertTriangle, label: 'HIGH RISK' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  icon: AlertTriangle, label: 'MEDIUM RISK' },
  Low:    { color: '#00ff88', bg: 'rgba(0,255,136,0.1)',   border: 'rgba(0,255,136,0.3)',   icon: CheckCircle,   label: 'LOW RISK' },
};

// ✅ Build correct download URL from report_path like "reports/medical_report_1_xxx.pdf"
function buildReportUrl(reportPath) {
  if (!reportPath) return null;
  // Normalize backslashes → forward slashes
  const normalized = reportPath.replace(/\\/g, '/');
  // Extract just the filename
  const filename = normalized.split('/').pop();
  return `http://127.0.0.1:5000/reports/${filename}`;
}

export default function ResultPanel({ result, reportPath }) {
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.1)' }}>
          <Brain className="w-9 h-9 text-slate-600" />
        </div>
        <div>
          <p className="text-slate-400 font-medium">Awaiting Analysis</p>
          <p className="text-slate-600 text-sm mt-1">Upload an image and click Analyze</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'rgba(0,212,255,0.3)' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }} />
          ))}
        </div>
      </div>
    );
  }

  const risk = riskConfig[result.risk_level] || riskConfig.Low;
  const Icon = risk.icon;
  const confidence = result.confidence ?? 0;
  const displayClass = (result.predicted_class || result.prediction || '').replace(/_/g, ' ');
  const downloadUrl = buildReportUrl(reportPath);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* Risk badge */}
      <div className="rounded-xl p-4 flex items-center gap-3"
        style={{ background: risk.bg, border: `1px solid ${risk.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${risk.color}20` }}>
          <Icon className="w-5 h-5" style={{ color: risk.color }} />
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest" style={{ color: risk.color }}>{risk.label}</p>
          <p className="text-sm text-slate-300 mt-0.5">{result.recommendation}</p>
        </div>
      </div>

      {/* Predicted class */}
      <div className="glass rounded-xl p-4">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Detected Condition</p>
        <p className="text-xl font-display font-bold capitalize"
          style={{ color: result.risk_level === 'High' ? '#ff3366' : '#00d4ff' }}>
          {displayClass || '—'}
        </p>
        {result.detected_type && (
          <p className="text-xs text-slate-500 mt-1">
            Image type:{' '}
            <span style={{ color: '#00d4ff' }} className="capitalize">{result.detected_type.replace(/_/g, ' ')}</span>
            {result.final_disease && (
              <> → <span style={{ color: '#00d4ff' }} className="capitalize">{result.final_disease}</span></>
            )}
          </p>
        )}
      </div>

      {/* Confidence bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Confidence Score</p>
          <span className="font-display font-bold text-lg" style={{ color: '#00d4ff' }}>{confidence}%</span>
        </div>
        <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(confidence, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              background: confidence > 70
                ? 'linear-gradient(90deg,#ff3366,#ff6b6b)'
                : confidence > 40
                  ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                  : 'linear-gradient(90deg,#00ff88,#00d4ff)',
              boxShadow: `0 0 10px ${confidence > 70 ? '#ff3366' : confidence > 40 ? '#f59e0b' : '#00ff88'}60`,
            }} />
        </div>
      </div>

      {/* Grad-CAM */}
      {result.gradcam_image && (
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Grad-CAM Heatmap</p>
          <div className="relative rounded-xl overflow-hidden">
            <img src={`data:image/png;base64,${result.gradcam_image}`} alt="Grad-CAM"
              className="w-full max-h-48 object-contain" style={{ background: 'rgba(0,0,0,0.3)' }} />
            <div className="absolute top-2 left-2 glass rounded-lg px-2 py-1">
              <span className="text-xs" style={{ color: '#00d4ff' }}>AI Attention Map</span>
            </div>
          </div>
        </div>
      )}

      {/* Observations for xray */}
      {result.type === 'pneumonia' && (
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Observations</p>
          <ul className="space-y-2">
            {[
              result.predicted_class === 'pneumonia' ? 'Pulmonary opacity detected in lung fields' : 'Clear lung fields — no opacity',
              `Model confidence: ${confidence}%`,
              `Risk classification: ${result.risk_level}`,
            ].map((obs, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                <Activity className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#00d4ff' }} />
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ Fixed download button */}
      {downloadUrl && (
        <a href={downloadUrl} target="_blank" rel="noreferrer"
          className="btn-outline-neon w-full flex items-center justify-center gap-2">
          <FileDown className="w-4 h-4" />
          Download PDF Report
        </a>
      )}
    </motion.div>
  );
}
