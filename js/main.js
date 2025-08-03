// Main entry point for Vehicle Movement Simulation
// BLOCKLY TECHNOLOGIES PRIVATE LIMITED

// Global simulation instance
let vehicleSimulation = null;

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        Utils.log('Initializing Vehicle Movement Simulation...');
        vehicleSimulation = new VehicleSimulation();
    } catch (error) {
        Utils.logError('Failed to initialize simulation', error);
        Utils.showError(`Application initialization failed: ${error.message}`);
    }
});

/**
 * Additional utility functions for better user experience
 */
window.addEventListener('load', () => {
    // Add loading indicator
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
    
    // Remove loading indicator after a short delay
    setTimeout(() => {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }, 2000);
});

 