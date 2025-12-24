import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getOrCreateChatForActor,
  getOrCreateGuestId,
  listMessages,
  sendMessage
} from '@/lib/chatStorage';

const ChatWidget: React.FC = () => {
  const { user, isAuthenticated, isManager, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messagesVersion, setMessagesVersion] = useState(0);
  const [text, setText] = useState('');

  const senderLabel = (senderRole: string, senderId?: string) => {
    if (senderRole === 'manager') return 'Менеджер';
    if (senderRole === 'admin') return 'Администратор';
    if (senderRole === 'guest') return 'Гость';

    // user
    if (senderId && user?.id === senderId) {
      const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
      return fullName ? `${fullName} (Клиент)` : `${user?.username ?? 'Клиент'} (Клиент)`;
    }
    return 'Клиент';
  };

  useEffect(() => {
    if (isManager) return;

    const chat = isAuthenticated && user
      ? getOrCreateChatForActor({ role: 'user', userId: user.id })
      : getOrCreateChatForActor({ role: 'guest', guestId: getOrCreateGuestId() });

    setChatId(chat.id);
  }, [isAuthenticated, isManager, user]);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => setMessagesVersion(v => v + 1), 1500);
    return () => window.clearInterval(id);
  }, [isOpen]);

  const messages = useMemo(() => {
    if (!chatId) return [];
    void messagesVersion;
    return listMessages(chatId);
  }, [chatId, messagesVersion]);

  const handleSend = () => {
    if (!chatId) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    sendMessage({
      chatId,
      senderRole: isAuthenticated ? (isAdmin ? 'admin' : 'user') : 'guest',
      senderId: isAuthenticated ? user?.id : getOrCreateGuestId(),
      text: trimmed
    });

    setText('');
    setMessagesVersion(v => v + 1);
  };

  if (isManager) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {isOpen ? (
        <Card className="w-[340px] shadow-lg">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Чат с менеджером</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Онлайн
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-[260px] overflow-y-auto rounded-md border bg-card p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Напишите сообщение — менеджер ответит в ближайшее время.
                </div>
              ) : (
                messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex ${m.senderRole === 'manager' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm border ${
                        m.senderRole === 'manager'
                          ? 'bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground border-primary'
                      }`}
                    >
                      <div className="opacity-90 text-xs mb-1">
                        {senderLabel(m.senderRole, m.senderId)} •{' '}
                        {new Date(m.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="whitespace-pre-wrap break-words">{m.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Введите сообщение..."
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          className="rounded-full shadow-lg"
          size="icon"
          onClick={() => setIsOpen(true)}
          aria-label="Открыть чат"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default ChatWidget;
