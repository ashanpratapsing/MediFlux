import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0  bg-background" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-sm bg-[#141416] border border-white/10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col animate-scale-in">
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-8 py-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
          {children}
        </div>
        
        {footer && (
          <div className="px-8 py-5 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>

    </div>
  );
};
