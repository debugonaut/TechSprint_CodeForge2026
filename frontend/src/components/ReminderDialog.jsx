import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Clock, Calendar, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReminderDialog({ isOpen, onClose }) {
  const [frequency, setFrequency] = useState('none');

  useEffect(() => {
    const saved = localStorage.getItem('recallr_reminder');
    if (saved) setFrequency(saved);
  }, [isOpen]);

  const handleSave = (freq) => {
    setFrequency(freq);
    localStorage.setItem('recallr_reminder', freq);
    
    if (freq === 'none') {
        toast.success("Read reminders turned off");
    } else {
        toast.success(`Reminder set: ${freq} 🔔`);
    }
    
    setTimeout(onClose, 500);
  };

  if (!isOpen) return null;

  const options = [
    { id: 'daily', label: 'Daily', sub: 'Every 24 hours', icon: Clock },
    { id: '3days', label: 'Every 3 Days', sub: 'Buildup habits', icon: Calendar },
    { id: 'weekly', label: 'Weekly', sub: 'Weekend catchup', icon: Calendar },
    { id: 'none', label: 'None', sub: 'Turn off', icon: X },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-app border border-default rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 text-primary">
                    <Bell size={28} />
                </div>
                <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
                    <X size={20} />
                </button>
            </div>

            <h2 className="text-2xl font-bold text-secondary mb-2">Set Read Reminder</h2>
            <p className="text-muted text-sm mb-8">
                Build a learning habit. We'll gently nudge you to read your saved summaries.
            </p>

            <div className="space-y-3">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleSave(opt.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                            frequency === opt.id 
                            ? 'bg-primary/10 border-primary/50 text-secondary' 
                            : 'bg-surface border-default text-muted hover:border-primary/30 hover:bg-elevated'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <opt.icon size={20} className={frequency === opt.id ? 'text-primary' : 'text-muted'} />
                            <div className="text-left">
                                <div className={`font-medium ${frequency === opt.id ? 'text-secondary' : 'text-muted'}`}>
                                    {opt.label}
                                </div>
                                <div className="text-xs text-muted">{opt.sub}</div>
                            </div>
                        </div>
                        {frequency === opt.id && (
                            <motion.div layoutId="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Check size={18} className="text-primary" />
                            </motion.div>
                        )}
                    </button>
                ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
