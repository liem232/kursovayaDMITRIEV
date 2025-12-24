import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle2, MessageCircle, Package, RefreshCw, Send, Truck, XCircle, Eye, PackageSearch, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { listChats, listMessages, sendMessage, type Chat } from '@/lib/chatStorage';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  orderData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address?: string;
    deliveryMethod: string;
    paymentMethod: string;
    comment?: string;
  };
  totalPrice: number;
  totalItems: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'collected' | 'ready';
}

const statusLabels = {
  pending: 'Ожидает обработки',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
  collected: 'Собран',
  ready: 'Готов к выдаче'
};

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  collected: PackageSearch,
  ready: Check
};

const Manager: React.FC = () => {
  const { user, isManager } = useAuth();
  const { toast } = useToast();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [text, setText] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('progressgarant_orders') || '[]');
    setOrders(allOrders.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'collected' | 'ready'
  ) => {
    const updatedOrders = orders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order));
    setOrders(updatedOrders);
    localStorage.setItem('progressgarant_orders', JSON.stringify(updatedOrders));

    toast({
      title: 'Статус обновлен',
      description: `Заказ №${orderId} - ${statusLabels[newStatus]}`,
    });
  };

  useEffect(() => {
    const id = window.setInterval(() => setVersion(v => v + 1), 1500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isManager) return;
    loadOrders();
  }, [isManager]);

  const chats = useMemo(() => {
    void version;
    return listChats();
  }, [version]);

  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  const selectedChat: Chat | undefined = useMemo(() => {
    if (!selectedChatId) return undefined;
    return chats.find(c => c.id === selectedChatId);
  }, [chats, selectedChatId]);

  const messages = useMemo(() => {
    if (!selectedChatId) return [];
    void version;
    return listMessages(selectedChatId);
  }, [selectedChatId, version]);

  const senderLabel = (senderRole: string) => {
    if (senderRole === 'manager') return 'Вы (Менеджер)';
    if (senderRole === 'admin') return 'Администратор';
    if (senderRole === 'guest') return 'Гость';
    return 'Клиент';
  };

  const handleSend = () => {
    if (!selectedChatId) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    if (selectedChat?.userId && user?.id && selectedChat.userId === user.id) {
      toast({
        title: 'Нельзя отправить сообщение',
        description: 'Вы не можете писать сами себе.',
        variant: 'destructive'
      });
      return;
    }

    sendMessage({
      chatId: selectedChatId,
      senderRole: 'manager',
      senderId: user?.id,
      text: trimmed
    });

    setText('');
    setVersion(v => v + 1);
  };

  if (!isManager) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Доступ запрещен</h1>
          <p className="text-muted-foreground">У вас нет прав менеджера</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Панель менеджера</h1>
            <p className="text-muted-foreground">Чаты с клиентами и консультации</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setVersion(v => v + 1);
              loadOrders();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Заказы ({orders.length})</TabsTrigger>
            <TabsTrigger value="chats">Чаты ({chats.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button variant="outline" onClick={loadOrders}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Обновить заказы
                </Button>
              </div>

              {orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Заказов пока нет</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  const isExpanded = expandedOrder === order.id;

                  return (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              Заказ №{order.id}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {order.orderData.firstName} {order.orderData.lastName} • {order.orderData.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                updateOrderStatus(order.id, value as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')
                              }
                            >
                              <SelectTrigger className="w-44">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Ожидает обработки</SelectItem>
                                <SelectItem value="processing">В обработке</SelectItem>
                                <SelectItem value="shipped">Отправлен</SelectItem>
                                <SelectItem value="delivered">Доставлен</SelectItem>
                                <SelectItem value="cancelled">Отменен</SelectItem>
                                <SelectItem value="collected">Собран</SelectItem>
                                <SelectItem value="ready">Готов к выдаче</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Товары:</h4>
                              <div className="space-y-2">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                              <div>
                                <h4 className="font-medium mb-2">Контакты:</h4>
                                <div className="space-y-1 text-sm">
                                  <p>Телефон: {order.orderData.phone}</p>
                                  <p>Email: {order.orderData.email}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Доставка:</h4>
                                <div className="space-y-1 text-sm">
                                  <p>{order.orderData.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз'}</p>
                                  {order.orderData.address && <p>{order.orderData.address}</p>}
                                  <p>Оплата: {order.orderData.paymentMethod === 'cash' ? 'Наличными' :
                                    order.orderData.paymentMethod === 'card' ? 'Картой' : 'Безналичный расчет'}</p>
                                </div>
                              </div>
                            </div>

                            {order.orderData.comment && (
                              <div className="pt-2 border-t">
                                <h4 className="font-medium mb-2">Комментарий:</h4>
                                <p className="text-sm text-muted-foreground">{order.orderData.comment}</p>
                              </div>
                            )}

                            <div className="pt-2 border-t">
                              <div className="flex justify-between font-medium">
                                <span>Итого ({order.totalItems} шт.):</span>
                                <span className="text-primary">{order.totalPrice.toLocaleString('ru-RU')} ₽</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="chats" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Диалоги
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {chats.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Пока нет обращений</p>
                  ) : (
                    chats.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedChatId(c.id)}
                        className={`w-full text-left rounded-md border p-3 hover:bg-accent transition-colors ${
                          selectedChatId === c.id ? 'bg-accent' : 'bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm">Чат #{c.id.slice(-6)}</div>
                          <Badge variant={c.status === 'open' ? 'default' : 'secondary'}>
                            {c.status === 'open' ? 'Открыт' : 'Закрыт'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {c.userId ? `Пользователь: ${c.userId}` : `Гость: ${c.guestId}`}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Активность: {new Date(c.lastMessageAt).toLocaleString('ru-RU')}
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {selectedChat ? `Сообщения (чат #${selectedChat.id.slice(-6)})` : 'Сообщения'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-[420px] overflow-y-auto rounded-md border bg-card p-4 space-y-3">
                    {!selectedChatId ? (
                      <p className="text-sm text-muted-foreground">Выберите чат слева</p>
                    ) : messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Сообщений пока нет</p>
                    ) : (
                      messages.map(m => (
                        <div
                          key={m.id}
                          className={`flex ${m.senderRole === 'manager' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm border ${
                              m.senderRole === 'manager'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <div className="opacity-90 text-xs mb-1">
                              {senderLabel(m.senderRole)} •{' '}
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
                      placeholder="Введите ответ..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                      disabled={!selectedChatId}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <Button onClick={handleSend} disabled={!selectedChatId}>
                      <Send className="h-4 w-4 mr-2" />
                      Ответить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Manager;
