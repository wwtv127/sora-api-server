// 1. Import necessary tools
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

// 2. Setup the Express app
const app = express();
const port = 3000;
const API_DOMAIN = 'https://api.muapi.ai/api/v1';

// 3. Apply Middleware
app.use(cors());
app.use(express.json());

// 4. Securely get the new API key from an environment variable
// IMPORTANT: The key name has changed to match your script.
const apiKey = process.env.MUAPIAPP_API_KEY;

// 5. Endpoint for submitting the video generation task to the new API
app.post('/generate', async (req, res) => {
    if (!apiKey) return res.status(500).json({ error: 'Server is missing MUAPIAPP_API_KEY.' });
    
    // Get the new parameters from the frontend
    const { prompt, resolution, aspect_ratio } = req.body;
    if (!prompt) return res.status(400).json({ error: 'No prompt provided.' });

    console.log(`Received new prompt: "${prompt}"`);
    try {
        const apiResponse = await fetch(`${API_DOMAIN}/openai-sora-2-text-to-video`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey // Use the new header key
            },
            body: JSON.stringify({ prompt, resolution, aspect_ratio })
        });
        const data = await apiResponse.json();
        res.status(apiResponse.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Endpoint for polling the result from the new API
app.get('/task/:requestId', async (req, res) => {
    if (!apiKey) return res.status(500).json({ error: 'Server is missing MUAPIAPP_API_KEY.' });
    
    const { requestId } = req.params;
    console.log(`Checking status for request_id: ${requestId}`);
    try {
        const apiResponse = await fetch(`${API_DOMAIN}/predictions/${requestId}/result`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey }
        });
        const data = await apiResponse.json();
        res.status(apiResponse.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});