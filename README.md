# Real Estate Map

## Overview

The Real Estate Map is a web application that provides an interactive map for analyzing various zoning layers, floodplain data, and property information in Miami, FL. The application integrates with Mapbox for map rendering, Google Maps for Street View, and Walk Score for walkability scores.

## Features

![Screenshot 2024-09-26 at 7 17 41 AM](https://github.com/user-attachments/assets/73b2a8c3-3f80-4ac8-9fd1-e248b9e79273)

- **Interactive Map**: Displays floodplain, municipal, and county zoning layers.
- **Search Functionality**: Allows users to search for addresses in Miami, FL.
- **Walk Score Integration**: Fetches and displays Walk Score for searched addresses.
- **Street View**: Integrates Google Street View for visualizing property locations.
- **Layer Toggle**: Users can toggle visibility and adjust opacity of different layers.
- **Legend**: Provides a legend for floodplain and zoning layers.

## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/realestate-map.git
    cd realestate-map
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your API keys:
    ```env
    MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
    WALKSCORE_API_KEY=your_walkscore_api_key
    ```

### Running the Application

1. Start the server:
    ```sh
    node server.mjs
    ```

2. Open your browser and navigate to `http://localhost:8000`.

## Project Structure

- **index.html**: The main HTML file that includes the map container and search input.
    ```html:index.html
    <!-- index.html content -->
    ```

- **app.js**: The main JavaScript file that initializes the map, adds layers, and handles user interactions.
    ```javascript:app.js
    // app.js content
    ```

- **server.mjs**: The server file that handles API requests and serves static files.
    ```javascript:server.mjs
    // server.mjs content
    ```

- **package.json**: Contains project metadata and dependencies.
    ```json:package.json
    {
      "name": "realestate-map",
      "version": "1.0.0",
      "description": "A map for analysis ",
      "main": "app.js",
      "type": "module",
      "scripts": {
        "test": "1=1"
      },
      "author": "",
      "license": "ISC",
      "dependencies": {
        "dotenv": "^16.4.5",
        "express": "^4.21.0",
        "node-fetch": "^3.3.2"
      }
    }
    ```

- **.gitignore**: Specifies files and directories to be ignored by Git.
    ```.gitignore
    node_modules
    .env
    .DS_Store
    *.log
    data
    node_modules
    ```

- **layers/**: Directory containing JavaScript files for creating different map layers.
    - **municipalZoneLayer.js**: Defines the municipal zoning layer.
        ```javascript:layers/municipalZoneLayer.js
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
        ```

    - **floodplainLayer.js**: Defines the floodplain layer.
        ```javascript:layers/floodplainLayer.js
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
        ```

    - **countyZoneLayer.js**: Defines the county zoning layer.
        ```javascript:layers/countyZoneLayer.js
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
        ```

- **api/**: Directory containing JavaScript files for API integrations.
    - **geocoding.js**: Handles geocoding requests to Mapbox.
        ```javascript:api/geocoding.js
        let MAPBOX_ACCESS_TOKEN = null;

        async function getMapboxToken() {
            if (MAPBOX_ACCESS_TOKEN) return MAPBOX_ACCESS_TOKEN;
            const response = await fetch('/api/mapbox-token');
            const data = await response.json();
            MAPBOX_ACCESS_TOKEN = data.token;
            return MAPBOX_ACCESS_TOKEN;
        }

        export async function geocode(address) {
            const token = await getMapboxToken();
            const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
            const params = new URLSearchParams({
                access_token: token,
                limit: 1,
                country: 'US',
                types: 'address'
            });

            try {
                const response = await fetch(`${endpoint}?${params}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error during geocoding:', error);
                throw error;
            }
        }
        ```
## Usage

1. **Search for an Address**: Enter an address in the search input and click "Search". The map will zoom to the location and display property information, Walk Score, and Street View.
2. **Toggle Layers**: Use the checkboxes in the menu to toggle the visibility of different layers. Adjust the opacity using the sliders.
3. **View Legends**: Click on the legend items to expand and view details about the floodplain and zoning layers.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js)
- [Google Maps API](https://developers.google.com/maps/documentation/javascript/overview)
- [Walk Score API](https://www.walkscore.com/professional/walk-score-apis.php)
