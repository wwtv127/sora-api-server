// 1. Import necessary tools
const express = require('express');
// The line below is the ONLY change. This dynamic import correctly loads node-fetch.
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

// 2. Setup the Express app
const app = express();
const port = 3000;

// 3. Apply Middleware
app.use(cors());
app.use(express.json());

// 4. Securely get the API key from an environment variable
const apiKey = process.env.SORA_API_KEY;

// 5. Create an "endpoint" to handle requests
app.post('/generate', async (req, res) => {
    if (!apiKey) {
        return res.status(500).json({ error: 'Server is missing API key. Make sure you ran the export command.' });
    }

    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'No prompt provided.' });
    }
    console.log(`Received prompt from frontend: "${prompt}"`);

    try {
        const apiUrl = 'https://api.defapi.org/api/sora2/gen';
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ prompt: prompt })
        });
        const data = await apiResponse.json();
        if (!apiResponse.ok) {
            res.status(apiResponse.status).json(data);
        } else {
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('Waiting for requests from the HTML page...');
});