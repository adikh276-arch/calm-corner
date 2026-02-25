import fetch from 'node-fetch';

(async () => {
    try {
        const resp = await fetch('http://localhost:3001/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: 'Hello world', target: 'fr' }),
        });
        const json = await resp.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (err) {
        console.error('Test request failed:', err);
    }
})();
