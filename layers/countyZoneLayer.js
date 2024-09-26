export const createCountyZoneLayer = (countyColorMap) => ({
    id: 'county-zone-layer',
    type: 'fill',
    source: 'county-zone',
    paint: {
        'fill-color': [
            'match',
            ['get', 'ZONE'],
            ...Object.entries(countyColorMap).flatMap(([zone, color]) => [zone, color]),
            'NONE', 'transparent',
            '#CCCCCC' // default color for any unmatched zones
        ],
        'fill-opacity': 0.7
    },
    layout: {
        'visibility': 'visible'
    }
});

export const countyZoneOutline = {
    id: 'county-zone-outline',
    type: 'line',
    source: 'county-zone',
    paint: {
        'line-color': '#000000',
        'line-width': 1
    },
    layout: {
        'visibility': 'visible'
    }
};