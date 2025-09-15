const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const jsPath = path.join(process.cwd(), 'public', 'app.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(jsContent);
  } catch (error) {
    console.error('Erro ao servir JS:', error);
    res.status(404).send('JS not found');
  }
};