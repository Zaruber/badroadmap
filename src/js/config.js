// Конфигурация Supabase
const SUPABASE_URL = 'https://rxnwmaaprogiexzktvoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bndtYWFwcm9naWV4emt0dm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NjcxMzgsImV4cCI6MjA1NzM0MzEzOH0.8AkTeyLi7eZPkGca8fkXtPd796byY-ydMpCtUos2qog';

// Инициализация клиента Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Конфигурация карты
const MAP_CONFIG = {
    center: [55.7558, 37.6173], // Москва
    zoom: 10,
    minZoom: 3,
    maxZoom: 18
};

// Названия таблиц в базе данных
const DB_TABLES = {
    REVIEWS: 'reviews',
    LIKES: 'likes'
};

// Константы для фильтрации
const FILTER_TYPES = {
    DATE: 'date',
    RATING: 'rating',
    EXPLICIT: 'explicit'
};

// Максимальные размеры для загружаемых файлов (в байтах)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Поддерживаемые форматы изображений
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

// Экспорт конфигурации
export {
    supabase,
    MAP_CONFIG,
    DB_TABLES,
    FILTER_TYPES,
    MAX_FILE_SIZE,
    SUPPORTED_IMAGE_TYPES
}; 