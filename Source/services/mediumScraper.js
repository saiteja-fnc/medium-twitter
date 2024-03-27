const puppeteer = require('puppeteer');

const fetchArticlesFromMedium = async (mediumProfileUrl) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(mediumProfileUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector('article'); // Ensure articles have loaded

    const articles = await page.evaluate(() => {
        const extractedArticles = [];
        document.querySelectorAll('article').forEach(article => {
            const titleElement = article.querySelector('h2'); // Adjust if needed
            const linkElement = article.querySelector('a'); // Assuming the first link is what you want

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
