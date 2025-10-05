// 1. Import necessary tools
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

// 2. Setup the Express app
const app = express();
const port = 3000;
// NOTE: The base URL for the API is just the domain, as the endpoints are different.
const API_DOMAIN = 'https://api.defapi.org';

// 3. Apply Middleware
app.use(cors());
app.use(express.json());

// 4. Securely get the API key from an environment variable
const apiKey = process.env.SORA_API_KEY;

// 5. Endpoint for starting the generation task
app.post('/generate', async (req, res) => {
    if (!apiKey) return res.status(500).json({ error: 'Server is missing API key.' });
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'No prompt provided.' });
    console.log(`Received prompt: "${prompt}"`);
    try {
        const apiResponse = await fetch(`${API_DOMAIN}/api/sora2/gen`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ prompt })
        });
        const data = await apiResponse.json();
        res.status(apiResponse.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Corrected endpoint for checking the task status
app.get('/task/:taskId', async (req, res) => {
    if (!apiKey) return res.status(500).json({ error: 'Server is missing API key.' });
    const { taskId } = req.params;
    console.log(`Checking status for task: ${taskId}`);
    try {
        // *** THE DEFINITIVE FIX ***
        // This now uses the correct /api/task/query endpoint from your documentation.
        const apiResponse = await fetch(`${API_DOMAIN}/api/task/query?task_id=${taskId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${apiKey}` }
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