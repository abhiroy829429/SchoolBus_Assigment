document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('error', (e) => {
        console.error('Unhandled error:', e.error || e.message);
    });
    let simulation = null;
    let mapManager = null;
    let routeData = [];

    const getElement = (id) => {
        const el = document.getElementById(id);
        if (!el) console.error(`Element with ID '${id}' not found.`);
        return el;
    };

    const playPauseBtn = getElement('playPauseBtn');
    const resetBtn = getElement('resetBtn');
    const speedSlider = getElement('speedSlider');
    const speedValue = getElement('speedValue');
    const showRouteCheckbox = getElement('showRouteCheckbox');
    const currentPositionEl = getElement('currentPosition');
    const timestampEl = getElement('timestamp');
    const speedEl = getElement('speed');
    const distanceEl = getElement('distanceTraveled');

    fetch('dummy-route.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length < 2) {
                throw new Error('Route data is not a valid array or has too few points.');
            }
            routeData = data.map(point => ({ lat: point.latitude, lng: point.longitude }));
            routeData = routeData.slice(0, 12);
            
            try {
                setupSimulationAndManager();
                setupControls();
                console.log('Controls wired successfully');
            } catch (err) {
                console.error('Error during setup:', err);
            }
        })
        .catch(error => {
            console.error('Error loading or processing route data:', error);
            alert('Failed to load route data. Please check the console for details.');
        });

    function setupSimulationAndManager() {
        simulation = new VehicleSimulation(routeData);
        mapManager = new MapManager('map', simulation);

        mapManager.reset(routeData);
        updateInfoPanel(simulation.getState());

        simulation.on('update', (state) => {
            try {
                updateInfoPanel(state);
            } catch (err) {
                console.error('Error updating info panel:', err, state);
            }
        });
    }

    function setupControls() {
        if (!playPauseBtn || !resetBtn || !speedSlider || !showRouteCheckbox) {
            console.error('One or more control elements are missing. Cannot set up controls.');
            return;
        }

        playPauseBtn.onclick = (e) => {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            if (simulation.isMoving) {
                simulation.pause();
                playPauseBtn.innerHTML = '▶️ Play';
                playPauseBtn.classList.remove('pause');
            } else {
                simulation.start();
                playPauseBtn.innerHTML = '⏸️ Pause';
                playPauseBtn.classList.add('pause');
            }
        };

        resetBtn.onclick = (e) => {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            simulation.reset();
            mapManager.reset(routeData);
            playPauseBtn.innerHTML = '▶️ Play';
            playPauseBtn.classList.remove('pause');
        };

        speedSlider.oninput = () => {
            const speed = parseFloat(speedSlider.value);
            simulation.setSpeed(speed);
            if(speedValue) speedValue.textContent = `${speed}x`;
        };
        if(speedValue) speedValue.textContent = `${speedSlider.value}x`;
        simulation.setSpeed(parseFloat(speedSlider.value));


        showRouteCheckbox.onchange = (e) => {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            if (mapManager.routePolyline) {
                if (showRouteCheckbox.checked) {
                    mapManager.routePolyline.addTo(mapManager.map);
                } else {
                    mapManager.map.removeLayer(mapManager.routePolyline);
                }
            }
        };
    }

    function updateInfoPanel(state) {
        if(currentPositionEl) currentPositionEl.textContent = `${state.position.lat.toFixed(6)}, ${state.position.lng.toFixed(6)}`;
        if(timestampEl) timestampEl.textContent = new Date().toLocaleString();
        if(speedEl) speedEl.textContent = `${state.speedKmh.toFixed(2)} km/h`;
        if(distanceEl) distanceEl.textContent = `${state.distanceTraveled.toFixed(3)} km`;
    }
});
