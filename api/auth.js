import axios from "axios";

export default async function handler(req, res) {
  try {
    const response = await axios.post(`${process.env.host}/auth`, {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });

    res.status(200).json({ apiKey: response.data.apiKey });
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter API Key", details: error.message });
  }
}
