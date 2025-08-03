// Data Manager for Vehicle Movement Simulation
// BLOCKLY TECHNOLOGIES PRIVATE LIMITED

class DataManager {
    constructor() {
        this.routeData = [];
    }

    /**
     * Load route data from JSON file
     * @returns {Promise<Array>} Route data array
     */
    async loadRouteData() {
        try {
            Utils.log('Attempting to load route data...');
            const response = await fetch('dummy-route.json');
            Utils.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            Utils.log('Raw response text (first 200 chars):', text.substring(0, 200));
            
            this.routeData = JSON.parse(text);
            Utils.log('Parsed route data length:', this.routeData.length);
            
            if (this.routeData.length === 0) {
                throw new Error('Route data is empty');
            }
            
            return this.routeData;
            
        } catch (error) {
            Utils.logError('Error loading route data', error);
            Utils.showError(`Failed to load route data: ${error.message}`);
            
            // Create fallback dummy data
            return this.createFallbackData();
        }
    }

    /**
     * Create fallback dummy data
     * @returns {Array} Fallback route data
     */
    createFallbackData() {
        Utils.log('Creating fallback dummy data...');
        
        this.routeData = [
            {
                "latitude": 17.385044,
                "longitude": 78.486671,
                "timestamp": "2024-07-20T10:00:00Z"
            },
            {
                "latitude": 17.385045,
                "longitude": 78.486672,
                "timestamp": "2024-07-20T10:00:05Z"
            },
            {
                "latitude": 17.385050,
                "longitude": 78.486680,
                "timestamp": "2024-07-20T10:00:10Z"
            },
            {
                "latitude": 17.385060,
                "longitude": 78.486690,
                "timestamp": "2024-07-20T10:00:15Z"
            },
            {
                "latitude": 17.385070,
                "longitude": 78.486700,
                "timestamp": "2024-07-20T10:00:20Z"
            }
        ];
        
        Utils.log('Fallback data loaded successfully');
        return this.routeData;
    }

    /**
     * Get current route data
     * @returns {Array} Current route data
     */
    getRouteData() {
        return this.routeData;
    }

    /**
     * Get route point by index
     * @param {number} index - Point index
     * @returns {Object|null} Route point or null if out of bounds
     */
    getRoutePoint(index) {
        if (index >= 0 && index < this.routeData.length) {
            return this.routeData[index];
        }
        return null;
    }

    /**
     * Get route length
     * @returns {number} Number of route points
     */
    getRouteLength() {
        return this.routeData.length;
    }

    /**
     * Get starting point
     * @returns {Object|null} Starting coordinates
     */
    getStartPoint() {
        return this.routeData.length > 0 ? this.routeData[0] : null;
    }

    /**
     * Get ending point
     * @returns {Object|null} Ending coordinates
     */
    getEndPoint() {
        return this.routeData.length > 0 ? this.routeData[this.routeData.length - 1] : null;
    }

    /**
     * Calculate total route distance
     * @returns {number} Total distance in kilometers
     */
    calculateTotalDistance() {
        let totalDistance = 0;
        
        for (let i = 1; i < this.routeData.length; i++) {
            const prevPoint = this.routeData[i - 1];
            const currentPoint = this.routeData[i];
            
            const distance = Utils.calculateDistance(
                prevPoint.latitude, prevPoint.longitude,
                currentPoint.latitude, currentPoint.longitude
            );
            
            totalDistance += distance;
        }
        
        return totalDistance;
    }

    /**
     * Calculate distance between two route points
     * @param {number} index1 - First point index
     * @param {number} index2 - Second point index
     * @returns {number} Distance in kilometers
     */
    calculateDistanceBetweenPoints(index1, index2) {
        const point1 = this.getRoutePoint(index1);
        const point2 = this.getRoutePoint(index2);
        
        if (point1 && point2) {
            return Utils.calculateDistance(
                point1.latitude, point1.longitude,
                point2.latitude, point2.longitude
            );
        }
        
        return 0;
    }

    /**
     * Calculate speed between two route points
     * @param {number} index1 - First point index
     * @param {number} index2 - Second point index
     * @returns {number} Speed in km/h
     */
    calculateSpeedBetweenPoints(index1, index2) {
        const point1 = this.getRoutePoint(index1);
        const point2 = this.getRoutePoint(index2);
        
        if (point1 && point2) {
            const distance = this.calculateDistanceBetweenPoints(index1, index2);
            const timeDiff = (new Date(point2.timestamp) - new Date(point1.timestamp)) / 1000; // seconds
            
            return Utils.calculateSpeed(distance, timeDiff);
        }
        
        return 0;
    }
}

 