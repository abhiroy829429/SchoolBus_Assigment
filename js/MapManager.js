class MapManager {
    constructor(mapId, vehicleSimulation) {
        this.map = L.map(mapId).setView([17.3850, 78.4867], 13);
        this.vehicleMarker = null;
        this.routePolyline = null;
        this.originalRoute = [];
        this.vehicleSimulation = vehicleSimulation;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            
        }).addTo(this.map);

        this.vehicleIcon = L.divIcon({
            className: 'vehicle-icon',
            html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30"><path d="M0 0h24v24H0z" fill="none"/><path fill="#ff7800" stroke="#000" stroke-width="0.5" d="M20 8h-3V4H7v4H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h8v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zM7.5 16c-.83 0-1.5-.67-1.5-1.5S6.67 13 7.5 13s1.5.67 1.5 1.5S8.33 16 7.5 16zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM4 11h16v1H4v-1z"/></svg>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        this.vehicleSimulation.on('update', (state) => {
            this.updateVehicleState(state);
        });
    }

    drawRoute(route) {
        this.originalRoute = route;
        if (this.routePolyline) {
            this.map.removeLayer(this.routePolyline);
        }
        this.routePolyline = L.polyline(route, { color: 'green', weight: 5 }).addTo(this.map);
        this.map.fitBounds(this.routePolyline.getBounds());
    }

    reset(route) {
        if (!route || route.length === 0) return;

        if (this.vehicleMarker) {
            this.map.removeLayer(this.vehicleMarker);
        } else {
              this.map.setView(route[0], 16);
        }

        this.createVehicleMarker(route[0]);
        this.drawRoute(route);
    }

    createVehicleMarker(position) {
        const vehicleIcon = L.divIcon({
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff7800" width="30px" height="30px"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 8h-3V4H7v4H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h8v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zM7.5 16c-.83 0-1.5-.67-1.5-1.5S6.67 13 7.5 13s1.5.67 1.5 1.5S8.33 16 7.5 16zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM4 11h16v1H4v-1z"/></svg>`,
            className: 'vehicle-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });

        this.vehicleMarker = L.marker(position, { icon: vehicleIcon });
        this.vehicleMarker.addTo(this.map);

        if (!this.map.hasLayer(this.vehicleMarker)) {
            this.vehicleMarker.addTo(this.map);
            console.log('Marker re-added to map.');
        }

        const mapBounds = this.map.getBounds();
        if (!mapBounds.contains(position)) {
            console.warn('Marker position is outside of map bounds:', position);
        }

        if (!this.vehicleMarker) {
            console.error('Failed to create vehicle marker.');
        } else {
            console.log('Vehicle marker created at:', this.vehicleMarker.getLatLng());
        }

        if (position.lat === 0 && position.lng === 0) {
            console.error('Invalid position detected:', position);
        }
    }

    updateVehicleState(state) {
        try {
            console.log('Updating vehicle state:', state);
            // If marker doesn't exist or is not on the map, re-create it
            let needsRecreate = false;
            if (!this.vehicleMarker) {
                needsRecreate = true;
            } else {
                // Check if marker element is present in DOM (sometimes Leaflet removes it)
                const iconElement = this.vehicleMarker.getElement();
                if (!iconElement || !iconElement.parentNode) {
                    // Remove reference and mark for recreation
                    this.vehicleMarker = null;
                    needsRecreate = true;
                }
            }
            console.log('Current marker position:', this.vehicleMarker ? this.vehicleMarker.getLatLng() : 'No marker');
            console.log('Marker needs recreation:', needsRecreate);
            if (needsRecreate) {
                this.createVehicleMarker(state.position);
            }

            const { position, bearing } = state;
            this.vehicleMarker.setLatLng(position);

            const iconEl = this.vehicleMarker.getElement();
            if (iconEl) {
                // IMPORTANT: Do NOT set transform on the marker container – Leaflet uses it for positioning.
                const svg = iconEl.querySelector('svg');
                if (svg) {
                    svg.style.transform = `rotate(${bearing}deg)`;
                }
            }

            this.updateRouteView(position);
        } catch (err) {
            console.error('Error updating vehicle state:', err);
        }
    }

    updateRouteView(currentPosition) {
        try {
            if (!this.routePolyline || !this.originalRoute || this.originalRoute.length < 2) return;

            const p = L.latLng(currentPosition.lat, currentPosition.lng);
            const pts = this.originalRoute.map(r => L.latLng(r.lat, r.lng));

            const map = this.map;
            const dist2 = (a, b) => {
                const pa = map.project(a, map.getZoom());
                const pb = map.project(b, map.getZoom());
                const dx = pa.x - pb.x; const dy = pa.y - pb.y;
                return dx * dx + dy * dy;
            };

            let best = { idx: 0, t: 0, q: pts[0], d2: dist2(p, pts[0]) };
            for (let i = 0; i < pts.length - 1; i++) {
                const a = pts[i];
                const b = pts[i + 1];
                const pa = map.project(a, map.getZoom());
                const pb = map.project(b, map.getZoom());
                const pp = map.project(p, map.getZoom());
                const abx = pb.x - pa.x, aby = pb.y - pa.y;
                const apx = pp.x - pa.x, apy = pp.y - pa.y;
                const ab2 = abx * abx + aby * aby;
                const t = ab2 === 0 ? 0 : Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
                const qx = pa.x + t * abx, qy = pa.y + t * aby;
                const d2pq = (pp.x - qx) * (pp.x - qx) + (pp.y - qy) * (pp.y - qy);
                if (d2pq <= best.d2) {
                    const qLatLng = map.unproject(L.point(qx, qy), map.getZoom());
                    best = { idx: i, t, q: qLatLng, d2: d2pq };
                }
            }

            const remaining = [best.q];
            for (let j = best.idx + 1; j < pts.length; j++) remaining.push(pts[j]);

            if (remaining.length >= 2) {
                this.routePolyline.setLatLngs(remaining);
            } else if (this.map.hasLayer(this.routePolyline)) {
                this.map.removeLayer(this.routePolyline);
            }
        } catch (err) {
            console.error('Error updating route view:', err);
        }
    }
}
