import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';
import ResultCard from '../components/ResultCard';

export default function PredictionPage({ title, description, endpoint, icon: Icon, color }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

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
      toast.success('Prediction complete!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-md`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
        </div>
      </div>

      <div className="card space-y-4">
        <ImageUpload onFileSelect={handleFileSelect} preview={preview} onClear={handleClear} />

        <button onClick={handleSubmit} disabled={loading || !file} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Analyzing...
            </>
          ) : 'Analyze Image'}
        </button>
      </div>

      {loading && (
        <div className="card mt-4 flex flex-col items-center gap-3 py-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-100 border-t-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">AI is analyzing your image...</p>
        </div>
      )}

      <ResultCard result={result} />

      {result?.report_path && (
        <a
          href={`http://127.0.0.1:5000/${result.report_path}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
          Download PDF Report
        </a>
      )}
    </div>
  );
}
