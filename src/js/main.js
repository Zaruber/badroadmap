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

    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        alert('Произошла ошибка при загрузке приложения. Попробуйте обновить страницу.');
    }
}

// Настройка обработчиков модального окна
function setupModalHandlers() {
    const modal = document.getElementById('addMarkModal');
    const cancelButton = document.getElementById('cancelButton');

    // Закрытие модального окна при клике на кнопку отмены
    cancelButton.addEventListener('click', () => {
        modal.classList.remove('is-active');
        document.getElementById('addMarkForm').reset();
    });

    // Закрытие модального окна при клике вне его содержимого
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('is-active');
            document.getElementById('addMarkForm').reset();
        }
    });

    // Закрытие модального окна по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-active')) {
            modal.classList.remove('is-active');
            document.getElementById('addMarkForm').reset();
        }
    });
}

// Глобальная функция для обработки лайков (используется в onclick)
window.handleLike = reviewManager.handleLike.bind(reviewManager);

// Запускаем приложение после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp); 