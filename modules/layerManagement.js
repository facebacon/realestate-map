import { createFloodplainLayer } from '../layers/floodplainLayer.js';
import { createMunicipalZoneLayer, municipalZoneOutline } from '../layers/municipalZoneLayer.js';
import { createCountyZoneLayer, countyZoneOutline } from '../layers/countyZoneLayer.js';

export const layers = [
    { id: 'floodplain-layer', name: 'Floodplain', source: 'floodplain' },
    { id: 'municipal-zone-layer', name: 'Municipal Zoning', source: 'municipal-zone' },
    { id: 'county-zone-layer', name: 'County Zoning', source: 'county-zone' }
];

export function addLayers(map, floodZoneColors, colorMap, countyColorMap) {
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

export function removeDataFromMap(map) {
    if (map.getLayer('property-layer')) {
        map.removeLayer('property-layer');
    }
    if (map.getSource('property-data')) {
        map.removeSource('property-data');
    }
}

export function displayDataOnMap(map, data) {
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

function isValidGeoJSON(data) {
    return data && data.type === 'FeatureCollection' && Array.isArray(data.features);
}

export function restoreLayerVisibility(map) {
    layers.forEach(layer => {
        const visibility = map.getLayoutProperty(layer.id, 'visibility');
        map.setLayoutProperty(layer.id, 'visibility', visibility);
    });
}