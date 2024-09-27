let MAPBOX_ACCESS_TOKEN = null;

async function getMapboxToken() {
    if (MAPBOX_ACCESS_TOKEN) return MAPBOX_ACCESS_TOKEN;
    try {
        const response = await fetch('/api/mapbox-token');
        console.log('Response from /api/mapbox-token:', response); // Add this line
        if (!response.ok) {
            throw new Error(`Failed to fetch Mapbox token: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Data from /api/mapbox-token:', data); // Add this line
        if (!data.token) {
            throw new Error('Mapbox token not found in response');
        }
        MAPBOX_ACCESS_TOKEN = data.token;
        return MAPBOX_ACCESS_TOKEN;
    } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        throw error;
    }
}

export async function geocode(address) {
    const token = await getMapboxToken();
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
    const params = new URLSearchParams({
        access_token: token,
        limit: 1,
        country: 'US',
        types: 'address'
    });

    try {
        console.log(`Geocoding address: ${address}`); // Add this line
        const response = await fetch(`${endpoint}?${params}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Geocoding data:', data); // Add this line
        return data;
    } catch (error) {
        console.error('Error during geocoding:', error);
        throw error;
    }
}