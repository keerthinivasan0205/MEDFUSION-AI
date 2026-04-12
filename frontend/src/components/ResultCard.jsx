import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const riskConfig = {
  High: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: AlertTriangle },
  Medium: { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icon: Info },
  Low: { color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: CheckCircle },
};

export default function ResultCard({ result }) {
  if (!result) return null;
  const risk = riskConfig[result.risk_level] || riskConfig.Low;
  const Icon = risk.icon;
  const confidence = result.confidence ?? 0;

  return (
    <div className="card space-y-4 mt-4">
      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Prediction Result</h3>

      <div className={`flex items-start gap-3 p-4 rounded-xl border ${risk.bg} ${risk.border}`}>
        <Icon className={`w-5 h-5 mt-0.5 ${risk.color}`} />
        <div>
          <p className={`font-semibold capitalize ${risk.color}`}>{result.risk_level} Risk</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{result.recommendation}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Predicted Class</p>
          <p className="font-semibold text-gray-800 dark:text-gray-100 capitalize mt-1">{result.predicted_class?.replace(/_/g, ' ')}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Confidence</p>
          <p className="font-semibold text-gray-800 dark:text-gray-100 mt-1">{confidence}%</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Confidence Level</span>
          <span className="font-medium">{confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-700 ${confidence > 70 ? 'bg-red-500' : confidence > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Grad-CAM */}
      {result.gradcam_image && (
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Grad-CAM Visualization</p>
          <img src={`data:image/png;base64,${result.gradcam_image}`} alt="Grad-CAM" className="rounded-xl w-full max-h-64 object-contain border border-gray-200 dark:border-gray-700" />
        </div>
      )}

      {/* Auto detection extra info */}
      {result.detected_type && (
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
          Auto-detected image type: <span className="font-medium text-blue-600 capitalize">{result.detected_type?.replace(/_/g, ' ')}</span>
          {' → '}Disease: <span className="font-medium text-blue-600 capitalize">{result.final_disease}</span>
        </div>
      )}
    </div>
  );
}
