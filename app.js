import { createFloodplainLayer } from './layers/floodplainLayer.js';
import { createMunicipalZoneLayer, municipalZoneOutline } from './layers/municipalZoneLayer.js';
import { createCountyZoneLayer, countyZoneOutline } from './layers/countyZoneLayer.js';
import { geocode } from './api/geocoding.js';

mapboxgl.accessToken = 'pk.eyJ1IjoiZmFjZWJhY29uIiwiYSI6ImNtMWY5b2h0NjFvNHcyanBwbmdmaWg3dGoifQ.ajSCyznbREZXIu7qZAEkDw';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-80.2102, 25.7617], // Miami coordinates
    zoom: 9 // Adjust this value to get the desired view of South Florida
});

const layers = [
    { id: 'floodplain-layer', name: 'Floodplain', source: 'floodplain' },
    { id: 'municipal-zone-layer', name: 'Municipal Zoning', source: 'municipal-zone' },
    { id: 'county-zone-layer', name: 'County Zoning', source: 'county-zone' }
];

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
    colorMap = colorMapData; // Assign to the top-level variable
    countyColorMap = countyColorMapData; // Assign to the top-level variable

    console.log('Color Map:', colorMap);
    console.log('Sample color map entries:', Object.entries(colorMap).slice(0, 10));
    console.log('County Color Map:', countyColorMap);
    console.log('Sample county color map entries:', Object.entries(countyColorMap).slice(0, 10));

    map.on('load', () => {
        addLayers(map);

        // Create legend
        const legendContainer = document.createElement('div');
        legendContainer.id = 'legend';

        // Create floodplain legend
        const floodplainDetails = document.createElement('details');
        const floodplainSummary = document.createElement('summary');
        floodplainSummary.textContent = 'Floodplain';
        floodplainSummary.style.fontWeight = 'bold';
        floodplainSummary.style.cursor = 'pointer';
        floodplainDetails.appendChild(floodplainSummary);

        Object.entries(floodZoneLegendData).forEach(([zone, description]) => {
            const zoneDiv = document.createElement('div');
            zoneDiv.style.marginLeft = '10px';
            zoneDiv.style.display = 'flex';
            zoneDiv.style.alignItems = 'center';
            zoneDiv.style.marginBottom = '2px';

            const colorSample = document.createElement('span');
            colorSample.style.display = 'inline-block';
            colorSample.style.width = '12px';
            colorSample.style.height = '12px';
            colorSample.style.backgroundColor = floodZoneColors[zone];
            colorSample.style.marginRight = '5px';
            colorSample.style.border = '1px solid #000';

            zoneDiv.appendChild(colorSample);
            zoneDiv.appendChild(document.createTextNode(`${zone}: ${description}`));
            floodplainDetails.appendChild(zoneDiv);
        });

        legendContainer.appendChild(floodplainDetails);

        // Create municipal zoning legend
        const municipalZoningDetails = document.createElement('details');
        const municipalZoningSummary = document.createElement('summary');
        municipalZoningSummary.textContent = 'Municipal Zoning';
        municipalZoningSummary.style.fontWeight = 'bold';
        municipalZoningSummary.style.cursor = 'pointer';
        municipalZoningDetails.appendChild(municipalZoningSummary);

        Object.entries(legendData).forEach(([municipality, zones]) => {
            const municipalityDetails = document.createElement('details');
            const municipalitySummary = document.createElement('summary');
            municipalitySummary.textContent = municipality;
            municipalitySummary.style.fontWeight = 'bold';
            municipalitySummary.style.cursor = 'pointer';

            municipalityDetails.appendChild(municipalitySummary);

            Object.entries(zones).forEach(([zone, zoneCodes]) => {
                const zoneDiv = document.createElement('div');
                zoneDiv.style.marginLeft = '10px';
                zoneDiv.style.display = 'flex';
                zoneDiv.style.alignItems = 'center';
                zoneDiv.style.marginBottom = '2px';

                const colorSample = document.createElement('span');
                colorSample.style.display = 'inline-block';
                colorSample.style.width = '12px';
                colorSample.style.height = '12px';
                colorSample.style.backgroundColor = colorMap[zoneCodes[0]] || '#CCCCCC';
                colorSample.style.marginRight = '5px';
                colorSample.style.border = '1px solid #000';

                zoneDiv.appendChild(colorSample);
                zoneDiv.appendChild(document.createTextNode(`${zone}: ${zoneCodes.join(', ')}`));
                municipalityDetails.appendChild(zoneDiv);
            });

            municipalZoningDetails.appendChild(municipalityDetails);
        });

        legendContainer.appendChild(municipalZoningDetails);

        // Create county zoning legend
        const countyZoningDetails = document.createElement('details');
        const countyZoningSummary = document.createElement('summary');
        countyZoningSummary.textContent = 'County Zoning';
        countyZoningSummary.style.fontWeight = 'bold';
        countyZoningSummary.style.cursor = 'pointer';
        countyZoningDetails.appendChild(countyZoningSummary);

        Object.entries(countyColorMap).forEach(([zone, color]) => {
            if (zone !== 'NONE') {
                const zoneDiv = document.createElement('div');
                zoneDiv.style.marginLeft = '10px';
                zoneDiv.style.display = 'flex';
                zoneDiv.style.alignItems = 'center';
                zoneDiv.style.marginBottom = '2px';

                const colorSample = document.createElement('span');
                colorSample.style.display = 'inline-block';
                colorSample.style.width = '12px';
                colorSample.style.height = '12px';
                colorSample.style.backgroundColor = color;
                colorSample.style.marginRight = '5px';
                colorSample.style.border = '1px solid #000';

                zoneDiv.appendChild(colorSample);
                zoneDiv.appendChild(document.createTextNode(zone));
                countyZoningDetails.appendChild(zoneDiv);
            }
        });

        legendContainer.appendChild(countyZoningDetails);

        document.body.appendChild(legendContainer);

        // Layer toggle menu
        layers.forEach(layer => {
            const item = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = layer.id;
            checkbox.checked = true;

            const label = document.createElement('label');
            label.setAttribute('for', layer.id);
            label.textContent = layer.name;

            const opacitySlider = document.createElement('input');
            opacitySlider.type = 'range';
            opacitySlider.min = '0';
            opacitySlider.max = '1';
            opacitySlider.step = '0.1';
            opacitySlider.value = '0.7';
            opacitySlider.style.marginLeft = '10px';

            checkbox.addEventListener('change', (e) => {
                const visibility = e.target.checked ? 'visible' : 'none';
                map.setLayoutProperty(layer.id, 'visibility', visibility);

                if (layer.id === 'municipal-zone-layer') {
                    map.setLayoutProperty('municipality-outline', 'visibility', visibility);
                }

                if (layer.id === 'county-zone-layer') {
                    map.setLayoutProperty('county-zone-outline', 'visibility', visibility);
                }

                // Update legend visibility
                if (layer.id === 'municipal-zone-layer') {
                    municipalZoningDetails.style.display = visibility === 'visible' ? 'block' : 'none';
                }
                if (layer.id === 'county-zone-layer') {
                    countyZoningDetails.style.display = visibility === 'visible' ? 'block' : 'none';
                }
                if (layer.id === 'floodplain-layer') {
                    floodplainDetails.style.display = visibility === 'visible' ? 'block' : 'none';
                }
            });

            opacitySlider.addEventListener('input', (e) => {
                map.setPaintProperty(layer.id, 'fill-opacity', parseFloat(e.target.value));
            });

            item.appendChild(checkbox);
            item.appendChild(label);
            item.appendChild(opacitySlider);
            document.getElementById('menu').appendChild(item);
        });

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

        // Add this function to set up the click event listener for popups
        function addClickEventForPopups() {
            map.on('click', (e) => {
                let features = [];
                let propertyFeature = null;
                
                // Check if each layer exists before querying it
                if (map.getLayer('property-layer')) {
                    const propertyFeatures = map.queryRenderedFeatures(e.point, { layers: ['property-layer'] });
                    if (propertyFeatures.length > 0) {
                        propertyFeature = propertyFeatures[0];
                        features.push(propertyFeature);
                    }
                }
                
                if (map.getLayer('google-sheet-properties')) {
                    const sheetFeatures = map.queryRenderedFeatures(e.point, { layers: ['google-sheet-properties'] });
                    if (sheetFeatures.length > 0 && !propertyFeature) {
                        propertyFeature = sheetFeatures[0];
                        features.push(propertyFeature);
                    }
                }

                // Only proceed if we clicked on a property
                if (propertyFeature) {
                    // Query other layers
                    let municipalZoneFeature = null;
                    let countyZoneFeature = null;
                    let floodplainFeature = null;

                    if (map.getLayer('municipal-zone-layer')) {
                        const municipalFeatures = map.queryRenderedFeatures(e.point, { layers: ['municipal-zone-layer'] });
                        if (municipalFeatures.length > 0) {
                            municipalZoneFeature = municipalFeatures[0];
                        }
                    }
                    if (map.getLayer('county-zone-layer')) {
                        const countyFeatures = map.queryRenderedFeatures(e.point, { layers: ['county-zone-layer'] });
                        if (countyFeatures.length > 0) {
                            countyZoneFeature = countyFeatures[0];
                        }
                    }
                    if (map.getLayer('floodplain-layer')) {
                        const floodplainFeatures = map.queryRenderedFeatures(e.point, { layers: ['floodplain-layer'] });
                        if (floodplainFeatures.length > 0) {
                            floodplainFeature = floodplainFeatures[0];
                        }
                    }

                    // Generate popup content
                    let popupContent = '<div class="popup-content">';
                    popupContent += generatePropertyInfo(propertyFeature.properties);
                    
                    // Zoning information
                    if (municipalZoneFeature) {
                        popupContent += generateMunicipalZoneInfo(municipalZoneFeature.properties);
                    } else if (countyZoneFeature) {
                        popupContent += generateCountyZoneInfo(countyZoneFeature.properties);
                    } else {
                        popupContent += '<div class="popup-section"><h4>Zoning Information</h4><p>No zoning information available for this location.</p></div>';
                    }
                    
                    // Flood Zone information
                    popupContent += generateFloodZoneInfo(floodplainFeature ? floodplainFeature.properties : {});
                    
                    popupContent += '<div id="pano" style="width: 100%; height: 200px;"></div>';
                    popupContent += '<div id="walk-score"></div>';
                    popupContent += '</div>';

                    // Get coordinates from the property feature
                    const coordinates = propertyFeature.geometry.type === 'Point' 
                        ? propertyFeature.geometry.coordinates.slice()
                        : e.lngLat;

                    // Create and display the popup
                    if (window.currentPopup) {
                        window.currentPopup.remove();
                    }

                    window.currentPopup = new mapboxgl.Popup({
                        maxWidth: '500px',
                        className: 'custom-popup'
                    })
                        .setLngLat(coordinates)
                        .setHTML(popupContent)
                        .addTo(map);

                    // Use MutationObserver to detect when the popup content is added to the DOM
                    const observer = new MutationObserver((mutations, obs) => {
                        const panoElement = document.getElementById('pano');
                        if (panoElement) {
                            obs.disconnect();
                            setTimeout(() => {
                                initializeStreetView(coordinates, panoElement);
                            }, 100);
                        }
                    });

                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });

                    // Fetch and display Walk Score
                    const lat = coordinates[1];
                    const lng = coordinates[0];
                    const address = propertyFeature.properties.TRUE_SITE_ADDR || '';
                    getWalkScore(lat, lng, address).then(walkScoreData => {
                        const walkScoreContent = renderWalkScore(walkScoreData);
                        const walkScoreElement = document.getElementById('walk-score');
                        if (walkScoreElement) {
                            walkScoreElement.innerHTML = walkScoreContent;
                        }
                    });
                }
            });
        }

        addClickEventForPopups();

        // Add search functionality
        document.getElementById('search-button').addEventListener('click', () => {
            const address = document.getElementById('search-input').value;
            if (address) {
                searchAddress(address);
            } else {
                alert('Please enter an address to search.');
            }
        });

        // Add this event listener for the Enter key in the search input
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const address = e.target.value;
                if (address) {
                    searchAddress(address);
                } else {
                    alert('Please enter an address to search.');
                }
            }
        });

        map.on('zoomend', () => {
            if (map.getZoom() >= 14) {
                fetchDataAndDisplay();
            } else {
                removeDataFromMap();
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

async function searchAddress(address) {
    try {
        const result = await geocode(address + ', Miami, FL');
        if (result && result.features && result.features.length > 0) {
            const [lng, lat] = result.features[0].center;
            const place = result.features[0].place_name;
            
            if (!place.toLowerCase().includes('miami')) {
                throw new Error('Address not found in Miami');
            }
            
            map.flyTo({ center: [lng, lat], zoom: 16 });
            
            if (window.searchMarker) {
                window.searchMarker.remove();
            }
            
            window.searchMarker = new mapboxgl.Marker()
                .setLngLat([lng, lat])
                .addTo(map);

            const response = await fetch(`/api/property?lat=${lat}&lng=${lng}`);
            const data = await response.json();
            displayDataOnMap(data);
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Error in search:', error);
        alert('Address not found in Miami or error in search. Please try again.');
    }
}

function fetchDataAndDisplay() {
    const bounds = map.getBounds();
    const url = `https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/PaGISView_gdb/FeatureServer/0/query?outFields=*&geometry=${bounds.toArray().join(',')}&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&where=1%3D1&f=geojson`;
    
    fetch(`/proxy?url=${encodeURIComponent(url)}`)
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                displayDataOnMap(data);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                console.log('Raw response:', text);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayDataOnMap(data) {
    // Check if the data is valid GeoJSON
    if (!isValidGeoJSON(data)) {
        console.error('Invalid GeoJSON data received');
        return;
    }

    if (map.getSource('property-data')) {
        map.getSource('property-data').setData(data);
    } else {
        map.addSource('property-data', {
            type: 'geojson',
            data: data
        });

        map.addLayer({
            id: 'property-layer',
            type: 'circle',
            source: 'property-data',
            paint: {
                'circle-radius': 5,
                'circle-color': '#007cbf'
            }
        });
    }
}

// Add this helper function to check if the data is valid GeoJSON
function isValidGeoJSON(data) {
    return data && data.type === 'FeatureCollection' && Array.isArray(data.features);
}

function removeDataFromMap() {
    if (map.getLayer('property-layer')) {
        map.removeLayer('property-layer');
    }
    if (map.getSource('property-data')) {
        map.removeSource('property-data');
    }
}

function initializeMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmFjZWJhY29uIiwiYSI6ImNtMWY5b2h0NjFvNHcyanBwbmdmaWg3dGoifQ.ajSCyznbREZXIu7qZAEkDw';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-80.2102, 25.7617], // Miami coordinates
        zoom: 9 // Adjust this value to get the desired view of South Florida
    });
    return map;
}

function addLayers(map) {
    // Add floodplain layer
    map.addSource('floodplain', {
        type: 'geojson',
        data: '/data/miami_dade_floodplain.geojson'
    });
    map.addLayer(createFloodplainLayer(floodZoneColors));

    // Add municipal zone layer
    map.addSource('municipal-zone', {
        type: 'geojson',
        data: '/data/Municipal_Zone.geojson'
    });
    map.addLayer(createMunicipalZoneLayer(colorMap));
    map.addLayer(municipalZoneOutline);

    // Add county zone layer
    map.addSource('county-zone', {
        type: 'geojson',
        data: '/data/County_Zoning.geojson'
    });
    map.addLayer(createCountyZoneLayer(countyColorMap));
    map.addLayer(countyZoneOutline);
}

function handleBasemapToggle() {
    const newStyle = isSatellite ? 'mapbox://styles/mapbox/streets-v11' : 'mapbox://styles/mapbox/satellite-v9';
    
    if (map.getSource('google-sheet-data')) {
        googleSheetData = map.getSource('google-sheet-data')._data;
    }
    
    map.setStyle(newStyle);
    isSatellite = !isSatellite;

    map.once('style.load', readdLayers);
}

function readdLayers() {
    addLayers(map);
    if (googleSheetData) {
        addGoogleSheetDataLayer(map, googleSheetData);
    }
    restoreLayerVisibility();
    addClickEventForPopups();
}

function generatePropertyInfo(properties) {
    const relevantProperties = [
        'FOLIO', 'TRUE_SITE_ADDR', 'TRUE_SITE_CITY', 'TRUE_SITE_ZIP_CODE',
        'TRUE_OWNER1', 'TRUE_OWNER2', 'DOR_DESC',
        'BEDROOM_COUNT', 'BATHROOM_COUNT', 'HALF_BATHROOM_COUNT',
        'BUILDING_HEATED_AREA', 'LOT_SIZE',
        'YEAR_BUILT', 'ASSESSED_VAL_CUR', 'DOS_1', 'PRICE_1'
    ];
    
    const formatLabel = (key) => key.replace(/_/g, ' ').replace(/TRUE /g, '').toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return `
        <div class="popup-section">
            <h4>Property Information</h4>
            <div class="property-info">
                ${relevantProperties.map(key => `
                    <div class="property-item">
                        <span class="property-label">${formatLabel(key)}:</span>
                        <span class="property-value">${formatValue(key, properties[key])}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateMunicipalZoneInfo(properties) {
    return `
        <div class="popup-section">
            <h4>Municipal Zoning</h4>
            <div class="zone-info">
                <p><strong>Zone:</strong> <span>${properties.ZONE || 'N/A'}</span></p>
                <p><strong>Municipality:</strong> <span>${properties.MUNICNAME || 'N/A'}</span></p>
                <p><strong>Description:</strong> <span>${properties.ZONEDESC || 'N/A'}</span></p>
            </div>
        </div>
    `;
}

function generateCountyZoneInfo(properties) {
    return `
        <div class="popup-section">
            <h4>County Zoning</h4>
            <div class="zone-info">
                <p><strong>Zone:</strong> <span>${properties.ZONE || 'N/A'}</span></p>
                <p><strong>Description:</strong> <span>${properties.ZONEDESC || 'N/A'}</span></p>
            </div>
        </div>
    `;
}

function generateFloodZoneInfo(properties) {
    return `
        <div class="popup-section">
            <h4>Flood Zone</h4>
            <div class="zone-info">
                <p><strong>Zone:</strong> <span>${properties.FZONE || 'N/A'}</span></p>
                <p><strong>Description:</strong> <span>${getFloodZoneDescription(properties.FZONE) || 'N/A'}</span></p>
            </div>
        </div>
    `;
}

function getFloodZoneDescription(floodZone) {
    const floodZoneDescriptions = {
        'AE': '1% Annual Chance Flood Hazard',
        'X': 'Area of Minimal Flood Hazard',
        'AH': 'Flood Depths of 1-3 feet',
        'VE': 'Coastal High Hazard Area',
        'A': '1% Annual Chance Flood Hazard (No BFE)',
        'AO': 'River or Stream Flood Hazard',
        'OPEN WATER': 'Open Water'
    };
    return floodZoneDescriptions[floodZone] || 'Description not available';
}

function addLayer(map, layerConfig) {
    try {
        map.addSource(layerConfig.source, layerConfig.sourceConfig);
        map.addLayer(layerConfig.layer);
    } catch (error) {
        console.error(`Error adding ${layerConfig.name} layer:`, error);
    }
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