# МатМап - Карта дорог с отзывами

Интерактивная карта для отметки проблемных участков дорог с возможностью оставлять отзывы и фотографии.

## Функциональность

- 🗺️ Интерактивная карта на базе OpenStreetMap
- 📝 Добавление отзывов с координатами
- 📸 Загрузка фотографий к отзывам
- 👍 Система лайков для отзывов
- 🔍 Фильтрация отзывов по дате/рейтингу/матерности
- 📱 Адаптивный дизайн для мобильных устройств

## Технологии

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Карта: Leaflet.js + OpenStreetMap
- База данных: Supabase
- Хостинг: GitHub Pages

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/matmap.git
cd matmap
```

2. Откройте `index.html` в браузере или запустите локальный сервер:
```bash
python -m http.server 8000
# или
npx serve
```

3. Откройте http://localhost:8000 в браузере

## Структура проекта

```
matmap/
├── index.html          # Главная страница
├── public/            # Статические файлы
├── src/
│   ├── styles/       # CSS стили
│   │   └── main.css
│   └── js/          # JavaScript файлы
│       ├── config.js   # Конфигурация
│       ├── map.js      # Работа с картой
│       ├── reviews.js  # Управление отзывами
│       └── main.js     # Основной файл
└── README.md
```

## Конфигурация Supabase

1. Создайте проект в [Supabase](https://supabase.io)
2. Создайте таблицы `reviews` и `likes`
3. Обновите конфигурацию в `src/js/config.js`

## Разработка

- Используйте семантическую верстку HTML5
- Следуйте методологии БЭМ для CSS классов
- Придерживайтесь ES6+ стандартов JavaScript
- Тестируйте на различных устройствах и браузерах

## Лицензия

MIT License 