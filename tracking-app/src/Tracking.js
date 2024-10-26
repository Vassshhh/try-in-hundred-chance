// src/Tracking.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import './Tracking.css'; // Import a CSS file for styling

// Helper function to calculate haversine distance
const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
    const toRad = (angle) => (Math.PI / 180) * angle;
    const R = 6371e3; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const Tracking = () => {
    const [position, setPosition] = useState(null);
    const [track, setTrack] = useState([]);
    const [trailMarkers, setTrailMarkers] = useState([]);
    const [isTracking, setIsTracking] = useState(false);
    const [distance, setDistance] = useState(0);
    const [steps, setSteps] = useState(0);
    const markerInterval = 50; // Marker every 50 meters

    const startTracking = () => {
        setIsTracking((prevTracking) => !prevTracking);
        if (!isTracking) {
            // Reset states when starting tracking
            setTrack([]);
            setTrailMarkers([]);
            setDistance(0);
            setSteps(0);
        }
    };

    useEffect(() => {
        let previousPosition = null;
        let accumulatedDistance = 0;
        let watchId;

        const handleLocation = (event) => {
            const { latitude, longitude } = event.coords;
            const currentPosition = [latitude, longitude];
            setPosition(currentPosition);
            setTrack((prevTrack) => [...prevTrack, currentPosition]);

            if (previousPosition) {
                const segmentDistance = haversineDistance(previousPosition, currentPosition);
                setDistance((prevDistance) => prevDistance + segmentDistance);
                accumulatedDistance += segmentDistance;
                setSteps((prevSteps) => prevSteps + Math.floor(segmentDistance / 0.8));

                if (accumulatedDistance >= markerInterval) {
                    setTrailMarkers((prevMarkers) => [...prevMarkers, currentPosition]);
                    accumulatedDistance = 0;
                }
            }
            previousPosition = currentPosition;
        };

        const handleError = (error) => {
            console.error("Geolocation error:", error);
        };

        if (isTracking) {
            watchId = navigator.geolocation.watchPosition(handleLocation, handleError, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            });
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isTracking]);

    return (
        <div className="tracking-container">
            <button className="track-btn" onClick={startTracking}>
                {isTracking ? 'Stop' : 'Start'} Tracking
            </button>
            <div className="info-panel">
                <p><strong>Distance:</strong> {distance.toFixed(2)} meters</p>
                <p><strong>Steps:</strong> {steps}</p>
            </div>
            <MapContainer center={[0, 0]} zoom={2} className="map-container">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {position && (
                    <Marker
                        position={position}
                        icon={new L.Icon({
                            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                            iconSize: [30, 45],
                            iconAnchor: [15, 45],
                        })}
                    />
                )}
                {track.length > 0 && <Polyline positions={track} color="blue" />}
                {trailMarkers.map((markerPos, index) => (
                    <Marker
                        key={index}
                        position={markerPos}
                        icon={new L.Icon({
                            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-red.png',
                            iconSize: [20, 30],
                            iconAnchor: [10, 30],
                        })}
                    />
                ))}
            </MapContainer>
        </div>
    );
};

export default Tracking;
