require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { fetchArticlesFromMedium } = require('./services/mediumScraper');
const { saveArticles, loadArticles, savePostedArticle, loadPostedArticles } = require('./utils/storage');
const postTweet = require('./services/twitterService');

const app = express();
const PORT = process.env.PORT || 3000;
const mediumProfileUrl = process.env.MEDIUM_PROFILE_URL;

// Adjusted to include functionality for saving the state of posted articles
const checkAndFetchArticles = async () => {
    console.log('Checking for new articles...');
  
    const articles = await fetchArticlesFromMedium(mediumProfileUrl); 
  
    if (!articles || articles.length === 0) {
        console.log('No new articles found.');
        return;
    }

    console.log(`Fetched ${articles.length} articles.`);
    
    saveArticles(articles);
    console.log('Articles have been saved for future posting.');
};

const postRandomArticleToTwitter = async () => {
    const allArticles = loadArticles();
    const postedArticles = loadPostedArticles();

    // Filter for articles that have not been posted yet
    const articlesToPost = allArticles.filter(article => 
        !postedArticles.find(posted => posted.link === article.link));

    if (articlesToPost.length > 0) {
        const article = articlesToPost[Math.floor(Math.random() * articlesToPost.length)];
        await postTweet(` ${article.title} ${article.link}`);
        console.log(`Article posted: ${article.title}`);

        // Save the posted article to prevent it from being posted again
        savePostedArticle(article);
    } else {
        console.log("No new articles to post.");
    }
};

const scheduleArticlePosting = () => {
    // Scheduling article posting at 3 "random" intervals
    const intervals = ['0 9 * * *', '0 14 * * *', '0 19 * * *']; // Placeholder intervals
    intervals.sort(() => 0.5 - Math.random()).slice(0, 3).forEach(interval => {
        cron.schedule(interval, postRandomArticleToTwitter);
        console.log(`Post to Twitter scheduled at interval: ${interval}`);
    });
};

// Fetching articles from Medium to run every 8 hours 
cron.schedule('0 */8 * * *', checkAndFetchArticles);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    checkAndFetchArticles(); // Perform an initial check when the server starts
    scheduleArticlePosting(); // Schedule article posting after the server has started
});
