export function generateFloodZoneInfo(properties) {
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

export function generateMunicipalZoneInfo(properties) {
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

export function generateCountyZoneInfo(properties) {
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

export function generatePropertyInfo(properties) {
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