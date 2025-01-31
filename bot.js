const { Telegraf } = require('telegraf');
const { instagramGetUrl } = require('instagram-url-direct');
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

const downloadVideo = (videoUrl, filePath) => {
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        axios
            .get(videoUrl, { responseType: 'stream' })
            .then((response) => {
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            })
            .catch(reject);
    });
};

bot.on('text', async (ctx) => {
    const url = ctx.message.text.trim();
    if (!url.includes('instagram.com') && !url.includes('ddinstagram.com')) {
        return;
    }

    const normalizedUrl = normalizeInstagramUrl(url);
    try {
        const result = await instagramGetUrl(normalizedUrl);

        if (!result || !Array.isArray(result) || result.length === 0 || !result[0].url) {
             // ctx.reply('Не удалось найти видео по указанной ссылке.');
            return
        }

        const videoUrl = result[0].url_list[0];
        const videoPath = path.join(__dirname, 'video.mp4');
        await downloadVideo(videoUrl, videoPath);

        await ctx.replyWithVideo({ source: videoPath });
        fs.unlinkSync(videoPath);
    } catch (error) {
        console.error('Ошибка:', error);
       // ctx.reply('Произошла ошибка при обработке ссылки.');
    }
});

bot.launch().then(() => console.log('Бот успешно запущен...'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
