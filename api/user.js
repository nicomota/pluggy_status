const cookie = require('cookie');

module.exports = async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionCookie = cookies['session-auth'];
  const userEmail = cookies['user-email'];
  
  if (sessionCookie !== 'authenticated') {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    res.json({
      email: decodeURIComponent(userEmail || ''),
      authenticated: true
    });
  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};