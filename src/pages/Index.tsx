import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Star,
  CheckCircle,
  Truck,
  Shield,
  Clock,
  Users,
  Package,
  Zap
} from 'lucide-react';
import { Plug, Lightbulb, Cable } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getAllProducts, PRODUCTS_UPDATED_EVENT } from '@/lib/productSessionStorage';
import { useToast } from '@/hooks/use-toast';
import ParticleBackground from '@/components/ParticleBackground';

const Index = () => {
  const [productsVersion, setProductsVersion] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const onUpdate = () => setProductsVersion(v => v + 1);
    window.addEventListener(PRODUCTS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(PRODUCTS_UPDATED_EVENT, onUpdate);
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast({
      title: "Товар добавлен в корзину",
      description: `${product.name} успешно добавлен в корзину`,
    });
  };

  const popularProducts = useMemo(() => {
    void productsVersion;
    return getAllProducts().slice(0, 4);
  }, [productsVersion]);

  const categories = [
    {
      title: 'Кабель и провод',
      description: 'ВВГнг, ПВС, NYM и аксессуары для монтажа',
      icon: <Cable className="h-12 w-12 text-primary" />,
      count: '100+ позиций'
    },
    {
      title: 'Розетки и выключатели',
      description: 'Современные серии для дома и офиса',
      icon: <Plug className="h-12 w-12 text-primary" />,
      count: '200+ товаров'
    },
    {
      title: 'Освещение',
      description: 'Лампы, светильники, прожекторы и ленты',
      icon: <Lightbulb className="h-12 w-12 text-primary" />,
      count: '150+ товаров'
    },
    {
      title: 'Автоматика и защита',
      description: 'Автоматы, УЗО, дифавтоматы, реле',
      icon: <Zap className="h-12 w-12 text-primary" />,
      count: '80+ позиций'
    }
  ];

  const advantages = [
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Гарантия качества',
      description: 'Только оригинальные товары от проверенных производителей'
    },
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: 'Быстрая доставка',
      description: 'Доставка по Оренбургу в день заказа'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Официальный дистрибьютор',
      description: 'Прямые поставки от производителей'
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Опытная команда',
      description: 'Опыт в подборе и поставках электротоваров для разных задач'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero секция */}
      <section className="relative bg-gradient-to-br from-card to-accent py-20 overflow-hidden">
        <ParticleBackground className="absolute inset-0 z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Добро пожаловать в <span className="text-primary">ElectroCity</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Онлайн-магазин электротоваров для дома и бизнеса.
              Всё для монтажа, освещения и электробезопасности.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary-glow">
                <Link to="/catalog">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Перейти в каталог
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/partners">
                  Стать партнером
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Категории товаров */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Категории товаров
            </h2>
            <p className="text-lg text-muted-foreground">
              Широкий ассортимент качественной продукции
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{category.description}</p>
                  <Badge variant="secondary">{category.count}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Почему выбирают нас
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                  {advantage.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {advantage.title}
                </h3>
                <p className="text-muted-foreground">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Популярные товары */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Популярные товары
            </h2>
            <p className="text-lg text-muted-foreground">
              Самые востребованные позиции нашего каталога
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {popularProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full rounded-lg"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-primary">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <Badge variant={product.inStock ? "default" : "secondary"}>
                      {product.inStock ? "В наличии" : "Нет в наличии"}
                    </Badge>
                  </div>
                  {product.brand && (
                    <p className="text-sm text-muted-foreground">
                      Бренд: {product.brand}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    В корзину
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/catalog">
                Смотреть весь каталог
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* О компании */}
      <section className="py-16 bg-gradient-to-br from-accent to-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                О компании ElectroCity
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-6">
                  Надежный партнер в сфере электротоваров
                </h3>
                <p className="text-muted-foreground mb-6">
                  Компания "ElectroCity" помогает клиентам подобрать электротовары для ремонта и строительства.
                  Мы делаем ставку на качество, безопасность и понятный сервис.
                </p>
                <p className="text-muted-foreground mb-6">
                  В ассортименте: кабель, автоматы, УЗО, розетки, светильники и комплектующие.
                  Мы работаем с проверенными брендами и предлагаем актуальные решения под разные бюджеты.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">500+</div>
                    <div className="text-sm text-muted-foreground">Довольных клиентов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">50+</div>
                    <div className="text-sm text-muted-foreground">Брендов в каталоге</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-primary" />
                      Наша миссия
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Обеспечить клиентов Оренбурга и области качественными электротоварами
                      по конкурентным ценам с высоким уровнем сервиса.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="mr-2 h-5 w-5 text-primary" />
                      Наши ценности
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Честность, надежность, качество продукции и индивидуальный подход 
                      к каждому клиенту - основа наших деловых отношений.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
