
class MapManager {
    constructor() {
        this.map = null;
        this.vehicleMarker = null;
        this.routePolyline = null;
        this.fallbackMarker = null;
    }

    /**
     * Initialize the map
     */
    initialize() {
        try {
            Utils.log('Initializing map...');
            
            this.map = L.map('map').setView(
                CONFIG.MAP.DEFAULT_CENTER, 
                CONFIG.MAP.DEFAULT_ZOOM
            );
            Utils.log('Map created', this.map);
            
            // Add OpenStreetMap tiles
            L.tileLayer(CONFIG.MAP.TILE_URL, CONFIG.MAP.TILE_OPTIONS).addTo(this.map);
            Utils.log('Map tiles added successfully');
            
        } catch (error) {
            Utils.logError('Error initializing map', error);
            Utils.showError(`Map initialization failed: ${error.message}`);
        }
    }

    /**
     * Create and add route polyline to map
     * @param {Array} routeData - Array of route coordinates
     */
    createRoute(routeData) {
        try {
            Utils.log('Creating route with', routeData.length, 'points...');
            
            const routeCoordinates = routeData.map(point => [point.latitude, point.longitude]);
            this.routePolyline = L.polyline(routeCoordinates, {
                color: CONFIG.ROUTE.COLOR,
                weight: CONFIG.ROUTE.WEIGHT,
                opacity: CONFIG.ROUTE.OPACITY,
                dashArray: CONFIG.ROUTE.DASH_ARRAY
            }).addTo(this.map);

            // Fit map to show the entire route
            this.map.fitBounds(this.routePolyline.getBounds(), { padding: [20, 20] });
            Utils.log('Route created and map fitted to bounds');
            
            // Store route coordinates for vehicle positioning
            this.routeCoordinates = routeCoordinates;
            
        } catch (error) {
            Utils.logError('Error creating route', error);
            Utils.showError(`Route creation failed: ${error.message}`);
        }
    }

    /**
     * Create vehicle icon
     * @returns {L.DivIcon} Vehicle icon
     */
    createVehicleIcon() {
        return L.divIcon({
            className: CONFIG.VEHICLE_ICON.CLASS_NAME,
            html: CONFIG.VEHICLE_ICON.HTML,
            iconSize: CONFIG.VEHICLE_ICON.SIZE,
            iconAnchor: CONFIG.VEHICLE_ICON.ANCHOR
        });
    }

    /**
     * Create fallback icon
     * @returns {L.DivIcon} Fallback icon
     */
    createFallbackIcon() {
        return L.divIcon({
            className: CONFIG.FALLBACK_ICON.CLASS_NAME,
            html: CONFIG.FALLBACK_ICON.HTML,
            iconSize: CONFIG.FALLBACK_ICON.SIZE,
            iconAnchor: CONFIG.FALLBACK_ICON.ANCHOR
        });
    }

    /**
     * Add vehicle marker to map
     * @param {Object} startPoint - Starting coordinates
     */
    addVehicleMarker(startPoint) {
        try {
            const vehicleIcon = this.createVehicleIcon();
            
            // Ensure the vehicle starts exactly on the route
            const exactPosition = this.getExactRoutePosition(startPoint.latitude, startPoint.longitude);
            
            this.vehicleMarker = L.marker(exactPosition, {
                icon: vehicleIcon
            }).addTo(this.map);

            Utils.log('Vehicle marker created at:', exactPosition);
            Utils.log('Marker added to map:', this.map.hasLayer(this.vehicleMarker));
            
            // Add popup to vehicle marker
            this.vehicleMarker.bindPopup(`
                <div style="text-align: center;">
                    <strong>🚌 Vehicle</strong><br>
                    <small>Click for details</small>
                </div>
            `);

            // Create fallback marker
            this.fallbackMarker = L.marker([startPoint.latitude, startPoint.longitude], {
                icon: this.createFallbackIcon()
            });

            // Check if custom icon is visible, if not use fallback
            setTimeout(() => {
                this.checkMarkerVisibility();
            }, 1000);

            // Test DOM element creation
            setTimeout(() => {
                this.testMarkerDOM();
            }, 500);
            
        } catch (error) {
            Utils.logError('Error adding vehicle marker', error);
            Utils.showError(`Vehicle marker creation failed: ${error.message}`);
        }
    }

    /**
     * Check if vehicle marker is visible and switch to fallback if needed
     */
    checkMarkerVisibility() {
        const customMarker = document.querySelector(`.${CONFIG.VEHICLE_ICON.CLASS_NAME}`);
        Utils.log('Custom marker element:', customMarker);
        
        if (!customMarker || customMarker.offsetWidth === 0) {
            Utils.log('Custom marker not visible, switching to fallback');
            this.map.removeLayer(this.vehicleMarker);
            this.vehicleMarker = this.fallbackMarker;
            this.vehicleMarker.addTo(this.map);
            Utils.log('Using fallback marker icon');
        } else {
            Utils.log('Custom marker is visible');
        }
    }

    /**
     * Test DOM element creation
     */
    testMarkerDOM() {
        const markerElement = document.querySelector(`.${CONFIG.VEHICLE_ICON.CLASS_NAME}`);
        Utils.log('DOM element found:', markerElement);
        if (markerElement) {
            Utils.log('Marker dimensions:', markerElement.offsetWidth, 'x', markerElement.offsetHeight);
            Utils.log('Marker visible:', markerElement.offsetWidth > 0);
        }
    }

    /**
     * Update vehicle position
     * @param {number} latitude - New latitude
     * @param {number} longitude - New longitude
     */
    updateVehiclePosition(latitude, longitude) {
        if (this.vehicleMarker) {
            // Ensure coordinates are exactly on the route
            const exactPosition = this.getExactRoutePosition(latitude, longitude);
            
            // Update vehicle marker position with smooth animation
            this.vehicleMarker.setLatLng(exactPosition, {
                animate: true,
                duration: 0.5
            });
            
            // Also update fallback marker if it exists
            if (this.fallbackMarker) {
                this.fallbackMarker.setLatLng(exactPosition);
            }
        }
    }

    /**
     * Get exact position on the route
     * @param {number} latitude - Target latitude
     * @param {number} longitude - Target longitude
     * @returns {Array} Exact coordinates on the route
     */
    getExactRoutePosition(latitude, longitude) {
        if (!this.routeCoordinates || this.routeCoordinates.length === 0) {
            return [latitude, longitude];
        }

        // Find the closest point on the route
        let closestPoint = this.routeCoordinates[0];
        let minDistance = Infinity;

        for (const coord of this.routeCoordinates) {
            const distance = Math.sqrt(
                Math.pow(coord[0] - latitude, 2) + 
                Math.pow(coord[1] - longitude, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = coord;
            }
        }

        return closestPoint;
    }

    /**
     * Center map on vehicle
     * @param {number} latitude - Vehicle latitude
     * @param {number} longitude - Vehicle longitude
     */
    centerOnVehicle(latitude, longitude) {
        this.map.panTo([latitude, longitude], {
            animate: true,
            duration: 0.5
        });
    }

    /**
     * Toggle route visibility
     * @param {boolean} show - Whether to show the route
     */
    toggleRoute(show) {
        if (this.routePolyline) {
            if (show) {
                this.routePolyline.addTo(this.map);
            } else {
                this.map.removeLayer(this.routePolyline);
            }
        }
    }

    /**
     * Reset vehicle to starting position
     * @param {Object} startPoint - Starting coordinates
     */
    resetVehicle(startPoint) {
        if (this.vehicleMarker && startPoint) {
            const exactPosition = this.getExactRoutePosition(startPoint.latitude, startPoint.longitude);
            this.vehicleMarker.setLatLng(exactPosition);
            
            if (this.fallbackMarker) {
                this.fallbackMarker.setLatLng(exactPosition);
            }
        }
    }

    
    refresh() {
        if (this.map) {
            this.map.invalidateSize();
            Utils.log('Map refreshed');
        }
    }
}

 