import React from 'react';
import { FiX, FiClock, FiMessageCircle } from 'react-icons/fi';

const MessageModal = ({ message, onClose, formatDate }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-lg max-h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        
        <div className="flex justify-between items-center p-6 pb-2 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FiMessageCircle size={20} />
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 py-2 scrollbar-hide">
          <div className="space-y-4">
            <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        </div>

        <div className="p-8 pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-400 shrink-0">
          <div className="flex items-center gap-2">
            <FiClock />
            <span>{formatDate(message.created_at)}</span>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default MessageModal;