// src/components/MapView.tsx
import React, { useEffect, useRef } from "react";
import { Car, Navigation2, Clock, MapPin, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import L from "leaflet"; // Keep this import for L.LatLngTuple and other Leaflet types/utilities
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";


interface MapViewProps {
  routeData: {
    start: { lat: number; lon: number };
    end: { lat: number; lon: number };
    geometry: {
      type: string;
      coordinates: [number, number][];
    };
    distance: number;
    duration: number;
    instructions: any[];
  } | null;
}

// Component to update map view based on route data
function MapUpdater({ routeData }: MapViewProps) {
  const map = useMap();

  useEffect(() => {
    if (routeData) {
      const startLatLon: L.LatLngTuple = [routeData.start.lat, routeData.start.lon];
      const endLatLon: L.LatLngTuple = [routeData.end.lat, routeData.end.lon];

      // Fit map to bounds of start and end points
      const bounds = L.latLngBounds([startLatLon, endLatLon]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeData, map]);

  return null;
}

export function MapView({ routeData }: MapViewProps) {
  // Default map center (e.g., Nairobi, Kenya)
  const defaultCenter: L.LatLngTuple = [1.2921, 36.8219];
  const defaultZoom = 13;

  const pathCoordinates: L.LatLngTuple[] = routeData?.geometry.coordinates.map(
    (coord) => [coord[1], coord[0]], // OSRM returns [lon, lat], Leaflet expects [lat, lon]
  ) || [];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routeData && (
          <>
            <Marker position={[routeData.start.lat, routeData.start.lon]} />
            <Marker position={[routeData.end.lat, routeData.end.lon]} />
            <Polyline
              positions={pathCoordinates}
              color="blue"
              weight={5}
              opacity={0.7}
            />
            <MapUpdater routeData={routeData} />
          </>
        )}

        {/* Mock vehicles and current location pins (keep for visual consistency) */}
        {/* These mock markers can stay, as their positions are hardcoded. */}
        {/* <Marker position={[1.295, 36.81]}>
          <L.Popup>John • Economy • $12</L.Popup>
        </Marker>

        <Marker position={[1.28, 36.83]}>
          <L.Popup>Sarah • Premium • $18</L.Popup>
        </Marker>

        <Marker position={[1.30, 36.85]}>
          <L.Popup>Mike • Busy</L.Popup>
        </Marker>

        <Marker position={[1.27, 36.80]}>
          <L.Popup>David • Luxury • $35</L.Popup>
        </Marker>

        <Marker position={[1.285, 36.82]}>
          <L.Popup>Shared Ride • 2 seats • $6</L.Popup>
        </Marker>

        <Marker position={[1.2921, 36.8219]} /> */}
      </MapContainer>

      {/* Map controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <Button size="icon" variant="outline" className="bg-white shadow-lg">
          <Navigation2 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" className="bg-white shadow-lg">
          <span className="text-lg font-bold">+</span>
        </Button>
        <Button size="icon" variant="outline" className="bg-white shadow-lg">
          <span className="text-lg font-bold">-</span>
        </Button>
      </div>
    </div>
  );
}