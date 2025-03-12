import { MAP_CONFIG } from './config.js';

class MapManager {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.currentPosition = null;
        this.adMarkers = [];
        this._lastAdUpdateTime = null;
        this._adEventsAttached = false;
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

    // Получение текущего центра карты
    getCenter() {
        return this.map.getCenter();
    }

    // Центрирование карты на маркере
    centerOnMarker(id) {
        const marker = this.markers.get(id);
        if (marker) {
            const latlng = marker.getLatLng();
            this.map.setView(latlng, this.map.getZoom());
            return true;
        }
        return false;
    }

    // Открытие попапа маркера
    openMarkerPopup(id) {
        const marker = this.markers.get(id);
        if (marker) {
            marker.openPopup();
            return true;
        }
        return false;
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
        // Удаляем существующие рекламные маркеры
        this.adMarkers.forEach(marker => {
            if (marker) marker.remove();
        });
        this.adMarkers = [];

        // Получаем текущие границы карты
        const bounds = this.map.getBounds();
        const center = this.map.getCenter();
        const zoom = this.map.getZoom();
        
        // Вычисляем размеры видимой области
        const latSpan = bounds.getNorth() - bounds.getSouth();
        const lngSpan = bounds.getEast() - bounds.getWest();

        // Добавляем стили для рекламных плашек
        if (!document.getElementById('ad-styles')) {
            const style = document.createElement('style');
            style.id = 'ad-styles';
            style.textContent += `
                .ad-container {
                    background: rgba(26, 26, 26, 0.85);
                    border: 1px solid var(--color-primary);
                    border-radius: 6px;
                    padding: 6px 10px;
                    color: var(--color-text);
                    font-family: var(--font-family);
                    font-size: 11px;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(4px);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    min-width: 0;
                    width: max-content;
                    z-index: 1000;
                    transition: transform 0.2s ease, 
                              box-shadow 0.2s ease,
                              background-color 0.2s ease;
                }
                
                .ad-container:hover {
                    transform: scale(1.05);
                    background: rgba(26, 26, 26, 0.95);
                    border-color: var(--color-primary);
                    box-shadow: 0 4px 8px rgba(var(--color-primary-rgb), 0.4);
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
                    font-size: 12px;
                }
                
                .ad-price {
                    color: var(--color-primary);
                    font-size: 10px;
                    font-weight: 600;
                    white-space: nowrap;
                    border-left: 1px solid rgba(255, 215, 0, 0.3);
                    padding-left: 6px;
                }
                
                .ad-popup {
                    background: rgba(26, 26, 26, 0.95) !important;
                    border: 1px solid var(--color-primary) !important;
                    border-radius: 8px !important;
                    padding: 16px !important;
                    font-family: var(--font-family) !important;
                    backdrop-filter: blur(4px);
                    min-width: 260px;
                    max-width: 320px;
                }
                
                .ad-popup-content {
                    color: var(--color-text);
                    font-size: 13px;
                    line-height: 1.5;
                }
                
                .ad-popup-title {
                    color: var(--color-primary);
                    font-weight: 600;
                    font-size: 16px;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .ad-popup-title::before {
                    content: '💰';
                    font-size: 16px;
                }
                
                .ad-popup-text {
                    margin-bottom: 12px;
                }
                
                .ad-info-list {
                    margin: 12px 0;
                }
                
                .ad-info-item {
                    margin-bottom: 6px;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                }
                
                .ad-info-item:before {
                    content: '•';
                    color: var(--color-primary);
                }
                
                .ad-popup-links {
                    display: flex;
                    gap: 12px;
                    margin-top: 16px;
                }
                
                .ad-popup-link {
                    color: var(--color-primary);
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 500;
                    padding: 8px 12px;
                    border: 1px solid var(--color-primary);
                    border-radius: 4px;
                    transition: all 0.2s ease;
                    text-align: center;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }
                
                .ad-popup-link:hover {
                    background: var(--color-primary);
                    color: #000;
                }
                
                .ad-close-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: var(--color-text);
                    font-size: 16px;
                    cursor: pointer;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }
                
                .ad-close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .leaflet-popup-tip-container {
                    display: none !important;
                }
                
                .leaflet-popup-content-wrapper {
                    padding: 0 !important;
                }
                
                .leaflet-popup-content {
                    margin: 0 !important;
                    width: 100% !important;
                }

                /* Стили для мобильных устройств */
                @media (max-width: 768px) {
                    .ad-container {
                        font-size: 12px;
                        padding: 8px 12px;
                    }
                    .ad-text::before {
                        font-size: 14px;
                    }
                    .ad-price {
                        font-size: 11px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Контент для рекламных плашек (разные варианты)
        const adContents = [
            { text: 'Реклама', price: '10 000₽' },
            { text: 'Ваша реклама', price: '15 000₽' },
            { text: 'Рекламное место', price: '8 000₽' },
            { text: 'Продвижение', price: '12 000₽' },
            { text: 'Размещение', price: '9 000₽' }
        ];

        // Определяем количество рекламных плашек (от 3 до 5)
        const numAds = Math.floor(Math.random() * 3) + 3;
        
        // Создаем рекламные плашки в случайных позициях
        for (let i = 0; i < numAds; i++) {
            // Генерируем случайные координаты в пределах видимой области карты
            // Избегаем краев, чтобы плашки были полностью видимы
            const lat = bounds.getSouth() + Math.random() * latSpan * 0.8 + latSpan * 0.1;
            const lng = bounds.getWest() + Math.random() * lngSpan * 0.8 + lngSpan * 0.1;
            
            // Выбираем случайный контент
            const adContent = adContents[Math.floor(Math.random() * adContents.length)];
            
            // Создаем элемент рекламной плашки
            const adDiv = document.createElement('div');
            adDiv.className = 'ad-container';
            adDiv.innerHTML = `
                <div class="ad-text">${adContent.text}</div>
                <div class="ad-price">${adContent.price}</div>
            `;

            const adIcon = L.divIcon({
                className: 'ad-icon',
                html: adDiv,
                iconSize: [120, 'auto'],
                iconAnchor: [60, 15]
            });

            const marker = L.marker([lat, lng], { 
                icon: adIcon,
                interactive: true,
                zIndexOffset: 1000
            }).addTo(this.map);

            // Создаем попап с детальным рекламным предложением
            const popupContent = `
                <div class="ad-popup">
                    <button class="ad-close-btn">✕</button>
                    <div class="ad-popup-content">
                        <div class="ad-popup-title">Рекламное предложение</div>
                        <div class="ad-popup-text">Разместите свою рекламу на нашей интерактивной карте и получите уникальный канал коммуникации с тысячами пользователей ежедневно.</div>
                        
                        <div class="ad-info-list">
                            <div class="ad-info-item">Более 10,000 уникальных просмотров ежедневно</div>
                            <div class="ad-info-item">Таргетинг рекламы по географии</div>
                            <div class="ad-info-item">Интерактивные баннеры с описанием услуг</div>
                            <div class="ad-info-item">Аналитика и статистика взаимодействий</div>
                        </div>
                        
                        <div class="ad-popup-price">Стоимость размещения: от ${adContent.price} в месяц</div>
                        
                        <div class="ad-popup-links">
                            <a href="mailto:temple@mail.com" class="ad-popup-link" onclick="alert('Отправка запроса рекламодателю'); return false;">📧 Email</a>
                            <a href="https://t.me/t33puck" class="ad-popup-link" onclick="alert('Переход в Telegram'); return false;">📱 Telegram</a>
                        </div>
                    </div>
                </div>
            `;

            const popup = L.popup({
                closeButton: false,
                className: 'ad-popup-container',
                maxWidth: 320,
                offset: [0, -5]
            }).setContent(popupContent);

            marker.bindPopup(popup);

            this.adMarkers.push(marker);

            // Добавляем обработчик события для клика
            adDiv.addEventListener('click', (e) => {
                marker.openPopup();
                e.stopPropagation();
            });
            
            // Добавляем возможность перетаскивания рекламной плашки
            const draggable = new L.Draggable(adDiv);
            draggable.enable();
            
            draggable.on('drag', (e) => {
                const latLng = this.map.containerPointToLatLng(L.point(e.sourceTarget._newPos.x, e.sourceTarget._newPos.y));
                marker.setLatLng(latLng);
            });
        }

        // Добавляем обработчик события для обновления рекламных плашек при изменении карты
        if (!this._adEventsAttached) {
            this.map.on('moveend', () => {
                // Обновляем рекламные плашки с небольшой задержкой
                setTimeout(() => this.addAdvertisements(), 300);
            });
            
            this._adEventsAttached = true;
        }
    }
}

// Создаем и экспортируем экземпляр менеджера карты
const mapManager = new MapManager();
export default mapManager;
