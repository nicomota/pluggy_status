module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // Limpar cookies de sessão
    res.setHeader('Set-Cookie', [
      'session-auth=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
      'user-email=; Path=/; Max-Age=0; SameSite=Lax'
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro no logout:', error);
    return res.status(500).json({ success: false });
  }
};