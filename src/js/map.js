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
            maxZoom: MAP_CONFIG.maxZoom,
            attributionControl: false
        });

        // Добавляем стильную темную карту
        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            attribution: ''
        }).addTo(this.map);

        // Настраиваем стиль маркеров
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });

        // Добавляем стили для маркеров
        const style = document.createElement('style');
        style.textContent = `
            .custom-marker {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .marker-pin {
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                background: var(--color-primary);
                position: relative;
                transform: rotate(-45deg);
                animation: bounce 0.3s ease-out;
            }
            .marker-pin::after {
                content: '';
                width: 24px;
                height: 24px;
                margin: 3px 0 0 3px;
                background: var(--color-surface);
                position: absolute;
                border-radius: 50%;
            }
            @keyframes bounce {
                0% { transform: rotate(-45deg) translateY(-10px); }
                100% { transform: rotate(-45deg) translateY(0); }
            }
            .leaflet-popup {
                margin-bottom: 15px;
            }
            .leaflet-popup-content-wrapper {
                background: var(--color-surface);
                color: var(--color-text);
                border-radius: var(--border-radius-md);
                border: 1px solid var(--color-border);
                box-shadow: var(--shadow-lg);
            }
            .leaflet-popup-content {
                margin: var(--spacing-md);
                font-family: var(--font-family);
            }
            .leaflet-popup-tip {
                background: var(--color-surface);
                border: 1px solid var(--color-border);
            }
            .review-preview {
                min-width: 200px;
            }
            .review-preview__text {
                color: var(--color-text);
                margin-bottom: var(--spacing-sm);
                font-size: var(--font-size-sm);
            }
            .review-preview__meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: var(--color-text-secondary);
                font-size: var(--font-size-sm);
            }
        `;
        document.head.appendChild(style);

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
        const marker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-pin"></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            })
        })
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
            this.map.setView(marker.getLatLng(), Math.max(this.map.getZoom(), 15));
        }
    }

    // Открытие попапа маркера
    openMarkerPopup(id) {
        const marker = this.markers.get(id);
        if (marker) {
            marker.openPopup();
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