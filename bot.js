const { Telegraf } = require('telegraf');
const instagramGetUrl = require('instagram-url-direct');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

function normalizeInstagramUrl(url) {
    if (url.includes('ddinstagram.com')) {
        const reelCode = url.split('/reel/')[1].split('/')[0];
        return `https://www.instagram.com/reel/${reelCode}/`;
    }
    return url;
}

const downloadVideo = async (videoUrl, filePath) => {
    try {
        const writer = fs.createWriteStream(filePath);
        const response = await axios.get(videoUrl, { responseType: 'stream' });

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', (err) => {
                console.error('Ошибка при записи видео:', err.message);
                reject(err);
            });
        });
    } catch (err) {
        console.error('Ошибка при загрузке видео:', err.message);
        throw err;
    }
};

const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
};

bot.on('text', async (ctx) => {
    const url = ctx.message.text.trim();
    if ((!url.includes('instagram.com') && !url.includes('ddinstagram.com')) || !isValidUrl(url)) {
        console.log('Получено сообщение, которое не является ссылкой:', url);
        return;
    }

    const normalizedUrl = url

    try {
        const result = await instagramGetUrl(normalizedUrl);

        const videoUrl = result.url_list[0];
        const videoPath = path.join(__dirname, 'video.mp4');
        try {
            await downloadVideo(videoUrl, videoPath);
            await ctx.replyWithVideo({ source: videoPath });
        } finally {
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке ссылки:', normalizedUrl, error.message);
    }
});

bot.launch().then(() => console.log('Бот успешно запущен...'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
