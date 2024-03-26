require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const fetchArticlesFromMedium = require('./services/mediumScraper');
const postTweet = require('./services/twitterService');
const { fetchPostedArticles, addPostedArticle } = require('./Utils/storage');

const app = express();
const PORT = process.env.PORT || 3000;

const checkAndPostArticles = async () => {
  console.log('Checking for new articles...');
  const articles = await fetchArticlesFromMedium(); // Fetch articles from Medium
  console.log(`Fetched ${articles.length} articles`);

  const postedArticles = fetchPostedArticles();

  // Define the maximum number of tweets you want to post at a time
  const maxTweetsAtATime = 2;
  let tweetsPosted = 0;

  for (const article of articles) {
    if (tweetsPosted >= maxTweetsAtATime) {
      console.log('Reached the limit of tweets for this execution.');
      break; // Stop posting more tweets once the limit is reached
    }

    if (!postedArticles.includes(article.title)) {
      console.log(`Attempting to post a new article: ${article.title}`);
      const tweetMessage = `Check out this article: "${article.title}" ${article.link}`;
      await postTweet(tweetMessage); // Post the tweet
      addPostedArticle(article.title); // Mark the article as posted
      console.log(`Posted and tracked: ${article.title}`);
      tweetsPosted++; // Increment the counter after each tweet
    }
  }
};

// Schedule the task to run every 10 minutes
cron.schedule('*/10 * * * *', checkAndPostArticles);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  checkAndPostArticles(); // Initial check when the server starts
});
