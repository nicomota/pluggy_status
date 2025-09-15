const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data.js');
    const dataContent = fs.readFileSync(dataPath, 'utf8');

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(dataContent);
  } catch (error) {
    console.error('Erro ao servir data.js:', error);
    res.status(404).send('data.js not found');
  }
};