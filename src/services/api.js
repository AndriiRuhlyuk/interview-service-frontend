import axios from 'axios';

// Створення екземпляру axios з базовою URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Додавання інтерсепторів для обробки запитів
api.interceptors.request.use(
  (config) => {
    // Тут може бути логіка додавання токену авторизації, якщо потрібно
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Додавання інтерсепторів для обробки відповідей
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обробка помилок
    if (error.response) {
      // Помилка сервера (коди 4XX, 5XX)
      console.error('API Error:', error.response.status, error.response.data);
      
      // Тут можна додати логіку для відображення повідомлень про помилки
    } else if (error.request) {
      // Запит був зроблений, але відповідь не отримана
      console.error('No response received:', error.request);
    } else {
      // Щось сталося при налаштуванні запиту
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
