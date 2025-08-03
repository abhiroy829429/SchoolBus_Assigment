// Utility functions for Vehicle Movement Simulation
// BLOCKLY TECHNOLOGIES PRIVATE LIMITED

class Utils {
    /**
     * Calculate distance between two points using Haversine formula
     * @param {number} lat1 - Latitude of first point
     * @param {number} lon1 - Longitude of first point
     * @param {number} lat2 - Latitude of second point
     * @param {number} lon2 - Longitude of second point
     * @returns {number} Distance in kilometers
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = CONFIG.EARTH_RADIUS;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     * @param {number} deg - Degrees
     * @returns {number} Radians
     */
    static deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    /**
     * Calculate speed in km/h
     * @param {number} distance - Distance in kilometers
     * @param {number} timeSeconds - Time in seconds
     * @returns {number} Speed in km/h
     */
    static calculateSpeed(distance, timeSeconds) {
        return timeSeconds > 0 ? (distance / timeSeconds) * 3600 : 0;
    }

    /**
     * Format duration from seconds to MM:SS format
     * @param {number} seconds - Total seconds
     * @returns {string} Formatted duration
     */
    static formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Debug logging function
     * @param {string} message - Message to log
     * @param {any} data - Optional data to log
     */
    static log(message, data = null) {
        if (CONFIG.DEBUG.ENABLED) {
            const prefix = CONFIG.DEBUG.LOG_PREFIX;
            if (data) {
                console.log(`${prefix} ${message}`, data);
            } else {
                console.log(`${prefix} ${message}`);
            }
        }
    }

    /**
     * Error logging function
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    static logError(message, error = null) {
        const prefix = CONFIG.DEBUG.LOG_PREFIX;
        if (error) {
            console.error(`${prefix} ${message}`, error);
        } else {
            console.error(`${prefix} ${message}`);
        }
    }

    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    static showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
        `;
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    /**
     * Show completion message
     * @param {number} totalDistance - Total distance traveled
     * @param {string} duration - Duration string
     */
    static showCompletionMessage(totalDistance, duration) {
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 10000;
                max-width: 400px;
            ">
                <h3 style="color: #27ae60; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i> Route Completed!
                </h3>
                <p style="margin-bottom: 1rem;">
                    The vehicle has reached its destination.
                </p>
                <p style="font-size: 0.9rem; color: #7f8c8d;">
                    Total Distance: ${totalDistance.toFixed(3)} km<br>
                    Duration: ${duration}
                </p>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="
                            background: #3498db;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 25px;
                            cursor: pointer;
                            margin-top: 1rem;
                        ">
                    OK
                </button>
            </div>
        `;
        document.body.appendChild(message);
    }
}

 