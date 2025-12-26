import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, Package, Clock, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  addSessionProduct,
  getAllProducts,
  updateProduct,
  removeProduct,
  PRODUCTS_UPDATED_EVENT,
  type Product
} from '@/lib/productSessionStorage';

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

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'user' | 'manager' | 'admin';
}

const Admin: React.FC = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'Монтаж',
    description: '',
    image: '',
    brand: '',
    volume: '',
    inStock: true
  });

  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    brand: '',
    volume: '',
    inStock: true
  });

  useEffect(() => {
    if (isAdmin) {
      loadOrders();
      loadUsers();
      setProducts(getAllProducts());
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const onUpdate = () => setProducts(getAllProducts());
    window.addEventListener(PRODUCTS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(PRODUCTS_UPDATED_EVENT, onUpdate);
  }, [isAdmin]);

  const handleAddSessionProduct = () => {
    const name = productForm.name.trim();
    const description = productForm.description.trim();
    const category = productForm.category.trim();
    const priceNumber = Number(productForm.price);
    const image = productForm.image.trim();

    if (!name || !description || !category || !Number.isFinite(priceNumber) || priceNumber <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название, категорию, описание и корректную цену',
        variant: 'destructive'
      });
      return;
    }

    const created = addSessionProduct({
      name,
      description,
      category,
      price: priceNumber,
      image,
      inStock: productForm.inStock,
      brand: productForm.brand.trim() || undefined,
      volume: productForm.volume.trim() || undefined
    });

    setProducts(prev => [created, ...prev]);
    setProductForm({
      name: '',
      price: '',
      category: productForm.category,
      description: '',
      image: '',
      brand: '',
      volume: '',
      inStock: true
    });

    toast({
      title: 'Товар добавлен',
      description: 'Товар добавлен на текущую сессию и доступен в каталоге',
    });
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      price: String(p.price),
      category: p.category,
      description: p.description,
      image: p.image ?? '',
      brand: p.brand ?? '',
      volume: p.volume ?? '',
      inStock: p.inStock
    });
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    const name = editForm.name.trim();
    const description = editForm.description.trim();
    const category = editForm.category.trim();
    const priceNumber = Number(editForm.price);
    const image = editForm.image.trim();

    if (!name || !description || !category || !Number.isFinite(priceNumber) || priceNumber <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название, категорию, описание и корректную цену',
        variant: 'destructive'
      });
      return;
    }

    const updated = updateProduct(editingProduct.id, {
      name,
      description,
      category,
      price: priceNumber,
      image,
      inStock: editForm.inStock,
      brand: editForm.brand.trim() || undefined,
      volume: editForm.volume.trim() || undefined
    });

    if (!updated) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить товар',
        variant: 'destructive'
      });
      return;
    }

    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setEditingProduct(null);
    toast({
      title: 'Товар обновлён',
      description: updated.name
    });
  };

  const handleDeleteProduct = (productId: string) => {
    removeProduct(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: 'Товар удалён',
      description: 'Товар удалён из каталога',
    });
  };

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('progressgarant_orders') || '[]');
    setOrders(allOrders.sort((a: Order, b: Order) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('progressgarant_users') || '[]');
    setUsers(allUsers);
  };

  const updateUserRole = (userId: string, role: User['role']) => {
    const updatedUsers = users.map(u => (u.id === userId ? { ...u, role } : u));
    setUsers(updatedUsers);
    localStorage.setItem('progressgarant_users', JSON.stringify(updatedUsers));

    const savedUserRaw = localStorage.getItem('progressgarant_user');
    if (savedUserRaw) {
      try {
        const savedUser = JSON.parse(savedUserRaw);
        if (savedUser?.id === userId) {
          const updatedSavedUser = { ...savedUser, role };
          localStorage.setItem('progressgarant_user', JSON.stringify(updatedSavedUser));
        }
      } catch {
        // ignore
      }
    }

    toast({
      title: 'Роль обновлена',
      description: `Пользователь ${userId}: ${role}`
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Доступ запрещен</h1>
          <p className="text-muted-foreground">У вас нет прав администратора</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">Админ-панель</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="users">Пользователи ({users.length})</TabsTrigger>
            <TabsTrigger value="products">Товары</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Пользователи
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Зарегистрированных</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Заказы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">Всего заказов</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Выполнено
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(order => order.status === 'delivered').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Доставлено</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    В работе
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status)).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Активных</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              {users.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Пользователей пока нет</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {user.firstName || user.username}
                          {user.lastName && ` ${user.lastName}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Логин:</span> {user.username}</p>
                          <p><span className="font-medium">Email:</span> {user.email}</p>
                          {user.phone && <p><span className="font-medium">Телефон:</span> {user.phone}</p>}
                          <div className="flex items-center justify-between gap-3">
                            <Badge variant="outline">
                              {user.role === 'admin' ? 'Администратор' : user.role === 'manager' ? 'Менеджер' : 'Пользователь'}
                            </Badge>
                            <Select value={user.role} onValueChange={(value) => updateUserRole(user.id, value as User['role'])}>
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Пользователь</SelectItem>
                                <SelectItem value="manager">Менеджер</SelectItem>
                                <SelectItem value="admin">Администратор</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Добавить товар
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="p-name">Название</Label>
                    <Input
                      id="p-name"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Например: Автомат 10А"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="p-price">Цена (₽)</Label>
                      <Input
                        id="p-price"
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-category">Категория</Label>
                      <Input
                        id="p-category"
                        value={productForm.category}
                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Монтаж"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                    <div>
                      <div className="font-medium text-sm">В наличии</div>
                      <div className="text-xs text-muted-foreground">Показывать как доступный товар</div>
                    </div>
                    <Switch
                      checked={productForm.inStock}
                      onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, inStock: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="p-description">Описание</Label>
                    <Input
                      id="p-description"
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Короткое описание"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="p-image">Изображение (URL)</Label>
                    <Input
                      id="p-image"
                      value={productForm.image}
                      onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="p-brand">Бренд (опц.)</Label>
                      <Input
                        id="p-brand"
                        value={productForm.brand}
                        onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="IEK"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-volume">Характеристика (опц.)</Label>
                      <Input
                        id="p-volume"
                        value={productForm.volume}
                        onChange={(e) => setProductForm(prev => ({ ...prev, volume: e.target.value }))}
                        placeholder="10А"
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddSessionProduct} className="w-full">
                    Добавить товар
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Товары ({products.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="p-search">Поиск</Label>
                    <Input
                      id="p-search"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Поиск по названию/категории/бренду..."
                    />
                  </div>

                  {products.filter(p => {
                    const q = productSearch.trim().toLowerCase();
                    if (!q) return true;
                    const hay = `${p.name} ${p.category} ${p.brand ?? ''}`.toLowerCase();
                    return hay.includes(q);
                  }).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ничего не найдено</p>
                  ) : (
                    products
                      .filter(p => {
                        const q = productSearch.trim().toLowerCase();
                        if (!q) return true;
                        const hay = `${p.name} ${p.category} ${p.brand ?? ''}`.toLowerCase();
                        return hay.includes(q);
                      })
                      .map(p => (
                        <div key={p.id} className="rounded-md border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium truncate">{p.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {p.category} • {p.price.toLocaleString('ru-RU')} ₽
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {p.inStock ? 'В наличии' : 'Нет в наличии'}
                                {p.brand ? ` • ${p.brand}` : ''}
                                {p.volume ? ` • ${p.volume}` : ''}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStartEdit(p)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Редактирование товара</DialogTitle>
                                  </DialogHeader>

                                  <div className="space-y-3">
                                    <div className="space-y-2">
                                      <Label>Название</Label>
                                      <Input value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Цена (₽)</Label>
                                        <Input type="number" value={editForm.price} onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Категория</Label>
                                        <Input value={editForm.category} onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))} />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Описание</Label>
                                      <Input value={editForm.description} onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))} />
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Изображение (URL)</Label>
                                      <Input value={editForm.image} onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Бренд</Label>
                                        <Input value={editForm.brand} onChange={(e) => setEditForm(prev => ({ ...prev, brand: e.target.value }))} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Характеристика</Label>
                                        <Input value={editForm.volume} onChange={(e) => setEditForm(prev => ({ ...prev, volume: e.target.value }))} />
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                                      <div>
                                        <div className="font-medium text-sm">В наличии</div>
                                      </div>
                                      <Switch checked={editForm.inStock} onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, inStock: checked }))} />
                                    </div>
                                  </div>

                                  <DialogFooter>
                                    <Button type="button" onClick={handleSaveEdit}>
                                      Сохранить
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProduct(p.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Admin;