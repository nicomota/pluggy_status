const cookie = require('cookie');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificar autenticação
  const cookies = cookie.parse(req.headers.cookie || '');
  if (cookies['session-auth'] !== 'authenticated') {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  return res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    lastUpdated: new Date(),
    connectorsCount: 25
  });
};