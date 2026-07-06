import React from 'react';
import { motion } from 'motion/react';
import { Info, X, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmDeleteModalProps {
  title: string;
  subtitle: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
  accent?: 'purple' | 'teal' | 'rose';
  children: React.ReactNode;
}

export default function ConfirmDeleteModal({
  title,
  subtitle,
  onClose,
  onConfirm,
  isDeleting = false,
  accent = 'rose',
  children,
}: ConfirmDeleteModalProps) {
  const accentStyles = {
    purple: 'border-purple-100 bg-purple-50',
    teal: 'border-[#C5E1E3] bg-[#E2F2F3]',
    rose: 'border-rose-100 bg-rose-50',
  };

  return (
    <div className="app-modal-overlay fixed inset-0 z-[200] flex h-full w-full items-center justify-center overflow-y-auto bg-gray-900/10 p-4 backdrop-blur-xl animate-in fade-in duration-300 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="app-modal-panel relative z-30 w-full max-w-2xl overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-2xl"
      >
        <div
          className={cn(
            'flex items-center justify-between px-8 py-6 text-gray-900 border-b',
            accentStyles[accent]
          )}
        >
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black italic tracking-tight">
              <Info className="h-6 w-6 text-rose-500" />
              {title}
            </h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2.5 transition-colors hover:bg-white/70"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6 p-8 md:p-10">
          <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-700">
            {children}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-2xl bg-gray-100 px-6 py-3 text-sm font-black text-gray-600 transition-all hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              onClick={() => void onConfirm()}
              disabled={isDeleting}
              className={cn(
                'inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-6 py-3 text-sm font-black text-white transition-all',
                isDeleting ? 'cursor-not-allowed opacity-70' : 'hover:bg-rose-600'
              )}
            >
              {isDeleting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Xác nhận xóa
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
