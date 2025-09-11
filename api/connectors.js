const axios = require('axios');
const misterConnectors = require('./conectorsMister.js');

let apiKey = null;
let connectorsCache = [];
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const PLUGGY_HOST = process.env.host;
const PLUGGY_CLIENT_ID = process.env.CLIENT_ID;
const PLUGGY_CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getApiKey() {
  try {
    const response = await axios.post(`${PLUGGY_HOST}/auth`, {
      clientId: PLUGGY_CLIENT_ID,
      clientSecret: PLUGGY_CLIENT_SECRET,
    });
    apiKey = response.data.apiKey;
    console.log('API Key obtida com sucesso.');
    return apiKey;
  } catch (error) {
    console.error('Erro ao obter a API Key:', error.message);
    apiKey = null;
    return null;
  }
}

async function fetchConnectors() {
  if (!apiKey) {
    console.log('API Key não disponível, tentando obter uma nova...');
    await getApiKey();
    if (!apiKey) {
      console.error('Não foi possível buscar os conectores porque a API Key não está disponível.');
      return [];
    }
  }

  try {
    console.log('Buscando conectores...');
    const response = await axios.get(`${PLUGGY_HOST}/connectors`, {
      headers: {
        'X-API-KEY': apiKey,
      },
    });

    const allConnectors = response.data.results;
    const misterConnectorIds = Object.keys(misterConnectors);

    const filteredConnectors = allConnectors.filter(connector =>
      misterConnectorIds.includes(String(connector.id))
    );

    const connectors = filteredConnectors.map(connector => {
      const misterConnectorName = misterConnectors[connector.id];
      const isOF = misterConnectorName.includes('[OF]');
      return {
        id: connector.id,
        name: misterConnectorName.replace(' [OF]', ''),
        type: isOF ? 'OpenFinance' : 'Direct',
        imageUrl: connector.imageUrl,
        health: connector.health,
      };
    });

    connectorsCache = connectors;
    lastFetch = Date.now();
    console.log('Conectores atualizados com sucesso.');
    return connectors;

  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('API Key expirada ou inválida. Solicitando uma nova.');
      await getApiKey();
      if (apiKey) {
        return await fetchConnectors();
      }
    } else {
      console.error('Erro ao buscar conectores:', error.message);
    }
    return connectorsCache; // Retorna cache em caso de erro
  }
}

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

  try {
    // Verifica se precisa buscar dados (cache de 5 minutos)
    const now = Date.now();
    if (now - lastFetch > CACHE_DURATION || connectorsCache.length === 0) {
      const connectors = await fetchConnectors();
      return res.json(connectors);
    } else {
      return res.json(connectorsCache);
    }
  } catch (error) {
    console.error('Erro na API:', error.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};