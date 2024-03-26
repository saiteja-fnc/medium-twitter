const fs = require('fs');
const path = require('path');
const articlesFilePath = path.join(__dirname, '../../data/articles.json');

const fetchPostedArticles = () => {
  try {
    const data = fs.readFileSync(articlesFilePath);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading posted articles file:', error);
    return [];
  }
};

const addPostedArticle = (articleTitle) => {
  const postedArticles = fetchPostedArticles();
  postedArticles.push(articleTitle);
  fs.writeFileSync(articlesFilePath, JSON.stringify(postedArticles, null, 2));
};

module.exports = { fetchPostedArticles, addPostedArticle };
