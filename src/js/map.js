import { MAP_CONFIG } from './config.js';

class MapManager {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.currentPosition = null;
        this.adMarkers = [];
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
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            maxZoom: 19
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

        // Добавляем рекламные плашки
        this.addAdvertisements();
        
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

    // Добавление рекламных плашек
    addAdvertisements() {
        // Генерируем случайные точки вокруг центра карты
        const center = this.map.getCenter();
        const bounds = this.map.getBounds();
        const latSpan = bounds.getNorth() - bounds.getSouth();
        const lngSpan = bounds.getEast() - bounds.getWest();

        // Добавляем стили для рекламных плашек
        const style = document.createElement('style');
        style.textContent += `
            .ad-container {
                background: rgba(26, 26, 26, 0.85);
                border: 1px solid var(--color-primary);
                border-radius: 6px;
                padding: 4px 8px;
                color: var(--color-text);
                font-family: var(--font-family);
                font-size: 10px;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(4px);
                display: inline-flex;
                align-items: center;
                gap: 6px;
                min-width: 0;
                width: max-content;
            }
            .ad-container:hover {
                transform: scale(1.05);
                background: rgba(26, 26, 26, 0.95);
                border-color: var(--color-primary);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            .ad-text {
                font-weight: 500;
                color: var(--color-text);
                display: flex;
                align-items: center;
                gap: 4px;
                white-space: nowrap;
            }
            .ad-text::before {
                content: '💰';
                font-size: 11px;
            }
            .ad-price {
                color: var(--color-primary);
                font-size: 9px;
                font-weight: 600;
                white-space: nowrap;
                border-left: 1px solid rgba(255, 215, 0, 0.3);
                padding-left: 6px;
            }
            .ad-popup {
                background: rgba(26, 26, 26, 0.95) !important;
                border: 1px solid var(--color-primary) !important;
                border-radius: 8px !important;
                padding: 12px !important;
                font-family: var(--font-family) !important;
                backdrop-filter: blur(4px);
                min-width: 240px;
            }
            .ad-popup-content {
                color: var(--color-text);
                font-size: 12px;
                line-height: 1.4;
            }
            .ad-popup-title {
                color: var(--color-primary);
                font-weight: 600;
                margin-bottom: 8px;
            }
            .ad-popup-text {
                margin-bottom: 10px;
            }
            .ad-popup-links {
                display: flex;
                gap: 10px;
                margin-top: 8px;
            }
            .ad-popup-link {
                color: var(--color-primary);
                text-decoration: none;
                font-size: 11px;
                font-weight: 500;
                padding: 4px 8px;
                border: 1px solid var(--color-primary);
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            .ad-popup-link:hover {
                background: var(--color-primary);
                color: #000;
            }
            .leaflet-popup-tip-container {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        // Создаем 5 рекламных плашек
        for (let i = 0; i < 5; i++) {
            const lat = center.lat + (Math.random() - 0.5) * latSpan * 0.8;
            const lng = center.lng + (Math.random() - 0.5) * lngSpan * 0.8;

            const adDiv = document.createElement('div');
            adDiv.className = 'ad-container';
            adDiv.innerHTML = `
                <div class="ad-text">Реклама</div>
                <div class="ad-price">10 000₽</div>
            `;

            const adIcon = L.divIcon({
                className: 'ad-icon',
                html: adDiv,
                iconSize: [100, 'auto'],
                iconAnchor: [50, 15]
            });

            const marker = L.marker([lat, lng], {
                icon: adIcon,
                zIndexOffset: 1000
            }).addTo(this.map);

            const popupContent = `
                <div class="ad-popup">
                    <div class="ad-popup-content">
                        <div class="ad-popup-title">Разместите рекламу</div>
                        <div class="ad-popup-text">
                            Разместите у нас рекламу вашего бизнеса:<br>
                            Шиномонтажка, эвакуатор, автозапчасти
                        </div>
                        <div class="ad-popup-links">
                            <a href="mailto:temple@mail.com" class="ad-popup-link" target="_blank">📧 Email</a>
                            <a href="https://t.me/your_username" class="ad-popup-link" target="_blank">📱 Telegram</a>
                        </div>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, {
                className: 'ad-popup-wrapper',
                closeButton: false,
                offset: [0, -10]
            });

            marker.on('click', () => {
                marker.openPopup();
            });

            this.adMarkers.push(marker);
        }

        // Обновляем размер плашек при изменении зума
        this.map.on('zoomend', () => {
            const zoom = this.map.getZoom();
            const scale = Math.max(0.5, Math.min(1.1, zoom / 13));

            document.querySelectorAll('.ad-container').forEach(container => {
                container.style.transform = `scale(${scale})`;
                container.style.opacity = Math.min(1, scale + 0.2);
            });
        });
    }
}

// Создаем и экспортируем экземпляр менеджера карты
const mapManager = new MapManager();
export default mapManager; 