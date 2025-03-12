import { MAP_CONFIG } from './config.js';

class MapManager {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.currentPosition = null;
    }

    // Инициализация карты
    init() {
        this.map = L.map('map', {
            center: MAP_CONFIG.center,
            zoom: MAP_CONFIG.zoom,
            minZoom: MAP_CONFIG.minZoom,
            maxZoom: MAP_CONFIG.maxZoom
        });

        // Добавляем слой OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Добавляем обработчики событий
        this.addEventListeners();
        
        // Запрашиваем геолокацию пользователя
        this.getUserLocation();

        return this.map;
    }

    // Добавление обработчиков событий
    addEventListeners() {
        // Клик по карте для добавления метки
        this.map.on('click', (e) => {
            const event = new CustomEvent('map:clicked', {
                detail: {
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                }
            });
            document.dispatchEvent(event);
        });
    }

    // Получение текущей геолокации пользователя
    getUserLocation() {
        if ('geolocation' in navigator) {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                // Успешное получение геолокации
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.currentPosition = [latitude, longitude];
                    this.map.setView([latitude, longitude], MAP_CONFIG.zoom);
                },
                // Ошибка получения геолокации
                (error) => {
                    console.warn('Ошибка получения геолокации:', error);
                    // Используем дефолтные координаты из конфига
                    this.currentPosition = MAP_CONFIG.center;
                    this.map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
                },
                options
            );
        } else {
            console.warn('Геолокация не поддерживается в этом браузере');
            // Используем дефолтные координаты из конфига
            this.currentPosition = MAP_CONFIG.center;
            this.map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
        }
    }

    // Добавление маркера на карту
    addMarker(id, lat, lng, text) {
        const marker = L.marker([lat, lng])
            .bindPopup(text)
            .addTo(this.map);
        
        this.markers.set(id, marker);
        
        // Добавляем обработчик клика по маркеру
        marker.on('click', () => {
            const event = new CustomEvent('marker:clicked', {
                detail: { id, lat, lng, text }
            });
            document.dispatchEvent(event);
        });

        return marker;
    }

    // Удаление маркера с карты
    removeMarker(id) {
        const marker = this.markers.get(id);
        if (marker) {
            marker.remove();
            this.markers.delete(id);
        }
    }

    // Обновление маркера
    updateMarker(id, text) {
        const marker = this.markers.get(id);
        if (marker) {
            marker.setPopupContent(text);
        }
    }

    // Центрирование карты на маркере
    centerOnMarker(id) {
        const marker = this.markers.get(id);
        if (marker) {
            this.map.setView(marker.getLatLng(), this.map.getZoom());
        }
    }

    // Получение координат центра карты
    getCenter() {
        return this.map.getCenter();
    }

    // Получение текущего масштаба
    getZoom() {
        return this.map.getZoom();
    }
}

// Создаем и экспортируем экземпляр менеджера карты
const mapManager = new MapManager();
export default mapManager; 