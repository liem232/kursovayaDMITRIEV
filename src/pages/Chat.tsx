import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getOrCreateChatForActor,
  getOrCreateGuestId,
  listMessages,
  sendMessage
} from '@/lib/chatStorage';

const Chat: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [chatId, setChatId] = useState<string | null>(null);
  const [messagesVersion, setMessagesVersion] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    const chat = isAuthenticated && user
      ? getOrCreateChatForActor({ role: 'user', userId: user.id })
      : getOrCreateChatForActor({ role: 'guest', guestId: getOrCreateGuestId() });

    setChatId(chat.id);
  }, [isAuthenticated, user]);

  useEffect(() => {
    const id = window.setInterval(() => setMessagesVersion(v => v + 1), 1500);
    return () => window.clearInterval(id);
  }, []);

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
      senderRole: isAuthenticated ? 'user' : 'guest',
      senderId: isAuthenticated ? user?.id : getOrCreateGuestId(),
      text: trimmed
    });

    setText('');
    setMessagesVersion(v => v + 1);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Чат с менеджером</h1>
            <p className="text-muted-foreground">
              {isAuthenticated ? 'Вы можете задать вопрос по заказу или товарам.' : 'Вы можете задать вопрос как гость.'}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Онлайн-консультация
          </Badge>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Диалог</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[420px] overflow-y-auto rounded-md border bg-card p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Напишите первое сообщение — менеджер увидит его в своей панели.
                </div>
              ) : (
                messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex ${m.senderRole === 'manager' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm border ${
                        m.senderRole === 'manager'
                          ? 'bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground border-primary'
                      }`}
                    >
                      <div className="opacity-90 text-xs mb-1">
                        {m.senderRole === 'manager' ? 'Менеджер' : isAuthenticated ? 'Вы' : 'Гость'} •{' '}
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
                <Send className="h-4 w-4 mr-2" />
                Отправить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
