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
        // Assuming articles are contained in elements that specifically have 'data-href' attributes
        document.querySelectorAll('[data-href]').forEach(element => {
            const titleElement = element.querySelector('h2'); // Assuming the title is in an <h2> within the element
            const title = titleElement ? titleElement.innerText.trim() : 'No title';
            const dataHref = element.getAttribute('data-href');

            // Construct full URL if necessary (if dataHref is relative)
            const link = dataHref.startsWith('https://thekubeguy.com') ? dataHref : `${dataHref}`;
            
            extractedArticles.push({ title, link });
        });
        return extractedArticles;
    });

    await browser.close();
    return articles;
};

module.exports = { fetchArticlesFromMedium };
