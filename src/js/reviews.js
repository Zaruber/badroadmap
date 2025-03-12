import { supabase, DB_TABLES, FILTER_TYPES, MAX_FILE_SIZE, SUPPORTED_IMAGE_TYPES } from './config.js';
import mapManager from './map.js';

class ReviewManager {
    constructor() {
        this.reviews = new Map();
        this.currentFilter = FILTER_TYPES.DATE;
        this.supabase = supabase; // Экспортируем supabase для доступа из других модулей
    }

    // Инициализация менеджера отзывов
    async init() {
        try {
            await this.loadReviews();
            this.addEventListeners();
        } catch (error) {
            console.error('Ошибка при инициализации менеджера отзывов:', error);
        }
    }

    // Добавление обработчиков событий
    addEventListeners() {
        // Обработка клика по карте
        document.addEventListener('map:clicked', (e) => {
            this.showAddReviewModal(e.detail.lat, e.detail.lng);
        });

        // Обработка отправки формы добавления отзыва
        document.getElementById('addMarkForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleReviewSubmit(e.target);
        });
    }

    // Загрузка отзывов из базы данных
    async loadReviews() {
        try {
            // Загружаем отзывы
            const { data, error } = await supabase
                .from(DB_TABLES.REVIEWS)
                .select(`
                    *,
                    likes (count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Очищаем текущие отзывы и маркеры
            this.reviews.clear();
            
            if (data) {
                // Добавляем новые отзывы и маркеры
                data.forEach(review => {
                    this.reviews.set(review.id, {
                        ...review,
                        likes: { count: review.likes?.length || 0 }
                    });
                    mapManager.addMarker(
                        review.id,
                        review.latitude,
                        review.longitude,
                        this.createReviewPreview(review)
                    );
                });
            }

            this.updateReviewsList();
        } catch (error) {
            console.error('Ошибка при загрузке отзывов:', error);
        }
    }

    // Создание необходимых таблиц в базе данных
    async createTables() {
        try {
            // Создаем таблицу отзывов
            await supabase.rpc('create_reviews_table');
            
            // Создаем таблицу лайков
            await supabase.rpc('create_likes_table');
        } catch (error) {
            console.error('Ошибка при создании таблиц:', error);
            throw error;
        }
    }

    // Создание превью отзыва для маркера
    createReviewPreview(review) {
        return `
            <div class="review-preview">
                <p class="review-preview__text">${review.text.substring(0, 100)}${review.text.length > 100 ? '...' : ''}</p>
                <div class="review-preview__meta">
                    <span class="review-preview__date">${new Date(review.created_at).toLocaleDateString()}</span>
                    <span class="review-preview__likes">👍 ${review.likes?.count || 0}</span>
                </div>
            </div>
        `;
    }

    // Показ модального окна добавления отзыва
    showAddReviewModal(lat, lng) {
        const modal = document.getElementById('addMarkModal');
        modal.classList.add('is-active');
        
        // Сохраняем координаты в data-атрибутах формы
        const form = document.getElementById('addMarkForm');
        form.dataset.lat = lat;
        form.dataset.lng = lng;
    }

    // Обработка отправки формы добавления отзыва
    async handleReviewSubmit(form) {
        try {
            const text = form.querySelector('#reviewText').value;
            const photoInput = form.querySelector('#photoUpload');
            const lat = parseFloat(form.dataset.lat);
            const lng = parseFloat(form.dataset.lng);

            // Проверка файла
            let photoUrl = null;
            if (photoInput.files.length > 0) {
                const file = photoInput.files[0];
                
                // Проверка размера и формата
                if (file.size > MAX_FILE_SIZE) {
                    throw new Error('Файл слишком большой. Максимальный размер: 5MB');
                }
                if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
                    throw new Error('Неподдерживаемый формат файла. Используйте JPEG или PNG');
                }

                try {
                    // Генерируем уникальное имя файла
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                    // Загрузка файла в storage
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('reviews-photos')
                        .upload(`public/${fileName}`, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (uploadError) throw uploadError;

                    // Получаем публичный URL файла
                    const { data } = supabase.storage
                        .from('reviews-photos')
                        .getPublicUrl(`public/${fileName}`);

                    photoUrl = `public/${fileName}`;
                } catch (uploadError) {
                    console.error('Ошибка загрузки файла:', uploadError);
                    throw new Error('Не удалось загрузить фото. Попробуйте еще раз.');
                }
            }

            // Создание отзыва в базе данных
            const { data, error } = await supabase
                .from(DB_TABLES.REVIEWS)
                .insert([{
                    text,
                    photo_url: photoUrl,
                    latitude: lat,
                    longitude: lng
                }])
                .select()
                .single();

            if (error) throw error;

            // Добавляем отзыв в локальную коллекцию
            const review = {
                ...data,
                likes: { count: 0 }
            };
            this.reviews.set(review.id, review);
            
            // Добавляем маркер на карту
            mapManager.addMarker(review.id, lat, lng, this.createReviewPreview(review));

            // Обновляем список отзывов
            this.updateReviewsList();

            // Закрываем модальное окно
            document.getElementById('addMarkModal').classList.remove('is-active');
            form.reset();

        } catch (error) {
            console.error('Ошибка при добавлении отзыва:', error);
            alert(error.message || 'Не удалось добавить отзыв. Попробуйте еще раз.');
        }
    }

    // Обновление списка отзывов с учетом фильтра
    updateReviewsList() {
        const container = document.getElementById('reviewsList');
        const reviews = Array.from(this.reviews.values());

        // Сортируем по дате (самые новые сверху)
        reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Обновляем DOM
        container.innerHTML = reviews.map(review => `
            <article class="review" data-id="${review.id}" data-lat="${review.latitude}" data-lng="${review.longitude}">
                ${review.photo_url ? `
                    <img class="review__photo" src="${supabase.storage.from('reviews-photos').getPublicUrl(review.photo_url).data.publicUrl}" alt="Фото к отзыву" loading="lazy">
                ` : ''}
                <p class="review__text">${review.text}</p>
                <div class="review__meta">
                    <span class="review__date">${new Date(review.created_at).toLocaleDateString()}</span>
                    <span class="review__likes">👍 ${review.likes?.count || 0}</span>
                </div>
            </article>
        `).join('');

        // Добавляем обработчики клика на отзывы
        container.querySelectorAll('.review').forEach(reviewElement => {
            reviewElement.addEventListener('click', () => {
                const id = reviewElement.dataset.id;
                const lat = parseFloat(reviewElement.dataset.lat);
                const lng = parseFloat(reviewElement.dataset.lng);
                
                // Центрируем карту на маркере
                mapManager.centerOnMarker(id);
                
                // Открываем попап маркера
                mapManager.openMarkerPopup(id);
                
                // Добавляем класс активности для отзыва
                container.querySelectorAll('.review').forEach(el => el.classList.remove('review--active'));
                reviewElement.classList.add('review--active');
            });
        });
    }

    // Обработка лайка отзыва
    async handleLike(reviewId) {
        try {
            const { data, error } = await supabase
                .from(DB_TABLES.LIKES)
                .insert([{ review_id: reviewId }]);

            if (error) throw error;

            // Обновляем количество лайков в локальной коллекции
            const review = this.reviews.get(reviewId);
            if (review) {
                review.likes = { count: (review.likes?.count || 0) + 1 };
                this.reviews.set(reviewId, review);
                
                // Обновляем маркер и список
                mapManager.updateMarker(reviewId, this.createReviewPreview(review));
                this.updateReviewsList();
            }
        } catch (error) {
            console.error('Ошибка при добавлении лайка:', error);
            alert('Не удалось поставить лайк. Попробуйте еще раз.');
        }
    }
}

// Создаем и экспортируем экземпляр менеджера отзывов
const reviewManager = new ReviewManager();
export default reviewManager; 