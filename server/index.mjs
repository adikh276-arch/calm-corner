import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.warn('Warning: GOOGLE_API_KEY not set — translation proxy will fail until .env is configured');
}

app.post('/translate', async (req, res) => {
    try {
        const { q, target, source } = req.body;
        if (!q || !target) return res.status(400).json({ error: 'Missing q or target in body' });

        const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
        const body = { q, target };
        if (source) body.source = source;

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const json = await resp.json();
        if (json.error) return res.status(500).json({ error: json.error });

        // Return the translated text array
        res.json(json.data || json);
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Translation proxy listening on http://localhost:${PORT}`));
