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

// 5. Endpoint for starting the generation task (Unchanged)
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

// 6. Endpoint for checking the task status (Unchanged)
app.get('/task/:taskId', async (req, res) => {
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

// 7. *** THE UPGRADED VIDEO PROXY ***
app.get('/video-proxy', async (req, res) => {
    try {
        const videoUrl = req.query.url;
        if (!videoUrl) {
            return res.status(400).send('No video URL provided.');
        }

        console.log(`Proxying video from: ${videoUrl}`);

        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            return res.status(videoResponse.status).send('Failed to fetch video from source.');
        }
        
        // Forward essential headers from the video source to the client.
        // This gives the browser the information it needs to play the video.
        res.writeHead(videoResponse.status, {
            'Content-Type': videoResponse.headers.get('content-type'),
            'Content-Length': videoResponse.headers.get('content-length'),
            'Accept-Ranges': videoResponse.headers.get('accept-ranges'),
            'Content-Range': videoResponse.headers.get('content-range'),
        });
        
        // Stream the video body directly to the client.
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