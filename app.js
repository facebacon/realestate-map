import { initializeMap, toggleMapStyle, flyToLocation } from './modules/mapInitialization.js';
import { 
    addLayers, 
    removeDataFromMap, 
    displayDataOnMap, 
    restoreLayerVisibility, 
    layers 
} from './modules/layerManagement.js';
import { geocode } from './api/geocoding.js';
import { createLegend } from './modules/legendManagement.js';
import { setupLayerToggleMenu } from './modules/layerToggleMenu.js';
import { setupPopupMenu } from './modules/popupMenu.js';
import { searchAddress } from './modules/search.js';
// Instead, declare map as a global variable
let map;

const floodZoneColors = {
    'AE': '#1E90FF', // Dodger Blue
    'X': '#32CD32',  // Lime Green
    'AH': '#FF69B4', // Hot Pink
    'VE': '#FF4500', // Orange Red
    'A': '#FFD700',  // Gold
    'AO': '#20B2AA', // Light Sea Green
    'OPEN WATER': '#4682B4' // Steel Blue
};

const floodZoneLegendData = {
    'AE': '1% Annual Chance Flood Hazard',
    'X': 'Area of Minimal Flood Hazard',
    'AH': 'Flood Depths of 1-3 feet',
    'VE': 'Coastal High Hazard Area',
    'A': '1% Annual Chance Flood Hazard (No BFE)',
    'AO': 'River or Stream Flood Hazard',
    'OPEN WATER': 'Open Water'
};

// Add a button for toggling the basemap
const basemapToggle = document.createElement('button');
basemapToggle.id = 'basemap-toggle';
basemapToggle.textContent = 'Toggle Basemap';
basemapToggle.style.margin = '10px';
document.getElementById('menu').appendChild(basemapToggle);

let isSatellite = false;
let googleSheetData = null; // Add this line at the top of your file to store the Google Sheets data

basemapToggle.addEventListener('click', handleBasemapToggle);

let colorMap, countyColorMap; // Declare these variables at the top level

// Modify the Promise.all block
Promise.all([
    fetch('/data/Municipal_Zone_Pivot.csv').then(response => response.text()),
    fetch('/data/color_map.json').then(response => response.json()),
    fetch('/data/legend_data.json').then(response => response.json()),
    fetch('/data/county_color_map.json').then(response => response.json())
])
.then(([csvData, colorMapData, legendData, countyColorMapData]) => {
    colorMap = colorMapData;
    countyColorMap = countyColorMapData;

    console.log('Color Map:', colorMap);
    console.log('Sample color map entries:', Object.entries(colorMap).slice(0, 10));
    console.log('County Color Map:', countyColorMap);
    console.log('Sample county color map entries:', Object.entries(countyColorMap).slice(0, 10));

    // Initialize the map here
    map = initializeMap('map');

    map.on('load', () => {
        addLayers(map, floodZoneColors, colorMap, countyColorMap);
        
        // Use the createLegend function from legendManagement.js
        const { floodplainDetails, municipalZoningDetails, countyZoningDetails } = createLegend(map, legendData, floodZoneLegendData, floodZoneColors, colorMap, countyColorMap);
        
        setupLayerToggleMenu(map, layers, floodplainDetails, municipalZoningDetails, countyZoningDetails);

        // Use the new setupPopupMenu function
        setupPopupMenu(map);

        // Declare a variable to hold the current popup
        let currentPopup = null;

        // Update this function to fetch only the basic Walk Score
        async function getWalkScore(lat, lng, address) {
            if (!isValidCoordinate(lat, lng)) {
                console.error('Invalid coordinates:', lat, lng);
                return null;
            }

            const url = `/api/walkscore?lat=${lat}&lon=${lng}&address=${encodeURIComponent(address)}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching Walk Score:', error);
                return null;
            }
        }

        // Add this function at the top level of your app.js file, outside of any callbacks
        function isValidCoordinate(lat, lng) {
            return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        }

        // Update this function to render only the basic Walk Score
        function renderWalkScore(walkScoreData) {
            if (!walkScoreData || !walkScoreData.walkscore) {
                return '<p>Walk Score not available</p>';
            }

            return `
                <div class="walk-score">
                    <h4>Walk Score: ${walkScoreData.walkscore}</h4>
                    <p>${walkScoreData.description}</p>
                    <p><a href="${walkScoreData.ws_link}" target="_blank">More info</a></p>
                </div>
            `;
        }

        // Add search functionality
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');

        searchButton.addEventListener('click', () => {
            const address = searchInput.value.trim();
            if (address) {
                searchAddress(address, map);
            }
        });

        // Add this event listener for the Enter key in the search input
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const address = e.target.value;
                if (address) {
                    searchAddress(address, map);
                } else {
                    alert('Please enter an address to search.');
                }
            }
        });

        map.on('zoomend', () => {
            if (map.getZoom() >= 14) {
                fetchDataAndDisplay();
            } else {
                removeDataFromMap(map);
            }
        });

        // Fetch and add Google Sheet data
        fetchGoogleSheetData();

        // Change cursor to pointer when hovering over a property
        map.on('mouseenter', 'google-sheet-properties', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'google-sheet-properties', () => {
            map.getCanvas().style.cursor = '';
        });
    });
})
.catch(error => console.error('Error loading data:', error));

// Remove the local searchAddress function
// async function searchAddress(address) {
//     try {
//         const result = await geocode(address + ', Miami, FL');
//         if (result && result.features && result.features.length > 0) {
//             const [lng, lat] = result.features[0].center;
//             const place = result.features[0].place_name;
            
//             if (!place.toLowerCase().includes('miami')) {
//                 throw new Error('Address not found in Miami');
//             }
            
//             map.flyTo({ center: [lng, lat], zoom: 16 });
            
//             if (window.searchMarker) {
//                 window.searchMarker.remove();
//             }
            
//             window.searchMarker = new mapboxgl.Marker()
//                 .setLngLat([lng, lat])
//                 .addTo(map);

//             const response = await fetch(`/api/property?lat=${lat}&lng=${lng}`);
//             const data = await response.json();
//             displayDataOnMap(map, data);
//         } else {
//             throw new Error('No results found');
//         }
//     } catch (error) {
//         console.error('Error in search:', error);
//         alert('Address not found in Miami or error in search. Please try again.');
//     }
// }

function fetchDataAndDisplay() {
    const bounds = map.getBounds();
    const url = `https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/PaGISView_gdb/FeatureServer/0/query?outFields=*&geometry=${bounds.toArray().join(',')}&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&where=1%3D1&f=geojson`;
    
    fetch(`/proxy?url=${encodeURIComponent(url)}`)
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                displayDataOnMap(map, data);
            } catch (error) {
                console.error('Error parsing data:', error);
                removeDataFromMap(map);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            removeDataFromMap(map);
        });
}

// Keep this helper function
function isValidGeoJSON(data) {
    return data && data.type === 'FeatureCollection' && Array.isArray(data.features);
}



function handleBasemapToggle() {
    if (map.getSource('google-sheet-data')) {
        googleSheetData = map.getSource('google-sheet-data')._data;
    }
    
    toggleMapStyle(map);
    isSatellite = !isSatellite;

    map.once('style.load', readdLayers);
}

function readdLayers() {
    addLayers(map, floodZoneColors, colorMap, countyColorMap);
    if (googleSheetData) {
        addGoogleSheetDataLayer(map, googleSheetData);
    }
    restoreLayerVisibility(map);
    setupPopupMenu(map);
}

function initializeStreetView(coordinates, panoElement) {
    console.log('Initializing Street View for coordinates:', coordinates);
    console.log('Pano element:', panoElement);

    if (!window.google || !window.google.maps) {
        console.error('Google Maps API not loaded');
        panoElement.innerHTML = 'Google Maps API not loaded';
        return;
    }

    const streetViewService = new google.maps.StreetViewService();
    const STREETVIEW_MAX_DISTANCE = 50;

    streetViewService.getPanorama(
        { location: { lat: coordinates[1], lng: coordinates[0] }, radius: STREETVIEW_MAX_DISTANCE },
        (data, status) => {
            console.log('Street View service status:', status);
            if (status === google.maps.StreetViewStatus.OK) {
                console.log('Street View data:', data);
                const panorama = new google.maps.StreetViewPanorama(panoElement, {
                    position: { lat: coordinates[1], lng: coordinates[0] },
                    pov: { heading: 165, pitch: 0 },
                    zoom: 1
                });
                console.log('Panorama created:', panorama);
            } else {
                console.warn('Street View data not found for this location.');
                panoElement.innerHTML = 'Street View not available for this location.';
            }
        }
    );
}

function formatValue(key, value) {
    if (value === null || value === undefined) return 'N/A';
    
    if (typeof value === 'number') {
        if (key.toLowerCase().includes('price') || key.toLowerCase().includes('value')) {
            return `$${value.toLocaleString()}`;
        }
        if (key.toLowerCase().includes('sqft') || key.toLowerCase().includes('size')) {
            return `${value.toLocaleString()} sq ft`;
        }
        return value.toLocaleString();
    }
    if (key.toLowerCase().includes('date')) {
        return new Date(value).toLocaleDateString();
    }
    return value;
}