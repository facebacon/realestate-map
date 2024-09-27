import { generateFloodZoneInfo, generateMunicipalZoneInfo, generateCountyZoneInfo, generatePropertyInfo } from './infoGenerators.js';

export function setupPopupMenu(map) {
    map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['floodplain-layer', 'municipal-zone-layer', 'county-zone-layer', 'property-layer']
        });

        if (!features.length) {
            return;
        }

        const feature = features[0];
        const coordinates = feature.geometry.type === 'Point' ? feature.geometry.coordinates.slice() : e.lngLat;

        let popupContent = '';

        switch (feature.layer.id) {
            case 'floodplain-layer':
                popupContent = generateFloodZoneInfo(feature.properties);
                break;
            case 'municipal-zone-layer':
                popupContent = generateMunicipalZoneInfo(feature.properties);
                break;
            case 'county-zone-layer':
                popupContent = generateCountyZoneInfo(feature.properties);
                break;
            case 'property-layer':
                popupContent = generatePropertyInfo(feature.properties);
                break;
        }

        if (popupContent) {
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(popupContent)
                .addTo(map);
        }
    });
}