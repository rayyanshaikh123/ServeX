import { AIChat } from '../../components/chat/AIChat';
import { Sparkles } from 'lucide-react';

export const ChatPage = () => {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-3">
      </div>

      <div className="w-full flex justify-center">
        <AIChat variant="page" />
      </div>

      <div className="flex items-center gap-6 opacity-30">
        <div className="h-[1px] w-12 bg-zinc-700" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">ServeX Intelligence Bureau</span>
        <div className="h-[1px] w-12 bg-zinc-700" />
      </div>
    </div>
  );
};
