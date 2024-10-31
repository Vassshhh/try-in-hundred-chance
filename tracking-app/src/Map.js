import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import blueDot from "./bluedot.png"; // Update with the path to your marker image

const Map = ({ setIsStarted }) => {
  const [position, setPosition] = useState(null);
  const [track, setTrack] = useState([]); // Store track based on user movement
  const [nearestRoad, setNearestRoad] = useState(null);
  const [steps, setSteps] = useState(0); // Counter for steps
  const [totalDistance, setTotalDistance] = useState(0); // Total distance in meters
  const radius = 30; // 30 meters
  const mapRef = useRef(); // Reference for the map
  const lastPosition = useRef(null); // Reference to store last position for distance calculation

  const homePosition = [51.505, -0.09]; // Beranda atau posisi awal peta

  useEffect(() => {
    const watchPosition = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = [latitude, longitude];
        setPosition(newPosition);

        // Set the map's view to the user's current position and zoom in
        if (mapRef.current) {
          mapRef.current.setView(newPosition, 18); // Zoom level can be adjusted
        }

        // Append the new position to the track
        setTrack((prevTrack) => [...prevTrack, newPosition]);

        // Calculate distance if last position exists
        if (lastPosition.current) {
          const distance = calculateDistance(lastPosition.current, newPosition);
          setTotalDistance((prevDistance) => prevDistance + distance);
        }

        // Update last position
        lastPosition.current = newPosition;
      },
      (error) => {
        console.error("Error getting position:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    const handleMotionEvent = (event) => {
      const acc = event.accelerationIncludingGravity;
      const totalAcceleration = Math.sqrt(
        acc.x * acc.x + acc.y * acc.y + acc.z * acc.z
      );

      if (totalAcceleration > 1.2) {
        setSteps((prevSteps) => prevSteps + 1);
      }
    };

    window.addEventListener("devicemotion", handleMotionEvent);

    return () => {
      navigator.geolocation.clearWatch(watchPosition); // Clean up geolocation
      window.removeEventListener("devicemotion", handleMotionEvent); // Clean up motion event
    };
  }, []);

  const calculateDistance = (pos1, pos2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const lat1 = pos1[0];
    const lon1 = pos1[1];
    const lat2 = pos2[0];
    const lon2 = pos2[1];
    const R = 6371e3;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance;
  };

  useEffect(() => {
    if (position) {
      const fetchNearestRoad = async () => {
        const [lat, lng] = position;
        const query = `
          [out:json];
          (
            way["highway"](around:${radius}, ${lat}, ${lng});
          );
          out body;
        `;
        try {
          const response = await axios.get(
            `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
              query
            )}`
          );
          const roads = response.data.elements;

          if (roads.length > 0) {
            const nearest = roads[0];
            const coords = nearest.geometry.map((pt) => [pt.lat, pt.lon]);
            setNearestRoad(coords);

            setTrack((prevTrack) => [...prevTrack, coords[0]]);
          }
        } catch (error) {
          console.error("Error fetching nearest road:", error);
        }
      };

      fetchNearestRoad();
    }
  }, [position]);

  const handleMarkerClick = () => {
    console.log("Marker clicked:", position);
    if (mapRef.current && position) {
      mapRef.current.setView(position, 18);
    }
  };

  const handleBackToHome = () => {
    if (mapRef.current) {
      mapRef.current.setView(homePosition, 13); // Mengatur tampilan peta ke posisi beranda
    }
  };

  return (
    <>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#fff",
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
        }}
      >
        <p>Total Steps: {steps}</p>
        <p>Total Distance: {(totalDistance / 1000).toFixed(2)} km</p>
        <button class="bt" onClick={() => setIsStarted(false)}>
          Kembali ke Beranda
        </button>
      </div>

      <MapContainer
        center={homePosition}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {position && (
          <Marker
            position={position}
            icon={L.icon({
              iconUrl: blueDot,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
            eventHandlers={{ click: handleMarkerClick }}
          />
        )}
        {position && <Circle center={position} radius={radius} />}
        {nearestRoad && <Polyline positions={nearestRoad} color="blue" />}
        {track.length > 0 && <Polyline positions={track} color="red" />}
      </MapContainer>
    </>
  );
};

export default Map;
