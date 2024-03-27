const puppeteer = require('puppeteer');

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100; // Distance to scroll each step
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

const fetchArticlesFromMedium = async (mediumProfileUrl) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(mediumProfileUrl, { waitUntil: 'networkidle2' });

    // Scroll to the bottom to ensure all articles are loaded
    await autoScroll(page);

    const articles = await page.evaluate(() => {
        const extractedArticles = [];
        document.querySelectorAll('article').forEach(article => {
            // Adjust selectors based on Medium's structure
            const titleElement = article.querySelector('h2');
            const linkElement = article.querySelector('a');
            if (titleElement && linkElement) {
                const title = titleElement.innerText.trim();
                const link = linkElement.href;
                extractedArticles.push({ title, link });
            }
        });
        return extractedArticles;
    });

    await browser.close();
    return articles;
};

module.exports = { fetchArticlesFromMedium };
