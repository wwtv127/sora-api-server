// 1. Import necessary tools
const express = require('express');
// CRITICAL FIX: This dynamic import correctly loads node-fetch to prevent errors.
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

// 2. Setup the Express app
const app = express();
const port = 3000;
const API_BASE_URL = 'https://api.defapi.org/api/sora2';

// 3. Apply Middleware
app.use(cors());
app.use(express.json());

// 4. Securely get the API key from an environment variable
const apiKey = process.env.SORA_API_KEY;

// 5. Endpoint for starting the generation task
app.post('/generate', async (req, res) => {
    if (!apiKey) {
        return res.status(500).json({ error: 'Server is missing API key.' });
    }
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'No prompt provided.' });
    }
    console.log(`Received prompt: "${prompt}"`);
    try {
        const apiResponse = await fetch(`${API_BASE_URL}/gen`, {
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

// 6. NEW: Endpoint for checking the task status
app.get('/status/:taskId', async (req, res) => {
    if (!apiKey) {
        return res.status(500).json({ error: 'Server is missing API key.' });
    }
    const { taskId } = req.params;
    console.log(`Checking status for task: ${taskId}`);
    try {
        const apiResponse = await fetch(`${API_BASE_URL}/task?task_id=${taskId}`, {
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