ТЗ на проект «Карта дорог с матерными отзывами»
1. Функционал
1.1 Основные возможности:
✅ Интерактивная карта (Leaflet.js).
✅ Добавление отметки с отзывом (координаты, текст, фото).
✅ Просмотр всех отзывов.
✅ Лайки на отзывы (типа «поддерживаю»).
✅ Фильтр по дате/рейтингу/матерности.

1.2 Админ-функции:
✅ Возможность удалять жёсткий контент.
✅ Топ-10 худших дорог по лайкам.


1.3 Монетизация (на будущее, пока не делаем, но закладываем)
💰 Баннерная реклама автосервисов (реализовать как заглушку – «Тут могла быть ваша реклама шиномонтажки»).
💰 Платная подписка (отключение рекламы, фильтр без мата).


2. Технологии
Фронтенд: HTML, CSS, JavaScript
Карта: Leaflet.js + OpenStreetMap
База данных: superbase
Деплой: GitHub Pages (фронт), Firebase (база)
3. Структура проекта
📂 /public – статические файлы (иконки, стили)
📂 /src – код
📄 index.html – карта + форма добавления метки
📄 style.css – стили
📄 script.js – логика карты + Firebase

4. MVP (чтобы быстро запустить)
✅ Отображение карты (Leaflet.js).
✅ Возможность ставить метки (координаты + текст).
✅ Сохранение данных в Superbase.
✅ Заглушка рекламы («Тут могла быть ваша реклама шиномонтажки»).
✅ Фильтр по дате/рейтингу/матерности.
✅ Лайки на отзывы (типа «поддерживаю»).
✅ Админ-функции: удаление жёсткого контента, топ-10 худших дорог по лайкам.

5. Супербаза 
Project API
Your API is secured behind an API gateway which requires an API Key for every request.
You can use the parameters below to use Supabase client libraries.

Project URL
https://rxnwmaaprogiexzktvoa.supabase.co

Copy
A RESTful endpoint for querying and managing your database.
API Key

anon
public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bndtYWFwcm9naWV4emt0dm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NjcxMzgsImV4cCI6MjA1NzM0MzEzOH0.8AkTeyLi7eZPkGca8fkXtPd796byY-ydMpCtUos2qog

Copy
This key is safe to use in a browser if you have enabled Row Level Security (RLS) for your tables and configured policies. You may also use the service key which can be found here to bypass RLS.

Javascript
Dart
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rxnwmaaprogiexzktvoa.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)