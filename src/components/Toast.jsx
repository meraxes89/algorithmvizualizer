import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

let toastCount = 0;

export const toast = {
  success: (message) => dispatchToast(message, 'success'),
  error: (message) => dispatchToast(message, 'error'),
  info: (message) => dispatchToast(message, 'info'),
};

const dispatchToast = (message, type) => {
  const event = new CustomEvent('add-toast', { detail: { id: ++toastCount, message, type } });
  window.dispatchEvent(event);
};

const MAX_TOASTS = 5;

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timers = new Set();

    const handleAddToast = (event) => {
      const newToast = event.detail;
      setToasts(prev => {
        const next = [...prev, newToast];
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });

      const timerId = setTimeout(() => {
        timers.delete(timerId);
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
      timers.add(timerId);
    };

    window.addEventListener('add-toast', handleAddToast);
    return () => {
      window.removeEventListener('add-toast', handleAddToast);
      timers.forEach(clearTimeout);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            layout
            className={`pointer-events-auto flex items-center justify-between p-4 pr-12 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              t.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' :
              t.type === 'error' ? 'bg-rose-50/90 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200' :
              'bg-white/90 dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
              <span className="text-sm font-semibold">{t.message}</span>
            </div>
            <button 
              onClick={() => removeToast(t.id)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
