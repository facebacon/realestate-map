let MAPBOX_ACCESS_TOKEN = null;

async function getMapboxToken() {
    if (MAPBOX_ACCESS_TOKEN) return MAPBOX_ACCESS_TOKEN;
    const response = await fetch('/api/mapbox-token');
    const data = await response.json();
    MAPBOX_ACCESS_TOKEN = data.token;
    return MAPBOX_ACCESS_TOKEN;
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
        const response = await fetch(`${endpoint}?${params}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error during geocoding:', error);
        throw error;
    }
}