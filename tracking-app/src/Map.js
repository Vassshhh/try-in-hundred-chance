import React, { useEffect, useState } from "react";
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

const Map = () => {
  const [position, setPosition] = useState(null);
  const [track, setTrack] = useState([]); // Store track based on the nearest road marker
  const [nearestRoad, setNearestRoad] = useState(null);
  const radius = 30; // 30 meters

  useEffect(() => {
    const watchPosition = navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude } = position.coords;
      setPosition([latitude, longitude]);
    });

    return () => navigator.geolocation.clearWatch(watchPosition); // Clean up when component unmounts
  }, []);

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

            // Add the nearest road marker to the track
            setTrack((prevTrack) => [...prevTrack, coords[0]]); // Store the first point of the nearest road
          }
        } catch (error) {
          console.error("Error fetching nearest road:", error);
        }
      };

      fetchNearestRoad();
    }
  }, [position]);

  return (
    <MapContainer
      center={position || [51.505, -0.09]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
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
        />
      )}
      {position && <Circle center={position} radius={radius} />}
      {nearestRoad && <Polyline positions={nearestRoad} color="blue" />}
      {track.length > 0 && <Polyline positions={track} color="red" />}{" "}
      {/* Add track based on nearest road marker */}
    </MapContainer>
  );
};

export default Map;
