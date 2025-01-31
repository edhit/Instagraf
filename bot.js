require('dotenv').config(); // Загружаем переменные окружения из .env
const { Telegraf } = require('telegraf');
const { instagramdl } = require('instagram-url-direct');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Получаем токен бота из переменных окружения
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Функция для нормализации ссылки
function normalizeInstagramUrl(url) {
    // Если ссылка с ddinstagram.com, преобразуем её в обычную ссылку на Instagram
    if (url.includes('ddinstagram.com')) {
        const reelCode = url.split('/reel/')[1].split('/')[0];
        return `https://www.instagram.com/reel/${reelCode}/`;
    }
    // Если ссылка уже с instagram.com, оставляем как есть
    return url;
}

// Обработка сообщений с ссылками
bot.on('text', async (ctx) => {
    const url = ctx.message.text;

    try {
        // Проверка, что ссылка ведет на Instagram или ddinstagram
        if (!url.includes('instagram.com') && !url.includes('ddinstagram.com')) {
            return; // Игнорируем некорректные ссылки
        }

        // Нормализация ссылки
        const normalizedUrl = normalizeInstagramUrl(url);

        // Получение данных о видео
        const result = await instagramdl(normalizedUrl);
        if (result.length === 0) {
            return; // Игнорируем, если видео не найдено
        }

        // Скачивание видео
        const videoUrl = result[0].url_list[0];
        const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
        const videoPath = path.join(__dirname, 'video.mp4');
        const writer = fs.createWriteStream(videoPath);

        videoResponse.data.pipe(writer);

        writer.on('finish', async () => {
            // Отправка видео в группу
            await ctx.replyWithVideo({ source: videoPath });

            // Удаление видео с сервера
            fs.unlinkSync(videoPath);
        });

        writer.on('error', (err) => {
            console.error('Ошибка при скачивании видео:', err);
            // Ничего не отправляем в группу
        });

    } catch (error) {
        console.error('Ошибка:', error);
        // Ничего не отправляем в группу
    }
});

// Запуск бота
bot.launch();
console.log('Бот запущен...');
