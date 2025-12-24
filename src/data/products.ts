
export const logoPath = '/img/logo (11).png';
import { productImages } from './imageImports';

export const mockProducts = [
  {
    id: '1',
    name: 'Кабель ВВГнг-LS 3×2.5 (10 м)',
    price: 1850,
    image: productImages['Кабель ВВГнг-LS 3×2.5 (10 м)'],
    category: 'Кабель и провод',
    description: 'Медный силовой кабель для внутренней проводки',
    inStock: true,
    brand: 'Камкабель',
    volume: '10 м'
  },
  {
    id: '2',
    name: 'Провод ПВС 2×1.5 (20 м)',
    price: 1250,
    image: productImages['Провод ПВС 2×1.5 (20 м)'],
    category: 'Кабель и провод',
    description: 'Гибкий провод для удлинителей и бытовых подключений',
    inStock: true,
    brand: 'РЭК-PRYSMIAN',
    volume: '20 м'
  },

  {
    id: '3',
    name: 'Автоматический выключатель 16А (1P, C)',
    price: 420,
    image: productImages['Автоматический выключатель 16А (1P, C)'],
    category: 'Автоматика',
    description: 'Защита линии от перегрузки и короткого замыкания',
    inStock: true,
    brand: 'IEK',
    volume: '16А'
  },
  {
    id: '4',
    name: 'УЗО 40А / 30мА (2P)',
    price: 1890,
    image: productImages['УЗО 40А / 30мА (2P)'],
    category: 'Автоматика',
    description: 'Защита от утечек тока, повышает электробезопасность',
    inStock: true,
    brand: 'Schneider Electric',
    volume: '40А'
  },

  {
    id: '5',
    name: 'Розетка двойная с заземлением',
    price: 360,
    image: productImages['Розетка двойная с заземлением'],
    category: 'Розетки и выключатели',
    description: 'Надежная двойная розетка для бытовых нагрузок',
    inStock: true,
    brand: 'Legrand',
    volume: '2 поста'
  },
  {
    id: '6',
    name: 'Выключатель одноклавишный',
    price: 210,
    image: productImages['Выключатель одноклавишный'],
    category: 'Розетки и выключатели',
    description: 'Классический выключатель для освещения',
    inStock: true,
    brand: 'IEK',
    volume: '1 клавиша'
  },

  {
    id: '7',
    name: 'Лампа LED A60 10W E27 (тёплый свет)',
    price: 140,
    image: productImages['Лампа LED A60 10W E27 (тёплый свет)'],
    category: 'Освещение',
    description: 'Энергоэффективная светодиодная лампа для дома',
    inStock: true,
    brand: 'Gauss',
    volume: '10W'
  },
  {
    id: '8',
    name: 'Светодиодный прожектор 30W IP65',
    price: 990,
    image: productImages['Светодиодный прожектор 30W IP65'],
    category: 'Освещение',
    description: 'Прожектор для улицы и подсветки территории',
    inStock: true,
    brand: 'Navigator',
    volume: '30W'
  },

  {
    id: '9',
    name: 'Удлинитель 5 розеток (3 м) с выключателем',
    price: 780,
    image: productImages['Удлинитель 5 розеток (3 м) с выключателем'],
    category: 'Удлинители',
    description: 'Удобный удлинитель для дома и офиса',
    inStock: true,
    brand: 'SVEN',
    volume: '3 м'
  },
  {
    id: '10',
    name: 'Вилка с заземлением (белая)',
    price: 110,
    image: productImages['Вилка с заземлением (белая)'],
    category: 'Монтаж',
    description: 'Вилка для сборки удлинителей и подключений',
    inStock: true,
    brand: 'EKF'
  },

  {
    id: '11',
    name: 'Клеммы WAGO 221 (набор)',
    price: 450,
    image: productImages['Клеммы WAGO 221 (набор)'],
    category: 'Монтаж',
    description: 'Быстрое и надежное соединение проводов',
    inStock: true,
    brand: 'WAGO'
  },
  {
    id: '12',
    name: 'Коробка распределительная (IP54)',
    price: 160,
    image: productImages['Коробка распределительная (IP54)'],
    category: 'Монтаж',
    description: 'Распределительная коробка для соединений и защиты',
    inStock: true,
    brand: 'IEK'
  }
];

export const categories = [
  'Все товары',
  'Кабель и провод',
  'Автоматика',
  'Розетки и выключатели',
  'Освещение',
  'Удлинители',
  'Монтаж'
];

export const brands = [
  'Все бренды',
  'Schneider Electric',
  'IEK',
  'EKF',
  'Legrand',
  'WAGO',
  'Gauss',
  'Navigator',
  'SVEN',
  'Камкабель',
  'РЭК-PRYSMIAN'
];