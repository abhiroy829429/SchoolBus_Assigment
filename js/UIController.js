// UI Controller for Vehicle Movement Simulation
// BLOCKLY TECHNOLOGIES PRIVATE LIMITED

class UIController {
    constructor(simulation) {
        this.simulation = simulation;
        this.elements = {};
        this.initializeElements();
        this.setupEventListeners();
    }

    /**
     * Initialize UI elements
     */
    initializeElements() {
        this.elements = {
            playPauseBtn: document.getElementById('playPauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            speedSlider: document.getElementById('speedSlider'),
            showRouteCheckbox: document.getElementById('showRoute'),
            speedValue: document.getElementById('speedValue'),
            currentPosition: document.getElementById('currentPosition'),
            timestamp: document.getElementById('timestamp'),
            speed: document.getElementById('speed'),
            distance: document.getElementById('distance')
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Play/Pause button
        this.elements.playPauseBtn.addEventListener('click', () => {
            this.simulation.togglePlayPause();
        });

        // Reset button
        this.elements.resetBtn.addEventListener('click', () => {
            this.simulation.resetSimulation();
        });

        // Speed slider
        this.elements.speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            this.simulation.setAnimationSpeed(speed);
            this.updateSpeedDisplay(speed);
        });

        // Show route checkbox
        this.elements.showRouteCheckbox.addEventListener('change', (e) => {
            this.simulation.toggleRoute(e.target.checked);
        });
    }

    /**
     * Update play/pause button state
     * @param {boolean} isPlaying - Whether simulation is playing
     */
    updatePlayPauseButton(isPlaying) {
        const btn = this.elements.playPauseBtn;
        
        if (isPlaying) {
            btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            btn.classList.add('paused');
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> Play';
            btn.classList.remove('paused');
        }
    }

    /**
     * Update speed display
     * @param {number} speed - Animation speed in milliseconds
     */
    updateSpeedDisplay(speed) {
        this.elements.speedValue.textContent = `${speed / 1000}s`;
    }

    /**
     * Update vehicle information panel
     * @param {Object} data - Vehicle data
     */
    updateVehicleInfo(data) {
        if (data.currentPosition) {
            this.elements.currentPosition.textContent = data.currentPosition;
        }
        
        if (data.timestamp) {
            this.elements.timestamp.textContent = data.timestamp;
        }
        
        if (data.speed !== undefined) {
            this.elements.speed.textContent = `${data.speed.toFixed(2)} km/h`;
        }
        
        if (data.distance !== undefined) {
            this.elements.distance.textContent = `${data.distance.toFixed(3)} km`;
        }
    }

    /**
     * Reset vehicle information panel
     */
    resetVehicleInfo() {
        this.elements.currentPosition.textContent = '--';
        this.elements.timestamp.textContent = '--';
        this.elements.speed.textContent = '--';
        this.elements.distance.textContent = '--';
    }

    /**
     * Show loading indicator
     */
    showLoadingIndicator() {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loadingIndicator';
        loadingIndicator.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            ">
                <div style="text-align: center;">
                    <div class="loading"></div>
                    <p style="margin-top: 1rem; color: #3498db; font-weight: 600;">
                        Loading Vehicle Movement Simulation...
                    </p>
                </div>
            </div>
        `;
        document.body.appendChild(loadingIndicator);
    }

    /**
     * Hide loading indicator
     */
    hideLoadingIndicator() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Show completion message
     * @param {number} totalDistance - Total distance traveled
     * @param {string} duration - Duration string
     */
    showCompletionMessage(totalDistance, duration) {
        Utils.showCompletionMessage(totalDistance, duration);
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        Utils.showError(message);
    }

    /**
     * Update route visibility
     * @param {boolean} show - Whether to show the route
     */
    updateRouteVisibility(show) {
        this.elements.showRouteCheckbox.checked = show;
    }

    /**
     * Get current speed setting
     * @returns {number} Current animation speed
     */
    getCurrentSpeed() {
        return parseInt(this.elements.speedSlider.value);
    }

    /**
     * Set speed setting
     * @param {number} speed - Animation speed in milliseconds
     */
    setSpeed(speed) {
        this.elements.speedSlider.value = speed;
        this.updateSpeedDisplay(speed);
    }

    /**
     * Get route visibility setting
     * @returns {boolean} Whether route should be shown
     */
    getRouteVisibility() {
        return this.elements.showRouteCheckbox.checked;
    }

    /**
     * Disable controls during loading
     */
    disableControls() {
        this.elements.playPauseBtn.disabled = true;
        this.elements.resetBtn.disabled = true;
        this.elements.speedSlider.disabled = true;
    }

    /**
     * Enable controls after loading
     */
    enableControls() {
        this.elements.playPauseBtn.disabled = false;
        this.elements.resetBtn.disabled = false;
        this.elements.speedSlider.disabled = false;
    }
}

 