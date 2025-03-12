import mapManager from './map.js';
import reviewManager from './reviews.js';

// Инициализация приложения
async function initApp() {
    try {
        // Инициализируем карту
        mapManager.init();
        
        // Инициализируем менеджер отзывов
        await reviewManager.init();

        // Добавляем обработчики для модального окна
        setupModalHandlers();
        
        // Добавляем обработчики для мобильной версии
        setupMobileHandlers();
        
        // Проверяем, мобильное ли устройство
        checkMobileDevice();

    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        alert('Произошла ошибка при загрузке приложения. Попробуйте обновить страницу.');
    }
}

// Настройка обработчиков модального окна
function setupModalHandlers() {
    const modal = document.getElementById('addMarkModal');
    const cancelButton = document.getElementById('cancelButton');
    const searchModal = document.getElementById('searchAddressModal');
    const cancelSearchButton = document.getElementById('cancelSearchButton');
    const styleModal = document.getElementById('mapStyleModal');
    const cancelStyleButton = document.getElementById('cancelStyleButton');

    // Закрытие модального окна добавления отметки
    cancelButton.addEventListener('click', () => {
        modal.classList.remove('is-active');
        document.getElementById('addMarkForm').reset();
    });

    // Закрытие модального окна добавления отметки при клике вне его содержимого
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('is-active');
            document.getElementById('addMarkForm').reset();
        }
    });

    // Закрытие модального окна поиска адреса
    cancelSearchButton.addEventListener('click', () => {
        searchModal.classList.remove('is-active');
        document.getElementById('searchAddressForm').reset();
    });

    // Закрытие модального окна поиска адреса при клике вне его содержимого
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.classList.remove('is-active');
            document.getElementById('searchAddressForm').reset();
        }
    });

    // Закрытие модального окна выбора стиля карты
    cancelStyleButton.addEventListener('click', () => {
        styleModal.classList.remove('is-active');
    });

    // Закрытие модального окна выбора стиля карты при клике вне его содержимого
    styleModal.addEventListener('click', (e) => {
        if (e.target === styleModal) {
            styleModal.classList.remove('is-active');
        }
    });

    // Закрытие любого модального окна по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal.classList.contains('is-active')) {
                modal.classList.remove('is-active');
                document.getElementById('addMarkForm').reset();
            }
            if (searchModal.classList.contains('is-active')) {
                searchModal.classList.remove('is-active');
                document.getElementById('searchAddressForm').reset();
            }
            if (styleModal.classList.contains('is-active')) {
                styleModal.classList.remove('is-active');
            }
        }
    });

    // Обработчик формы поиска адреса
    const searchAddressForm = document.getElementById('searchAddressForm');
    searchAddressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const addressInput = document.getElementById('addressInput');
        const address = addressInput.value.trim();
        
        if (address) {
            searchAddress(address);
            searchModal.classList.remove('is-active');
            searchAddressForm.reset();
        }
    });

    // Обработчики для опций стиля карты
    const mapStyleOptions = document.querySelectorAll('.map-style-option');
    mapStyleOptions.forEach(option => {
        option.addEventListener('click', () => {
            const style = option.dataset.style;
            changeMapStyle(style);
            styleModal.classList.remove('is-active');
            
            // Обновляем активный класс
            mapStyleOptions.forEach(opt => opt.classList.remove('map-style-option--active'));
            option.classList.add('map-style-option--active');
        });
    });
}

// Настройка обработчиков для мобильной версии
function setupMobileHandlers() {
    const addReviewBtn = document.getElementById('addReviewBtn');
    const centerMapBtn = document.getElementById('centerMapBtn');
    const reviewsCarousel = document.getElementById('reviewsCarousel');
    const mapStyleBtn = document.getElementById('mapStyleBtn');
    const searchAddressBtn = document.getElementById('searchAddressBtn');
    const toggleReviewsBtn = document.getElementById('toggleReviewsBtn');
    const mobileReviews = document.getElementById('mobileReviews');
    
    // Обработчик для кнопки добавления отзыва
    if (addReviewBtn) {
        addReviewBtn.addEventListener('click', () => {
            // Получаем центр карты и создаем "клик" по карте
            const center = mapManager.getCenter();
            const event = new CustomEvent('map:clicked', {
                detail: {
                    lat: center.lat,
                    lng: center.lng
                }
            });
            document.dispatchEvent(event);
        });
    }
    
    // Обработчик для кнопки центрирования карты
    if (centerMapBtn) {
        centerMapBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        mapManager.map.setView([latitude, longitude], 15);
                    },
                    (error) => {
                        console.warn('Ошибка получения геолокации:', error);
                        // Используем текущее положение карты
                        mapManager.map.setView(mapManager.map.getCenter(), 15);
                    }
                );
            } else {
                console.warn('Геолокация не поддерживается в этом браузере');
            }
        });
    }
    
    // Обработчик скролла карусели для обновления индикаторов
    if (reviewsCarousel) {
        reviewsCarousel.addEventListener('scroll', updateCarouselIndicators);
    }
    
    // Обработчик для кнопки стиля карты
    if (mapStyleBtn) {
        mapStyleBtn.addEventListener('click', () => {
            document.getElementById('mapStyleModal').classList.add('is-active');
        });
    }
    
    // Обработчик для кнопки поиска адреса
    if (searchAddressBtn) {
        searchAddressBtn.addEventListener('click', () => {
            document.getElementById('searchAddressModal').classList.add('is-active');
            document.getElementById('addressInput').focus();
        });
    }
    
    // Обработчик для кнопки показа/скрытия отзывов
    if (toggleReviewsBtn && mobileReviews) {
        toggleReviewsBtn.addEventListener('click', () => {
            mobileReviews.classList.toggle('is-visible');
            
            // Если мобильные отзывы открыты, обновляем индикаторы
            if (mobileReviews.classList.contains('is-visible')) {
                updateCarouselIndicators();
                toggleReviewsBtn.classList.add('mobile-nav__button--active');
            } else {
                toggleReviewsBtn.classList.remove('mobile-nav__button--active');
            }
        });
    }
    
    // Добавляем кнопку закрытия к мобильной карусели отзывов
    if (mobileReviews) {
        // Проверяем, существует ли уже кнопка закрытия
        if (!mobileReviews.querySelector('.mobile-reviews__toggle')) {
            const toggleButton = document.createElement('button');
            toggleButton.className = 'mobile-reviews__toggle';
            toggleButton.innerHTML = '&times;';
            toggleButton.addEventListener('click', () => {
                mobileReviews.classList.remove('is-visible');
                toggleReviewsBtn.classList.remove('mobile-nav__button--active');
            });
            mobileReviews.appendChild(toggleButton);
        }
    }
}

// Обновление карусели отзывов для мобильных устройств
function updateMobileReviews() {
    const reviewsCarousel = document.getElementById('reviewsCarousel');
    const carouselIndicators = document.getElementById('carouselIndicators');
    
    if (!reviewsCarousel || !carouselIndicators) return;
    
    // Получаем все отзывы
    const reviews = Array.from(reviewManager.reviews.values());
    
    // Если отзывов нет, не отображаем карусель
    if (reviews.length === 0) {
        document.getElementById('mobileReviews').style.display = 'none';
        return;
    }
    
    // Сортируем по дате (самые новые сверху)
    reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Генерируем HTML для отзывов
    reviewsCarousel.innerHTML = reviews.map(review => `
        <article class="review" data-id="${review.id}" data-lat="${review.latitude}" data-lng="${review.longitude}">
            ${review.photo_url ? `
                <img class="review__photo" src="${reviewManager.supabase.storage.from('reviews-photos').getPublicUrl(review.photo_url).data.publicUrl}" alt="Фото к отзыву" loading="lazy">
            ` : ''}
            <p class="review__text">${review.text}</p>
            <div class="review__meta">
                <span class="review__date">${new Date(review.created_at).toLocaleDateString()}</span>
                <span class="review__likes">👍 ${review.likes?.count || 0}</span>
            </div>
        </article>
    `).join('');
    
    // Генерируем индикаторы для карусели
    carouselIndicators.innerHTML = reviews.map((_, i) => 
        `<div class="carousel-indicators__dot${i === 0 ? ' carousel-indicators__dot--active' : ''}" data-index="${i}"></div>`
    ).join('');
    
    // Добавляем обработчики для отзывов в карусели
    reviewsCarousel.querySelectorAll('.review').forEach(reviewElement => {
        reviewElement.addEventListener('click', () => {
            const id = reviewElement.dataset.id;
            const lat = parseFloat(reviewElement.dataset.lat);
            const lng = parseFloat(reviewElement.dataset.lng);
            
            // Центрируем карту на маркере
            mapManager.centerOnMarker(id);
            
            // Открываем попап маркера
            mapManager.openMarkerPopup(id);
            
            // Добавляем класс активности для отзыва
            reviewsCarousel.querySelectorAll('.review').forEach(el => el.classList.remove('review--active'));
            reviewElement.classList.add('review--active');
            
            // Скрываем мобильные отзывы после выбора
            document.getElementById('mobileReviews').classList.remove('is-visible');
            document.getElementById('toggleReviewsBtn').classList.remove('mobile-nav__button--active');
        });
        
        // Добавляем поддержку свайпов в стиле Tinder
        setupSwipeHandler(reviewElement);
    });
    
    // Инициализируем начальное положение индикаторов
    updateCarouselIndicators();
}

// Настройка обработчика свайпов для карточки отзыва
function setupSwipeHandler(element) {
    let startX = 0;
    let startY = 0;
    let distX = 0;
    let distY = 0;
    let startTime = 0;
    let elapsedTime = 0;
    const swipeThreshold = 150;
    const restraint = 100;
    const allowedTime = 300;
    let initialRotation = 0;
    let initialOpacity = 1;
    
    element.addEventListener('touchstart', function(e) {
        const touchobj = e.changedTouches[0];
        startX = touchobj.pageX;
        startY = touchobj.pageY;
        startTime = new Date().getTime();
        initialRotation = 0;
        initialOpacity = 1;
        
        element.style.transition = 'none';
        element.style.transform = `translateX(0) rotate(${initialRotation}deg)`;
        element.style.opacity = initialOpacity;
    }, false);
    
    element.addEventListener('touchmove', function(e) {
        const touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX;
        distY = touchobj.pageY - startY;
        
        // Если горизонтальное движение больше вертикального, предотвращаем скролл страницы
        if (Math.abs(distX) > Math.abs(distY)) {
            e.preventDefault();
        }
        
        // Применяем трансформацию и изменение прозрачности
        const rotation = distX * 0.1; // Пропорциональный поворот
        const opacity = Math.max(0.5, 1 - Math.abs(distX) / 1000); // Уменьшение прозрачности
        
        element.style.transform = `translateX(${distX}px) rotate(${rotation}deg)`;
        element.style.opacity = opacity;
    }, { passive: false });
    
    element.addEventListener('touchend', function(e) {
        const touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX;
        distY = touchobj.pageY - startY;
        elapsedTime = new Date().getTime() - startTime;
        
        // Проверяем, был ли выполнен свайп
        const isSwipeLeft = elapsedTime <= allowedTime && distX <= -swipeThreshold && Math.abs(distY) <= restraint;
        const isSwipeRight = elapsedTime <= allowedTime && distX >= swipeThreshold && Math.abs(distY) <= restraint;
        
        // Добавляем анимацию возврата или свайпа
        element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        if (isSwipeLeft) {
            // Свайп влево - удаляем карточку
            element.style.transform = `translateX(-1000px) rotate(-30deg)`;
            element.style.opacity = 0;
            setTimeout(() => {
                // Переходим к следующей карточке
                const carousel = document.getElementById('reviewsCarousel');
                const reviewWidth = element.offsetWidth + parseInt(window.getComputedStyle(element).marginRight);
                carousel.scrollBy({ left: reviewWidth, behavior: 'smooth' });
                
                // Через 300ms возвращаем стили
                setTimeout(() => {
                    element.style.transform = 'translateX(0) rotate(0deg)';
                    element.style.opacity = 1;
                    element.style.transition = 'none';
                }, 300);
            }, 300);
        } else if (isSwipeRight) {
            // Свайп вправо - удаляем карточку
            element.style.transform = `translateX(1000px) rotate(30deg)`;
            element.style.opacity = 0;
            setTimeout(() => {
                // Переходим к предыдущей карточке
                const carousel = document.getElementById('reviewsCarousel');
                const reviewWidth = element.offsetWidth + parseInt(window.getComputedStyle(element).marginRight);
                carousel.scrollBy({ left: -reviewWidth, behavior: 'smooth' });
                
                // Через 300ms возвращаем стили
                setTimeout(() => {
                    element.style.transform = 'translateX(0) rotate(0deg)';
                    element.style.opacity = 1;
                    element.style.transition = 'none';
                }, 300);
            }, 300);
        } else {
            // Возвращаем карточку в исходное положение
            element.style.transform = 'translateX(0) rotate(0deg)';
            element.style.opacity = 1;
        }
    }, false);
}

// Определение мобильного устройства
function checkMobileDevice() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    // Устанавливаем класс для body в зависимости от устройства
    document.body.classList.toggle('is-mobile', isMobile);
    
    // Скрываем ненужные элементы UI в зависимости от устройства
    const mobileReviews = document.getElementById('mobileReviews');
    const sidebar = document.getElementById('sidebar');
    const addReviewBtn = document.getElementById('addReviewBtn');
    const mapControls = document.querySelector('.map-controls');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileReviews) mobileReviews.style.display = isMobile ? 'block' : 'none';
    if (sidebar) sidebar.style.display = isMobile ? 'none' : 'block';
    if (addReviewBtn) addReviewBtn.style.display = isMobile ? 'flex' : 'none';
    if (mapControls) mapControls.style.display = isMobile ? 'block' : 'none';
    if (mobileNav) mobileNav.style.display = isMobile ? 'flex' : 'none';
    
    // Изначально скрываем мобильные отзывы (они будут открываться по кнопке)
    if (mobileReviews) {
        mobileReviews.classList.remove('is-visible');
    }
    
    // Обновляем карусель, если на мобильном устройстве
    if (isMobile) {
        updateMobileReviews();
    }
}

// Обновление индикаторов карусели
function updateCarouselIndicators() {
    const reviewsCarousel = document.getElementById('reviewsCarousel');
    const carouselIndicators = document.getElementById('carouselIndicators');
    const dots = carouselIndicators?.querySelectorAll('.carousel-indicators__dot');
    
    if (!reviewsCarousel || !dots?.length) return;
    
    // Получаем текущий активный элемент на основе позиции скролла
    const scrollLeft = reviewsCarousel.scrollLeft;
    const itemWidth = reviewsCarousel.querySelector('.review')?.offsetWidth || 0;
    const scrollPosition = scrollLeft + itemWidth / 2;
    
    let activeIndex = Math.floor(scrollPosition / itemWidth);
    activeIndex = Math.max(0, Math.min(activeIndex, dots.length - 1));
    
    // Обновляем классы индикаторов
    dots.forEach((dot, i) => {
        dot.classList.toggle('carousel-indicators__dot--active', i === activeIndex);
    });
}

// Функция для поиска адреса (геокодирование)
async function searchAddress(address) {
    try {
        // Базовый URL для Nominatim OpenStreetMap API
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.length > 0) {
            // Берем первый результат
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);
            
            // Центрируем карту на найденную точку
            mapManager.map.setView([lat, lon], 15);
            
            // Можно добавить временный маркер
            const tempMarker = L.marker([lat, lon], {
                icon: L.divIcon({
                    className: 'search-result-marker',
                    html: '<div class="pulse"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(mapManager.map);
            
            // Удаляем маркер через 5 секунд
            setTimeout(() => {
                mapManager.map.removeLayer(tempMarker);
            }, 5000);
        } else {
            alert('Адрес не найден. Попробуйте уточнить запрос.');
        }
    } catch (error) {
        console.error('Ошибка при поиске адреса:', error);
        alert('Произошла ошибка при поиске адреса.');
    }
}

// Функция для изменения стиля карты
function changeMapStyle(style) {
    // Получаем URL тайлов в зависимости от стиля
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    
    // Устанавливаем стиль карты
    switch (style) {
        case 'dark':
            tileUrl = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
            attribution = '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
            break;
        case 'light':
            tileUrl = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
            attribution = '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
            break;
        case 'satellite':
            tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
            break;
    }
    
    // Удаляем текущий слой с тайлами
    mapManager.map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
            mapManager.map.removeLayer(layer);
        }
    });
    
    // Добавляем новый слой с тайлами
    L.tileLayer(tileUrl, {
        attribution: attribution,
        maxZoom: 19
    }).addTo(mapManager.map);
    
    // Сохраняем выбранный стиль в localStorage
    localStorage.setItem('mapStyle', style);
}

// Наблюдатель за изменением размера экрана для адаптивности
window.addEventListener('resize', () => {
    checkMobileDevice();
    
    // Если текущий активный отзыв, обновляем индикаторы
    if (document.querySelector('.review--active')) {
        updateCarouselIndicators();
    }
});

// Модифицируем метод updateReviewsList в ReviewManager для обновления мобильной карусели
const originalUpdateReviewsList = reviewManager.updateReviewsList;
reviewManager.updateReviewsList = function() {
    // Вызываем оригинальный метод
    originalUpdateReviewsList.call(this);
    
    // Обновляем мобильную карусель
    if (window.matchMedia('(max-width: 768px)').matches) {
        updateMobileReviews();
    }
};

// Глобальная функция для обработки лайков (используется в onclick)
window.handleLike = reviewManager.handleLike.bind(reviewManager);

// Запускаем приложение после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);