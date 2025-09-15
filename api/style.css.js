const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const cssPath = path.join(process.cwd(), 'public', 'style.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(cssContent);
  } catch (error) {
    console.error('Erro ao servir CSS:', error);
    res.status(404).send('CSS not found');
  }
};