// Configuration for Vehicle Movement Simulation


const CONFIG = {
    // Map Configuration
    MAP: {
        DEFAULT_CENTER: [17.385044, 78.486671],
        DEFAULT_ZOOM: 15,
        TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        TILE_OPTIONS: {
           
            maxZoom: 19
        }
    },

    // Vehicle Icon Configuration
    VEHICLE_ICON: {
        SIZE: [30, 30],
        ANCHOR: [15, 15],
        CLASS_NAME: 'vehicle-marker',
        HTML: '<div style="background: #FF0000; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(255, 0, 0, 0.8); position: relative; z-index: 1000;"></div>'
    },

    // Fallback Icon Configuration
    FALLBACK_ICON: {
        SIZE: [16, 16],
        ANCHOR: [8, 8],
        CLASS_NAME: 'fallback-marker',
        HTML: '<div style="background: #FF5722; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(255, 87, 34, 0.6);"></div>'
    },

    // Route Configuration
    ROUTE: {
        COLOR: '#4CAF50',
        WEIGHT: 6,
        OPACITY: 0.9,
        DASH_ARRAY: '8, 4'
    },

    // Animation Configuration
    ANIMATION: {
        DEFAULT_SPEED: 1000,
        MIN_SPEED: 500,
        MAX_SPEED: 3000,
        SPEED_STEP: 100
    },

    // Earth's radius for distance calculations
    EARTH_RADIUS: 6371,

    // Debug Configuration
    DEBUG: {
        ENABLED: true,
        LOG_PREFIX: '[VehicleSim]'
    }
};

 