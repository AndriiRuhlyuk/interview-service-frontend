FROM node:16

WORKDIR /app

# Копіюємо package.json і встановлюємо залежності
COPY package.json .
RUN npm install

# Копіюємо весь код
COPY . .

# Будуємо продакшн-версію React
RUN npm run build

# Встановлюємо простий сервер для роздачі статичних файлів
RUN npm install -g serve

# Запускаємо додаток
CMD ["serve", "-s", "build", "-l", "3000"]