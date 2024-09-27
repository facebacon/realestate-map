const setupLayerToggleMenu = (map, layers, floodplainDetails, municipalZoningDetails, countyZoningDetails) => {
    // Clear existing menu items
    const menu = document.getElementById('menu');
    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }

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
        menu.appendChild(item);
    });
};

export { setupLayerToggleMenu };