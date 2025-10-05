// 1. Import necessary tools
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

// 2. Setup the Express app
const app = express();
const port = 3000;
const API_DOMAIN = 'https://api.defapi.org';

// 3. Apply Middleware
app.use(cors());
app.use(express.json());

// 4. Securely get the API key
const apiKey = process.env.SORA_API_KEY;

// 5. Endpoint for starting the generation task
app.post('/generate', async (req, res) => {
    // ... (this endpoint has not changed)
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

// 6. Endpoint for checking the task status
app.get('/task/:taskId', async (req, res) => {
    // ... (this endpoint has not changed)
    if (!apiKey) return res.status(500).json({ error: 'Server is missing API key.' });
    const { taskId } = req.params;
    console.log(`Checking status for task: ${taskId}`);
    try {
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

// 7. *** NEW: The Video Proxy Endpoint ***
app.get('/video-proxy', async (req, res) => {
    try {
        const videoUrl = req.query.url;
        if (!videoUrl) {
            return res.status(400).send('No video URL provided.');
        }

        console.log(`Proxying video from: ${videoUrl}`);

        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            return res.status(videoResponse.status).send('Failed to fetch video.');
        }
        
        // Forward the content type header from the video source
        res.setHeader('Content-Type', videoResponse.headers.get('content-type'));
        
        // Stream the video body directly to the client
        videoResponse.body.pipe(res);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Error proxying video.');
    }
});

// 8. Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});