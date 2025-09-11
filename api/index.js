const fs = require('fs');
const path = require('path');
const cookie = require('cookie');

// Middleware de autenticação para Vercel
function requireAuth(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  return cookies['session-auth'] === 'authenticated';
}

module.exports = async (req, res) => {
  // Verificar autenticação
  if (!requireAuth(req)) {
    return res.redirect(302, '/login');
  }

  try {
    // Servir o arquivo index.html
    const indexPath = path.join(process.cwd(), 'public', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(indexContent);
  } catch (error) {
    console.error('Erro ao servir index.html:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};