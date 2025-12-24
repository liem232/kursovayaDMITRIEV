import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Tag, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Gift,
  TrendingUp,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'action' | 'news' | 'announcement';
  date: string;
  author: string;
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'news' as const
  });

  const { isAdmin } = useAuth();
  const { toast } = useToast();

  // Загружаем новости при монтировании компонента
  useEffect(() => {
    const savedNews = localStorage.getItem('progressgarant_news');
    if (savedNews) {
      try {
        const parsed = JSON.parse(savedNews);
        const arr: any[] = Array.isArray(parsed) ? parsed : [];
        const looksOldTheme = arr.some((n) => {
          const hay = `${n?.title ?? ''} ${n?.excerpt ?? ''} ${n?.content ?? ''}`.toLowerCase();
          return hay.includes('табач') || hay.includes('кальян') || hay.includes('никотин') || hay.includes('progress');
        });

        if (!looksOldTheme) {
          setNews(arr as NewsItem[]);
          return;
        }
      } catch {
        // ignore and regenerate
      }
    }

    // Добавляем начальные новости (первый запуск или миграция старых данных)
    const initialNews: NewsItem[] = [
        {
          id: '1',
          title: 'Скидка 15% на кабель и провод!',
          excerpt: 'До конца месяца действует акция на популярные позиции кабельной продукции.',
          content: 'Дорогие клиенты! В ElectroCity стартовала акция: скидка 15% на кабель и провод (ВВГнг-LS, ПВС, NYM) и сопутствующие товары для монтажа. Отличная возможность подготовиться к ремонту или объекту. Акция действует при заказе от 10 000 рублей. Подробности уточняйте у менеджера в чате.',
          category: 'action',
          date: '2024-01-15',
          author: 'Администрация'
        },
        {
          id: '2',
          title: 'Поступление: автоматика и защита',
          excerpt: 'В наличии новые партии автоматов, УЗО и дифавтоматов.',
          content: 'Мы обновили склад: доступны автоматические выключатели, УЗО и дифавтоматы для квартир, домов и коммерческих объектов. Поможем подобрать номиналы и типы характеристик под вашу нагрузку. Все позиции — от проверенных производителей. Если сомневаетесь в выборе, напишите менеджеру в чат — подскажем.',
          category: 'news',
          date: '2024-01-10',
          author: 'Отдел закупок'
        },
        {
          id: '3',
          title: 'Изменения в графике работы в праздничные дни',
          excerpt: 'Информируем об изменениях в режиме работы офиса в праздничные дни.',
          content: 'Уважаемые клиенты! Сообщаем об изменениях в графике работы ElectroCity в связи с праздничными днями. 31 декабря и 1-8 января офис работать не будет. Прием и обработка заказов возобновится 9 января. Последний день приема заказов перед праздниками — 30 декабря до 16:00. Срочные вопросы можно решить по телефону +7 (3532) 123-456. Желаем всем приятных праздников!',
          category: 'announcement',
          date: '2023-12-25',
          author: 'Администрация'
        },
        {
          id: '4',
          title: 'Программа лояльности ElectroCity',
          excerpt: 'Новая система скидок и бонусов для постоянных клиентов.',
          content: 'Мы запускаем программу лояльности ElectroCity для постоянных клиентов. Система предусматривает накопительные скидки от 3% до 12% в зависимости от объема покупок за месяц. Дополнительно доступны специальные условия: приоритетная доставка, персональный менеджер, индивидуальные предложения на популярные категории (кабель, освещение, автоматика). Для участия напишите менеджеру в чат. Программа действует с 1 февраля 2024 года.',
          category: 'news',
          date: '2024-01-20',
          author: 'Отдел продаж'
        }
      ];
      setNews(initialNews);
      localStorage.setItem('progressgarant_news', JSON.stringify(initialNews));
  }, []);

  const saveNews = (newsData: NewsItem[]) => {
    setNews(newsData);
    localStorage.setItem('progressgarant_news', JSON.stringify(newsData));
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddNews = () => {
    if (!newNews.title || !newNews.content) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля",
        variant: "destructive"
      });
      return;
    }

    const newsItem: NewsItem = {
      id: Date.now().toString(),
      ...newNews,
      excerpt: newNews.excerpt || newNews.content.slice(0, 150) + '...',
      date: new Date().toISOString().split('T')[0],
      author: 'Администратор'
    };

    saveNews([newsItem, ...news]);
    setNewNews({ title: '', content: '', excerpt: '', category: 'news' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Новость добавлена",
      description: "Новость успешно опубликована",
    });
  };

  const handleDeleteNews = (id: string) => {
    saveNews(news.filter(item => item.id !== id));
    toast({
      title: "Новость удалена",
      description: "Новость успешно удалена",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'action':
        return <Gift className="h-4 w-4" />;
      case 'news':
        return <TrendingUp className="h-4 w-4" />;
      case 'announcement':
        return <Star className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'action':
        return 'Акция';
      case 'news':
        return 'Новость';
      case 'announcement':
        return 'Объявление';
      default:
        return 'Новость';
    }
  };

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'action':
        return 'default' as const;
      case 'news':
        return 'secondary' as const;
      case 'announcement':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Новости и акции
            </h1>
            <p className="text-lg text-muted-foreground">
              Актуальная информация о скидках, новинках и важных событиях
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить новость
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Добавить новость</DialogTitle>
                  <DialogDescription>
                    Создайте новую новость или объявление для клиентов
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Заголовок *</Label>
                    <Input
                      id="title"
                      value={newNews.title}
                      onChange={(e) => setNewNews(prev => ({...prev, title: e.target.value}))}
                      placeholder="Введите заголовок новости"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excerpt">Краткое описание</Label>
                    <Input
                      id="excerpt"
                      value={newNews.excerpt}
                      onChange={(e) => setNewNews(prev => ({...prev, excerpt: e.target.value}))}
                      placeholder="Краткое описание (необязательно)"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <select
                      id="category"
                      value={newNews.category}
                      onChange={(e) => setNewNews(prev => ({...prev, category: e.target.value as any}))}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value="news">Новость</option>
                      <option value="action">Акция</option>
                      <option value="announcement">Объявление</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Содержание *</Label>
                    <Textarea
                      id="content"
                      value={newNews.content}
                      onChange={(e) => setNewNews(prev => ({...prev, content: e.target.value}))}
                      placeholder="Полный текст новости"
                      rows={8}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleAddNews}>
                    Опубликовать
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Фильтры */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск новостей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Все
              </Button>
              <Button
                variant={selectedCategory === 'action' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('action')}
              >
                Акции
              </Button>
              <Button
                variant={selectedCategory === 'news' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('news')}
              >
                Новости
              </Button>
              <Button
                variant={selectedCategory === 'announcement' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('announcement')}
              >
                Объявления
              </Button>
            </div>
          </div>
        </div>

        {/* Список новостей */}
        <div className="space-y-6">
          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Новости не найдены
              </h3>
              <p className="text-muted-foreground">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          ) : (
            filteredNews.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getCategoryVariant(item.category)} className="flex items-center gap-1">
                          {getCategoryIcon(item.category)}
                          {getCategoryLabel(item.category)}
                        </Badge>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.date).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                      <CardDescription className="text-base">
                        {item.excerpt}
                      </CardDescription>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteNews(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none text-muted-foreground">
                    <p>{item.content}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                    Автор: {item.author}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default News;