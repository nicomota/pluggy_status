const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    // Servir o arquivo login.html
    const loginPath = path.join(process.cwd(), 'public', 'login.html');
    const loginContent = fs.readFileSync(loginPath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(loginContent);
  } catch (error) {
    console.error('Erro ao servir login.html:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};