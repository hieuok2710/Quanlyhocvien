
import React, { useState } from 'react';
import { X, MessageSquare, Bug, Lightbulb, Send, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

type FeedbackType = 'BUG' | 'SUGGESTION';

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, userEmail }) => {
  const [type, setType] = useState<FeedbackType>('SUGGESTION');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);

    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      
      // Auto close after showing success message
      setTimeout(() => {
        setIsSent(false);
        setMessage('');
        setType('SUGGESTION'); // Reset type
        onClose();
      }, 2500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 w-full max-w-md rounded-2xl border border-dark-600 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700 flex justify-between items-center bg-gradient-to-r from-dark-900 to-dark-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg transition-colors ${type === 'BUG' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {type === 'BUG' ? <Bug className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-bold text-white">Gửi phản hồi</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="p-8 flex flex-col items-center justify-center text-center animate-fade-in h-64">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-slide-up">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Đã gửi thành công!</h4>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Cảm ơn bạn đã đóng góp ý kiến. Hệ thống sẽ ghi nhận và phản hồi sớm nhất.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            
            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('SUGGESTION')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  type === 'SUGGESTION' 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10' 
                    : 'bg-dark-900 border-dark-600 text-slate-500 hover:bg-dark-700 hover:border-dark-500'
                }`}
              >
                <Lightbulb className={`w-6 h-6 ${type === 'SUGGESTION' ? 'fill-amber-500/20' : ''}`} />
                <span className="text-xs font-bold uppercase tracking-wider">Góp ý / Tính năng</span>
              </button>
              
              <button
                type="button"
                onClick={() => setType('BUG')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  type === 'BUG' 
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/10' 
                    : 'bg-dark-900 border-dark-600 text-slate-500 hover:bg-dark-700 hover:border-dark-500'
                }`}
              >
                <Bug className={`w-6 h-6 ${type === 'BUG' ? 'fill-rose-500/20' : ''}`} />
                <span className="text-xs font-bold uppercase tracking-wider">Báo lỗi</span>
              </button>
            </div>

            {/* Content Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Nội dung chi tiết <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={type === 'BUG' ? "Mô tả lỗi bạn gặp phải, các bước tái hiện và mong muốn khắc phục..." : "Bạn muốn hệ thống có thêm tính năng gì? Hãy mô tả chi tiết ý tưởng của bạn..."}
                className="w-full h-32 bg-dark-950 border border-dark-600 text-slate-200 p-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-600 resize-none text-sm leading-relaxed"
              />
            </div>

            {/* User Info & Footer */}
            <div className="mt-auto pt-2">
              <div className="bg-dark-900/50 p-3 rounded-lg border border-dark-700 flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                    {userEmail.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gửi từ tài khoản</p>
                    <p className="text-sm text-slate-300 truncate">{userEmail}</p>
                 </div>
              </div>

              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-500 hover:to-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                {isSending ? 'Đang gửi phản hồi...' : 'Gửi ngay'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
