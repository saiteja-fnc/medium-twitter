require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { fetchArticlesFromMedium } = require('./services/mediumScraper');
const postTweet = require('./services/twitterService');
const { fetchPostedArticles, addPostedArticle } = require('./utils/storage');

const app = express();
const PORT = process.env.PORT || 3000;
const mediumProfileUrl = process.env.MEDIUM_PROFILE_URL;

const checkAndPostArticles = async () => {
  console.log('Checking for new articles...');
  
  const articles = await fetchArticlesFromMedium(mediumProfileUrl);
  console.log('First article:', articles ? articles[0] : 'No articles');

  if (!articles || articles.length === 0) {
    console.log('No new articles found.');
    return; // Exit if no articles are fetched
  }

  console.log(`Fetched ${articles.length} articles`);
  // Log each article's title and link
  articles.forEach(article => {
    console.log(`Title: ${article.title}, Link: ${article.link}`);
  });

  const postedArticles = fetchPostedArticles();
  const maxTweetsAtATime = 2;
  let tweetsPosted = 0;

  for (const article of articles) {
    if (tweetsPosted >= maxTweetsAtATime) {
      console.log('Reached the limit of tweets for this execution.');
      break; // Stop posting more tweets once the limit is reached
    }

    if (!postedArticles.includes(article.title)) {
      console.log(`Attempting to post a new article: ${article.title}`);
      // Make sure both article.title and article.link are defined
      if (article.title && article.link) {
        const tweetMessage = `Check out this article: "${article.title}" ${article.link}`;
        await postTweet(tweetMessage); // Post the tweet
        addPostedArticle(article.title); // Mark the article as posted
        console.log(`Posted and tracked: ${article.title}`);
        tweetsPosted++; // Increment the counter after each tweet
      } else {
        console.log('Article title or link is undefined, skipping...');
      }
    }
  }
};

// Schedule the task to run every 10 minutes
cron.schedule('*/10 * * * *', checkAndPostArticles);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  // Perform an initial check when the server starts
  checkAndPostArticles(); 
});
