export const createFloodplainLayer = (floodZoneColors) => ({
    id: 'floodplain-layer',
    type: 'fill',
    source: 'floodplain',
    paint: {
        'fill-color': [
            'match',
            ['get', 'FZONE'],
            ...Object.entries(floodZoneColors).flatMap(([zone, color]) => [zone, color]),
            'NONE', 'transparent',
            '#CCCCCC'  // default color
        ],
        'fill-opacity': 0.7
    },
    layout: {
        'visibility': 'visible'
    }
});