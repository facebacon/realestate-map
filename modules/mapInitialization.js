const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZmFjZWJhY29uIiwiYSI6ImNtMWY5b2h0NjFvNHcyanBwbmdmaWg3dGoifQ.ajSCyznbREZXIu7qZAEkDw';
const INITIAL_CENTER = [-80.2102, 25.7617]; // Miami coordinates
const INITIAL_ZOOM = 9;

export function initializeMap(container = 'map') {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    
    const map = new mapboxgl.Map({
        container: container,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM
    });

    // Add navigation controls (zoom in/out, compass)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl());

    // Add scale control
    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'imperial'
    }));

    return map;
}

export function toggleMapStyle(map) {
    const currentStyle = map.getStyle().sprite;
    const newStyle = currentStyle.includes('streets') 
        ? 'mapbox://styles/mapbox/satellite-v9'
        : 'mapbox://styles/mapbox/streets-v11';
    
    map.setStyle(newStyle);
}

export function flyToLocation(map, center, zoom, duration = 2000) {
    map.flyTo({
        center: center,
        zoom: zoom,
        duration: duration
    });
}