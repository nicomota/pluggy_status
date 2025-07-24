require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const http = require('http');
const WebSocket = require('ws');
const misterConnectors = require('./conectorsMister.js');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

const port = process.env.PORT || 3001;

let connectors = [];
let lastUpdated = null;
let apiKey = null;

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
  } catch (error) {
    console.error('Erro ao obter a API Key:', error.message);
    apiKey = null;
  }
}

async function fetchConnectors() {
  if (!apiKey) {
    console.log('API Key não disponível, tentando obter uma nova...');
    await getApiKey();
    if (!apiKey) {
      console.error('Não foi possível buscar os conectores porque a API Key não está disponível.');
      return;
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

    connectors = filteredConnectors.map(connector => {
      const misterConnectorName = misterConnectors[connector.id];
      const isOF = misterConnectorName.includes('[OF]');
      return {
        id: connector.id,
        name: connector.name.replace(' [OF]', ''),
        type: isOF ? 'OpenFinance' : 'Direct',
        imageUrl: connector.imageUrl,
        health: connector.health,
      };
    });
    lastUpdated = new Date();
    console.log('Conectores atualizados com sucesso.');
    
    // Broadcast the update to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'update', data: connectors }));
      }
    });

  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('API Key expirada ou inválida. Solicitando uma nova.');
      await getApiKey();
      if (apiKey) {
        await fetchConnectors();
      }
    } else {
      console.error('Erro ao buscar conectores:', error.message);
    }
  }
}

// Schedule to run every 5 minutes
cron.schedule('*/5 * * * *', fetchConnectors);

app.get('/status', (req, res) => {
  res.json({
    lastUpdated,
    connectorsCount: connectors.length,
  });
});

app.get('/connectors', (req, res) => {
  res.json(connectors);
});

wss.on('connection', ws => {
  console.log('Cliente conectado');
  // Send the current list of connectors to the new client
  ws.send(JSON.stringify({ type: 'initial', data: connectors }));
  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(port, async () => {
  console.log(`Servidor rodando na porta ${port}`);
  await getApiKey();
  await fetchConnectors();
});