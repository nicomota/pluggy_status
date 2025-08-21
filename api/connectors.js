import axios from "axios";

let apiKey = null;

async function getApiKey() {
  const response = await axios.post(`${process.env.host}/auth`, {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
  apiKey = response.data.apiKey;
}

export default async function handler(req, res) {
  try {
    if (!apiKey) {
      await getApiKey();
    }

    const response = await axios.get(`${process.env.host}/connectors`, {
      headers: {
        "X-API-KEY": apiKey,
      },
    });

    res.status(200).json(response.data.results);
  } catch (error) {
    if (error.response?.status === 401) {
      // token expirado, pega outro
      await getApiKey();
      return handler(req, res);
    }
    res.status(500).json({ error: "Erro ao buscar conectores", details: error.message });
  }
}
