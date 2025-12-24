import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, User } from 'lucide-react';

const Contacts: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Контакты
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Адрес</p>
                  <p className="text-muted-foreground">г. Оренбург, ул. Промышленная, 25</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Телефон</p>
                  <p className="text-muted-foreground">+7 (3532) 123-456</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">info@electrocity.ru</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Режим работы</p>
                  <p className="text-muted-foreground">Пн-Пт: 9:00-18:00</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Руководитель</p>
                  <p className="text-muted-foreground">Дмитриев Александр Геннадиевич</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Реквизиты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>ООО "ElectroCity"</strong></p>
              <p>ИНН: 5614123456</p>
              <p>КПП: 561401001</p>
              <p>ОГРН: 1125614004789</p>
              <p className="pt-2">
                <strong>Юридический адрес:</strong><br />
                460000, г. Оренбург, ул. Промышленная, д. 25
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contacts;