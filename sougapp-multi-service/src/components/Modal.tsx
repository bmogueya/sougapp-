import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-text/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div className="relative bg-surface rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <button 
            onClick={onClose}
            className="text-faint hover:text-text hover:bg-surface-2 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
