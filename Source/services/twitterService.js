const { TwitterApi } = require('twitter-api-v2');
const { twitter } = require('../config');

const twitterClient = new TwitterApi({
  appKey: twitter.appKey,
  appSecret: twitter.appSecret,
  accessToken: twitter.accessToken,
  accessSecret: twitter.accessSecret,
});

const postTweet = async (message) => {
  try {
    await twitterClient.v2.tweet(message);
    console.log('Tweet posted successfully:', message);
  } catch (error) {
    console.error('Error posting tweet:', error);
  }
};

module.exports = postTweet;
