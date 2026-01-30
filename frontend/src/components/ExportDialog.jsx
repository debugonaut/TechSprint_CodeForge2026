import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileJson, FileText, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.DEV ? 'http://localhost:5001' : '';

export default function ExportDialog({ isOpen, onClose, user }) {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState('json');

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/export/${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extension = format === 'markdown' ? 'md' : format;
      a.download = `recallbin-export-${Date.now()}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported as ${format.toUpperCase()}!`);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface border border-white/10 rounded-2xl max-w-md w-full p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Export Your Data</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            Download all your saved content in your preferred format.
          </p>

          {/* Format Options */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setFormat('json')}
              className={`w-full p-4 rounded-xl border transition-all text-left ${
                format === 'json'
                  ? 'border-primary bg-primary/10'
                  : 'border-white/5 bg-black/20 hover:bg-black/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileJson size={24} className={format === 'json' ? 'text-primary' : 'text-gray-400'} />
                <div>
                  <div className="font-semibold">JSON</div>
                  <div className="text-xs text-gray-400">Complete data with all metadata</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormat('csv')}
              className={`w-full p-4 rounded-xl border transition-all text-left ${
                format === 'csv'
                  ? 'border-primary bg-primary/10'
                  : 'border-white/5 bg-black/20 hover:bg-black/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={24} className={format === 'csv' ? 'text-primary' : 'text-gray-400'} />
                <div>
                  <div className="font-semibold">CSV</div>
                  <div className="text-xs text-gray-400">Spreadsheet compatible</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormat('markdown')}
              className={`w-full p-4 rounded-xl border transition-all text-left ${
                format === 'markdown'
                  ? 'border-primary bg-primary/10'
                  : 'border-white/5 bg-black/20 hover:bg-black/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCode size={24} className={format === 'markdown' ? 'text-primary' : 'text-gray-400'} />
                <div>
                  <div className="font-semibold">Markdown</div>
                  <div className="text-xs text-gray-400">Human-readable document</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormat('pdf')}
              className={`w-full p-4 rounded-xl border transition-all text-left ${
                format === 'pdf'
                  ? 'border-primary bg-primary/10'
                  : 'border-white/5 bg-black/20 hover:bg-black/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={24} className={format === 'pdf' ? 'text-primary' : 'text-gray-400'} />
                <div>
                  <div className="font-semibold">PDF</div>
                  <div className="text-xs text-gray-400">Printable document</div>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full bg-white text-black font-semibold rounded-xl px-6 py-3 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            {exporting ? 'Exporting...' : 'Download Export'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
