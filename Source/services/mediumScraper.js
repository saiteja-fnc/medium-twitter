const puppeteer = require('puppeteer');

// Function to auto-scroll to the bottom of the page
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

// Function to fetch articles from a Medium profile
const fetchArticlesFromMedium = async (mediumProfileUrl) => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(mediumProfileUrl, { waitUntil: 'networkidle2' });
    await autoScroll(page); // Ensure all articles are loaded

    const articles = await page.evaluate(() => {
        const extractedArticles = [];
        document.querySelectorAll('article').forEach(article => {
            const titleElement = article.querySelector('h2'); // Adjust selector as necessary
            const title = titleElement ? titleElement.innerText.trim() : 'No title';
            const linkElements = article.querySelectorAll('a');
            const links = Array.from(linkElements).map(a => a.href).filter(href => href.startsWith('https://'));

            let linkToUse = '';
            if (links.length > 1) {
                linkToUse = links[1]; // Skip the first link and use the second one
            } else if (links.length === 1) {
                linkToUse = links[0]; // Use the only link available
            }

            if (linkToUse) {
                extractedArticles.push({ title, link: linkToUse });
            }
        });
        return extractedArticles;
    });

    await browser.close();
    return articles;
};

module.exports = { fetchArticlesFromMedium };

