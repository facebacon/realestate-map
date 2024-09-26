const colorMap = {
    // Define your color map here
    'RMF4': '#7a551e',
    'RMF3': '#b77614',
    'RMF3A': '#ff9900',
    'RMF3B': '#d6a55b',
    'RS2': '#efbe75',
    'RM-1': '#eaa947',
    'RM-2': '#ffc165',
    'RM-3': '#cc8e32',
    'RM-4': '#ffad33',
    'RM-5': '#e0bb84',
    // Add other zones and colors as needed
};

export const createMunicipalZoneLayer = (colorMap) => ({
    id: 'municipal-zone-layer',
    type: 'fill',
    source: 'municipal-zone',
    paint: {
        'fill-color': [
            'case',
            ['all', 
                ['==', ['get', 'MUNICNAME'], 'MIAMI'],
                ['==', ['get', 'ZONE'], 'NONE']
            ],
            'transparent',
            ['==', ['get', 'MUNICNAME'], 'UNINCORPORATED'],
            'transparent',
            [
                'match',
                ['get', 'ZONE'],
                ...Object.entries(colorMap).flatMap(([zone, color]) => [zone, color]),
                'NONE', 'transparent',
                '#CCCCCC' // default color for any unmatched zones
            ]
        ],
        'fill-opacity': 0.7
    },
    layout: {
        'visibility': 'visible'
    }
});

export const municipalZoneOutline = {
    id: 'municipality-outline',
    type: 'line',
    source: 'municipal-zone',
    paint: {
        'line-color': '#000000',
        'line-width': 1
    },
    layout: {
        'visibility': 'visible'
    }
};