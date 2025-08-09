class VehicleSimulation {
    constructor(route, onUpdate) {
        if (!Array.isArray(route) || route.length < 2) {
            console.error("Invalid route data provided to VehicleSimulation. Route must be an array with at least two points.");
            this.route = [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }];
        } else {
            this.route = route;
        }

        this.onUpdate = onUpdate;
        this.listeners = {};

        this.speed = 1;
        this.reset();
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        console.log(`Emitting event: ${event}`, data);
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
        if (this.onUpdate && event === 'update') {
            this.onUpdate(data);
        }
    }

    start() {
        if (this.isMoving || this.isFinished()) return;
        this.isMoving = true;
        this.lastTimestamp = performance.now();
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    pause() {
        this.isMoving = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    reset() {
        this.pause();
        this.currentIndex = 0;
        this.distanceAlongSegment = 0;
        this.distanceTraveled = 0;
        this.currentPosition = this.route[0] || { lat: 0, lng: 0 };
        this.bearing = this.calculateBearing(this.route[0], this.route[1]);
        this.emit('update', this.getState());
    }

    setSpeed(speedMultiplier) {
        this.speed = speedMultiplier;
    }

    isFinished() {
        return this.currentIndex >= this.route.length - 1;
    }

    animate() {
        if (!this.isMoving) return;

        const now = performance.now();
        const delta = (now - this.lastTimestamp) / 1000;
        this.lastTimestamp = now;

        this.updatePosition(delta);

        if (!this.isFinished()) {
            this.animationFrameId = requestAnimationFrame(() => this.animate());
        } else {
            this.pause();
        }
    }

    updatePosition(delta) {
        if (this.isFinished()) return;

        const baseSpeed = 10;
        let distanceToMove = this.speed * baseSpeed * delta;

        this.distanceTraveled += distanceToMove;
        this.distanceAlongSegment += distanceToMove;

        let segmentStart = this.route[this.currentIndex];
        let segmentEnd = this.route[this.currentIndex + 1];
        let segmentLength = this.haversine(segmentStart, segmentEnd);

        while (segmentLength === 0 && !this.isFinished()) {
            this.currentIndex++;
            if (this.isFinished()) {
                this.currentPosition = this.route[this.route.length - 1];
                this.emit('update', this.getState());
                return;
            }
            segmentStart = this.route[this.currentIndex];
            segmentEnd = this.route[this.currentIndex + 1];
            segmentLength = this.haversine(segmentStart, segmentEnd);
        }

        while (this.distanceAlongSegment >= segmentLength && !this.isFinished()) {
            this.distanceAlongSegment -= segmentLength;
            this.currentIndex++;

            if (this.isFinished()) {
                this.currentPosition = this.route[this.route.length - 1];
                this.distanceAlongSegment = 0;
                this.emit('update', this.getState());
                return;
            }

            segmentStart = this.route[this.currentIndex];
            segmentEnd = this.route[this.currentIndex + 1];
            segmentLength = this.haversine(segmentStart, segmentEnd);
        }

        const fraction = segmentLength > 0 ? (this.distanceAlongSegment / segmentLength) : 1;
        this.currentPosition = {
            lat: segmentStart.lat + (segmentEnd.lat - segmentStart.lat) * fraction,
            lng: segmentStart.lng + (segmentEnd.lng - segmentStart.lng) * fraction
        };

        this.bearing = this.calculateBearing(segmentStart, segmentEnd);

        this.emit('update', this.getState());
    }

    getState() {
        return {
            position: this.currentPosition,
            bearing: this.bearing,
            speedKmh: this.speed * 10 * 3.6,
            distanceTraveled: this.distanceTraveled / 1000
        };
    }

    haversine(p1, p2) {
        if (!p1 || !p2) return 0;
        const R = 6371e3;
        const φ1 = p1.lat * Math.PI / 180;
        const φ2 = p2.lat * Math.PI / 180;
        const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
        const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    calculateBearing(p1, p2) {
        if (!p1 || !p2) return 0;
        const φ1 = p1.lat * Math.PI / 180;
        const φ2 = p2.lat * Math.PI / 180;
        const λ1 = p1.lng * Math.PI / 180;
        const λ2 = p2.lng * Math.PI / 180;

        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                  Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        const θ = Math.atan2(y, x);
        return (θ * 180 / Math.PI + 360) % 360; // in degrees
    }
}
