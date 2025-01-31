const { instagramGetUrl } = require('instagram-url-direct');

(async () => {
    const url = 'https://www.instagram.com/reel/КОД_ВИДЕО/';
    try {
        const result = await instagramGetUrl(url);
        console.log('Результат:', result);
    } catch (error) {
        console.error('Ошибка при получении видео:', error.message);
    }
})();
