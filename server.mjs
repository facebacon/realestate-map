import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Proxy endpoint
app.get('/proxy', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send('URL parameter is required');
    }
    try {
        const response = await fetch(url);
        const data = await response.text();
        res.send(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Error fetching data');
    }
});

// API endpoint to fetch property data
app.get('/api/property', async (req, res) => {
    const { lat, lng } = req.query;
    console.log('Received lat:', lat, 'lng:', lng); // Add this line for debugging
    if (!lat || !lng) {
        console.error('Missing lat or lng parameter');
        return res.status(400).json({ error: 'Missing lat or lng parameter' });
    }

    try {
        // Fetch property data based on lat and lng
        const propertyData = await fetchPropertyData(lat, lng);
        res.json(propertyData);
    } catch (error) {
        console.error('Error fetching property data:', error);
        res.status(500).json({ error: 'Failed to fetch property data' });
    }
});

async function fetchPropertyData(lat, lng) {
    // Implement your logic to fetch property data based on lat and lng
    // This is just a placeholder implementation
    return {
        lat,
        lng,
        properties: [
            { id: 1, name: 'Property 1', lat, lng },
            { id: 2, name: 'Property 2', lat, lng }
        ]
    };
}

// API endpoint to fetch Walk Score
app.get('/api/walkscore', async (req, res) => {
    const { lat, lon, address } = req.query;
    const apiKey = process.env.WALKSCORE_API_KEY;

    // Validate latitude and longitude
    if (!isValidCoordinate(parseFloat(lat), parseFloat(lon))) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    const url = `https://api.walkscore.com/score?format=json&address=${encodeURIComponent(address)}&lat=${lat}&lon=${lon}&wsapikey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching Walk Score:', error);
        res.status(500).json({ error: 'Failed to fetch Walk Score', details: error.message });
    }
});

function isValidCoordinate(lat, lon) {
    return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// API endpoint to fetch Mapbox token
app.get('/api/mapbox-token', (req, res) => {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    console.log('MAPBOX_ACCESS_TOKEN:', token); // For debugging

    if (!token) {
        console.error('MAPBOX_ACCESS_TOKEN is not set in environment variables');
        return res.status(500).json({ error: 'Mapbox token not configured' });
    }

    res.json({ token });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});