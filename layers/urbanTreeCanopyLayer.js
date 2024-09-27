export function createUrbanTreeCanopyLayer() {
    return {
        id: 'urban-tree-canopy-layer',
        type: 'fill',
        source: 'urban-tree-canopy',
        paint: {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['coalesce', ['to-number', ['get', 'Percent_by_ZIP']], 0],  // Changed from 'Percent_Tree_Canopy' to 'Percent_by_ZIP'
                0, '#e5f5e0',
                25, '#a1d99b',
                50, '#31a354',
                75, '#006d2c',
                100, '#00441b'
            ],
            'fill-opacity': 0.7
        },
        layout: {
            'visibility': 'visible'
        }
    };
}

export function getColorForPercentage(percentage) {
    const colors = [
        '#e5f5e0',
        '#a1d99b',
        '#31a354',
        '#006d2c',
        '#00441b'
    ];
    const index = Math.floor(percentage / 25);
    return colors[Math.min(index, colors.length - 1)];
}