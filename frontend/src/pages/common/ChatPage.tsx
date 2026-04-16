import { AIChat } from '../../components/chat/AIChat';

export const ChatPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">AI Assistant</h1>
        <h2 className="text-2xl font-serif italic text-foreground tracking-tight">ServeX Chat</h2>
      </div>
      <AIChat variant="page" />
    </div>
  );
};
