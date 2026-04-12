import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImageIcon, ScanLine } from 'lucide-react';

export default function ImageUpload({ onFileSelect, preview, onClear, label = 'Upload Medical Image' }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFileSelect(file);
  }, [onFileSelect]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <AnimatePresence mode="wait">
      {preview ? (
        <motion.div key="preview"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 30px rgba(0,212,255,0.1)' }}>
          <img src={preview} alt="Preview" className="w-full max-h-72 object-contain"
            style={{ background: 'rgba(0,0,0,0.4)' }} />
          {/* Scan line animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="scan-line" />
          </div>
          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 rounded-tl" style={{ borderColor: '#00d4ff' }} />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 rounded-tr" style={{ borderColor: '#00d4ff' }} />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 rounded-bl" style={{ borderColor: '#00d4ff' }} />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 rounded-br" style={{ borderColor: '#00d4ff' }} />
          <button onClick={onClear}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,51,102,0.8)', backdropFilter: 'blur(8px)' }}>
            <X className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="absolute bottom-3 left-3 glass rounded-lg px-2 py-1 flex items-center gap-1.5">
            <ScanLine className="w-3 h-3" style={{ color: '#00d4ff' }} />
            <span className="text-xs" style={{ color: '#00d4ff' }}>Image loaded</span>
          </div>
        </motion.div>
      ) : (
        <motion.label key="upload"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl p-10 cursor-pointer transition-all duration-300"
          style={{
            border: `2px dashed ${dragging ? '#00d4ff' : 'rgba(0,212,255,0.2)'}`,
            background: dragging ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.02)',
            boxShadow: dragging ? '0 0 30px rgba(0,212,255,0.15)' : 'none',
          }}>
          <motion.div
            animate={{ scale: dragging ? 1.1 : 1 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
            {dragging ? <Upload className="w-7 h-7" style={{ color: '#00d4ff' }} />
              : <ImageIcon className="w-7 h-7 text-slate-500" />}
          </motion.div>
          <div className="text-center">
            <p className="font-medium text-slate-300 text-sm">{label}</p>
            <p className="text-xs text-slate-500 mt-1">Drag & drop or <span style={{ color: '#00d4ff' }}>browse files</span></p>
            <p className="text-xs text-slate-600 mt-1">PNG, JPG, JPEG — max 10MB</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </motion.label>
      )}
    </AnimatePresence>
  );
}
