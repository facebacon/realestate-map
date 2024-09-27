export function createLegend(map, legendData, floodZoneLegendData, floodZoneColors, colorMap, countyColorMap) {
    const legendContainer = document.createElement('div');
    legendContainer.id = 'legend';

    // Create floodplain legend
    const floodplainDetails = createFloodplainLegend(floodZoneLegendData, floodZoneColors);
    legendContainer.appendChild(floodplainDetails);

    // Create municipal zoning legend
    const municipalZoningDetails = createMunicipalZoningLegend(legendData, colorMap);
    legendContainer.appendChild(municipalZoningDetails);

    // Create county zoning legend
    const countyZoningDetails = createCountyZoningLegend(countyColorMap);
    legendContainer.appendChild(countyZoningDetails);

    // Add the legend to the map
    map.getContainer().appendChild(legendContainer);

    return {
        floodplainDetails,
        municipalZoningDetails,
        countyZoningDetails
    };
}

function createFloodplainLegend(floodZoneLegendData, floodZoneColors) {
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

    return floodplainDetails;
}

function createMunicipalZoningLegend(legendData, colorMap) {
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

    return municipalZoningDetails;
}

function createCountyZoningLegend(countyColorMap) {
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

    return countyZoningDetails;
}