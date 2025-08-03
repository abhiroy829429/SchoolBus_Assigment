// Main Vehicle Simulation Class
// BLOCKLY TECHNOLOGIES PRIVATE LIMITED

class VehicleSimulation {
    constructor() {
        this.currentIndex = 0;
        this.isPlaying = false;
        this.animationInterval = null;
        this.animationSpeed = CONFIG.ANIMATION.DEFAULT_SPEED;
        this.totalDistance = 0;
        this.startTime = null;

        // Initialize managers
        this.mapManager = new MapManager();
        this.dataManager = new DataManager();
        this.uiController = new UIController(this);

        // Initialize the application
        this.initialize();
    }

    /**
     * Initialize the simulation
     */
    async initialize() {
        try {
            // Show loading indicator
            this.uiController.showLoadingIndicator();

            // Initialize map
            this.mapManager.initialize();

            // Wait for map to be ready
            await new Promise(resolve => setTimeout(resolve, 500));

            // Load route data
            const routeData = await this.dataManager.loadRouteData();

            // Create route and vehicle marker
            this.mapManager.createRoute(routeData);
            this.mapManager.addVehicleMarker(this.dataManager.getStartPoint());

            // Update UI with initial data
            this.updateInfoPanel();

            // Enable controls
            this.uiController.enableControls();

            // Hide loading indicator
            setTimeout(() => {
                this.uiController.hideLoadingIndicator();
            }, 1000);

        } catch (error) {
            Utils.logError('Error initializing simulation', error);
            this.uiController.showError(`Simulation initialization failed: ${error.message}`);
            this.uiController.hideLoadingIndicator();
        }
    }

    /**
     * Toggle play/pause functionality
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.pauseSimulation();
        } else {
            this.startSimulation();
        }
    }

    /**
     * Start the simulation
     */
    startSimulation() {
        if (this.currentIndex >= this.dataManager.getRouteLength() - 1) {
            this.resetSimulation();
        }
        
        this.isPlaying = true;
        this.startTime = this.startTime || new Date();
        
        this.uiController.updatePlayPauseButton(true);
        this.startAnimation();
    }

    /**
     * Pause the simulation
     */
    pauseSimulation() {
        this.isPlaying = false;
        this.uiController.updatePlayPauseButton(false);
        this.stopAnimation();
    }

    /**
     * Reset the simulation
     */
    resetSimulation() {
        this.pauseSimulation();
        this.currentIndex = 0;
        this.totalDistance = 0;
        this.startTime = null;
        
        const startPoint = this.dataManager.getStartPoint();
        if (startPoint) {
            this.mapManager.resetVehicle(startPoint);
            this.updateInfoPanel();
        }
    }

    /**
     * Start the animation loop
     */
    startAnimation() {
        this.animationInterval = setInterval(() => {
            this.moveToNextPoint();
        }, this.animationSpeed);
    }

    /**
     * Stop the animation loop
     */
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    /**
     * Move to the next point in the route
     */
    moveToNextPoint() {
        if (this.currentIndex < this.dataManager.getRouteLength() - 1) {
            this.currentIndex++;
            const currentPoint = this.dataManager.getRoutePoint(this.currentIndex);
            
            if (currentPoint) {
                // Get the exact route coordinates for this index
                const routeCoordinates = this.mapManager.getRouteCoordinates();
                if (routeCoordinates && routeCoordinates[this.currentIndex]) {
                    const [exactLat, exactLng] = routeCoordinates[this.currentIndex];
                    
                    // Update vehicle position using exact route coordinates
                    this.mapManager.updateVehiclePosition(exactLat, exactLng);
                    
                    // Calculate distance traveled using exact coordinates
                    if (this.currentIndex > 0 && routeCoordinates[this.currentIndex - 1]) {
                        const [prevLat, prevLng] = routeCoordinates[this.currentIndex - 1];
                        const distance = Utils.calculateDistance(prevLat, prevLng, exactLat, exactLng);
                        this.totalDistance += distance;
                    }
                    
                    // Update info panel with exact coordinates
                    this.updateInfoPanelWithExactCoords(exactLat, exactLng, currentPoint.timestamp);
                    
                    // Center map on vehicle
                    this.mapManager.centerOnVehicle(exactLat, exactLng);
                } else {
                    // Fallback to original method
                    this.mapManager.updateVehiclePosition(currentPoint.latitude, currentPoint.longitude);
                    
                    // Calculate distance traveled
                    if (this.currentIndex > 0) {
                        const distance = this.dataManager.calculateDistanceBetweenPoints(
                            this.currentIndex - 1, 
                            this.currentIndex
                        );
                        this.totalDistance += distance;
                    }
                    
                    // Update info panel
                    this.updateInfoPanel();
                    
                    // Center map on vehicle
                    this.mapManager.centerOnVehicle(currentPoint.latitude, currentPoint.longitude);
                }
                
                // Check if we've reached the end
                if (this.currentIndex >= this.dataManager.getRouteLength() - 1) {
                    this.pauseSimulation();
                    this.showCompletionMessage();
                }
            }
        }
    }

    /**
     * Update the information panel
     */
    updateInfoPanel() {
        const currentPoint = this.dataManager.getRoutePoint(this.currentIndex);
        
        if (!currentPoint) {
            this.uiController.resetVehicleInfo();
            return;
        }

        // Calculate speed
        let speed = 0;
        if (this.currentIndex > 0) {
            speed = this.dataManager.calculateSpeedBetweenPoints(
                this.currentIndex - 1, 
                this.currentIndex
            );
        }

        // Update UI
        this.uiController.updateVehicleInfo({
            currentPosition: `${currentPoint.latitude.toFixed(6)}, ${currentPoint.longitude.toFixed(6)}`,
            timestamp: new Date(currentPoint.timestamp).toLocaleString(),
            speed: speed,
            distance: this.totalDistance
        });
    }

    /**
     * Update the information panel with exact coordinates
     * @param {number} latitude - Exact latitude
     * @param {number} longitude - Exact longitude
     * @param {string} timestamp - Timestamp string
     */
    updateInfoPanelWithExactCoords(latitude, longitude, timestamp) {
        // Calculate speed using exact coordinates
        let speed = 0;
        if (this.currentIndex > 0) {
            const routeCoordinates = this.mapManager.getRouteCoordinates();
            if (routeCoordinates && routeCoordinates[this.currentIndex - 1]) {
                const [prevLat, prevLng] = routeCoordinates[this.currentIndex - 1];
                const distance = Utils.calculateDistance(prevLat, prevLng, latitude, longitude);
                const timeDiff = 5; // Assuming 5 seconds between points
                speed = Utils.calculateSpeed(distance, timeDiff);
            }
        }

        // Update UI with exact coordinates
        this.uiController.updateVehicleInfo({
            currentPosition: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            timestamp: new Date(timestamp).toLocaleString(),
            speed: speed,
            distance: this.totalDistance
        });
    }

    /**
     * Set animation speed
     * @param {number} speed - Animation speed in milliseconds
     */
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
        
        // Restart animation with new speed if currently playing
        if (this.isPlaying) {
            this.stopAnimation();
            this.startAnimation();
        }
    }

    /**
     * Toggle route visibility
     * @param {boolean} show - Whether to show the route
     */
    toggleRoute(show) {
        this.mapManager.toggleRoute(show);
    }

    /**
     * Show completion message
     */
    showCompletionMessage() {
        const duration = this.calculateDuration();
        this.uiController.showCompletionMessage(this.totalDistance, duration);
    }

    /**
     * Calculate total duration
     * @returns {string} Formatted duration
     */
    calculateDuration() {
        if (!this.startTime) return '0:00';
        
        const endTime = new Date();
        const duration = Math.floor((endTime - this.startTime) / 1000); // seconds
        return Utils.formatDuration(duration);
    }

    /**
     * Get current simulation state
     * @returns {Object} Current state
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentIndex: this.currentIndex,
            totalDistance: this.totalDistance,
            animationSpeed: this.animationSpeed,
            startTime: this.startTime
        };
    }
}

 