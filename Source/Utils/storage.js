const fs = require('fs');
const path = require('path');

const articlesFilePath = path.join(__dirname, 'articles.json');
const postedFilePath = path.join(__dirname, 'posted_articles.json');


const saveArticles = (newArticles) => {
    const existingArticles = loadArticles();
    const combinedArticles = [...existingArticles];

    newArticles.forEach(newArticle => {
        const exists = existingArticles.some(existingArticle => existingArticle.link === newArticle.link);
        if (!exists) {
            combinedArticles.push(newArticle);
        }
    });

    fs.writeFileSync(articlesFilePath, JSON.stringify(combinedArticles, null, 2), 'utf8');
};

const loadArticles = () => {
    if (!fs.existsSync(articlesFilePath)) {
        return [];
    }
    const data = fs.readFileSync(articlesFilePath, 'utf8');
    return JSON.parse(data);
};

const savePostedArticle = (article) => {
  let postedArticles = [];
  if (fs.existsSync(postedFilePath)) {
      postedArticles = JSON.parse(fs.readFileSync(postedFilePath, 'utf8'));
  }
  postedArticles.push(article);
  fs.writeFileSync(postedFilePath, JSON.stringify(postedArticles, null, 2), 'utf8');
};

// New: Function to load posted article identifiers
const loadPostedArticles = () => {
  if (!fs.existsSync(postedFilePath)) {
      return [];
  }
  return JSON.parse(fs.readFileSync(postedFilePath, 'utf8'));
};

module.exports = { saveArticles, loadArticles, savePostedArticle, loadPostedArticles };