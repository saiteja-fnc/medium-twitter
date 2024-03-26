const axios = require('axios');
const cheerio = require('cheerio');
const { mediumProfileUrl } = require('../config');

const fetchArticlesFromMedium = async () => {
  try {
    const { data } = await axios.get(mediumProfileUrl);
    const $ = cheerio.load(data);
    const articles = [];

    $('article').each((index, element) => {
      let link = $(element).find('a').attr('href');
      // Check if the link is a full URL or just a path
      if (!link.startsWith('http')) {
        link = `https://medium.com/@thekubeguy${link}`;
      }
      const title = $(element).find('h2').text();
      articles.push({ title, link });
    });

    return articles;
  } catch (error) {
    console.error('Error fetching articles from Medium:', error);
    return [];
  }
};

module.exports = fetchArticlesFromMedium;
