import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';

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

// Serve static build if available (helps when running in the container)
const STATIC_DIR = process.env.STATIC_DIR || path.resolve(process.cwd(), 'dist');
try {
    app.use(express.static(STATIC_DIR));
    app.get('*', (req, res, next) => {
        // only handle non-API requests
        if (req.path.startsWith('/translate')) return next();
        res.sendFile(path.join(STATIC_DIR, 'index.html'));
    });
} catch (e) {
    // no-op if dist missing
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on http://0.0.0.0:${PORT} (static: ${STATIC_DIR})`));
