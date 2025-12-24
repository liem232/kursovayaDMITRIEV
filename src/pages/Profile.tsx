import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { User, Package, Clock, CheckCircle2, XCircle, Truck, PackageSearch, Check } from 'lucide-react';

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

const statusColors = {
  pending: 'default',
  processing: 'secondary',
  shipped: 'outline',
  delivered: 'default',
  cancelled: 'destructive',
  collected: 'secondary',
  ready: 'default'
} as const;

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      const allOrders = JSON.parse(localStorage.getItem('progressgarant_orders') || '[]');
      // Фильтруем заказы для текущего пользователя по email
      const userOrders = allOrders.filter((order: Order) => 
        order.orderData.email === user.email
      );
      setOrders(userOrders.sort((a: Order, b: Order) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">Личный кабинет</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="orders">Мои заказы ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Профиль
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">Логин</p>
                    <p className="text-muted-foreground">{user.username}</p>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  {user.firstName && (
                    <div>
                      <p className="font-medium">Имя</p>
                      <p className="text-muted-foreground">{user.firstName} {user.lastName}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Роль</p>
                    <p className="text-muted-foreground">{user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                  </div>
                  <Button variant="outline" onClick={logout}>
                    Выйти из аккаунта
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Статистика заказов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Всего заказов:</span>
                      <span className="font-medium">{orders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Выполнено:</span>
                      <span className="font-medium text-green-600">
                        {orders.filter(order => order.status === 'delivered').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>В обработке:</span>
                      <span className="font-medium text-blue-600">
                        {orders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status)).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="space-y-6">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">У вас пока нет заказов</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  return (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Заказ №{order.id}
                          </CardTitle>
                          <Badge variant={statusColors[order.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Товары */}
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

                          {/* Доставка */}
                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-sm">
                              <span>Способ доставки:</span>
                              <span>{order.orderData.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз'}</span>
                            </div>
                            {order.orderData.address && (
                              <div className="flex justify-between text-sm">
                                <span>Адрес:</span>
                                <span className="text-right max-w-xs">{order.orderData.address}</span>
                              </div>
                            )}
                          </div>

                          {/* Итого */}
                          <div className="pt-2 border-t">
                            <div className="flex justify-between font-medium">
                              <span>Итого ({order.totalItems} шт.):</span>
                              <span className="text-primary">{order.totalPrice.toLocaleString('ru-RU')} ₽</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;