import { geocode } from '../api/geocoding.js';
import { displayDataOnMap } from '../modules/layerManagement.js'; // Add this line

export async function searchAddress(address, map) {
    try {
        console.log(`Searching for address: ${address}`); // Add this line
        const result = await geocode(`${address}, Miami, FL`);
        console.log('Geocoding result:', result); // Add this line

        if (result && result.features && result.features.length > 0) {
            const [lng, lat] = result.features[0].center;
            const place = result.features[0].place_name;
            console.log(`Geocoded place: ${place}, Coordinates: [${lng}, ${lat}]`); // Add this line

            // Comment out or remove the following lines
            // if (!place.toLowerCase().includes('miami')) {
            //     throw new Error('Address not found in Miami');
            // }

            map.flyTo({ center: [lng, lat], zoom: 16 });

            if (window.searchMarker) {
                window.searchMarker.remove();
            }

            window.searchMarker = new mapboxgl.Marker()
                .setLngLat([lng, lat])
                .addTo(map);

            // Fetch and display property data
            console.log(`Fetching property data for lat: ${lat}, lng: ${lng}`); // Add this line
            const response = await fetch(`/api/property?lat=${lat}&lng=${lng}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to fetch property data:', errorText);
                throw new Error('Failed to fetch property data');
            }
            const data = await response.json();
            console.log('Property data:', data); // Add this line
            displayDataOnMap(map, data);
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Error in search:', error);
        // Comment out or remove the following line
        // alert('Address not found in Miami or error in search. Please try again.');
    }
}