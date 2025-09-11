module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { email, password } = req.body || {};
    
    if (password === '@mister2025' && email.endsWith('@equipe.mistercontador.com.br')) {
      // Definir cookie de sessão
      res.setHeader('Set-Cookie', [
        'session-auth=authenticated; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax',
        `user-email=${encodeURIComponent(email)}; Path=/; Max-Age=86400; SameSite=Lax`
      ]);
      
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};