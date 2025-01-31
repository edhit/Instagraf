const instagramGetUrl = require('instagram-url-direct');

(async () => {
    const url = 'https://www.ddinstagram.com/reel/DEiT7yNMx9F/?igsh=OGlubXdvcTAwNndt';
    try {
        const result = await instagramGetUrl(url);
        console.log('Результат:', result);
    } catch (error) {
        console.error('Ошибка при получении видео:', error.message);
    }
})();
