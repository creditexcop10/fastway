"use client";

import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function createVehicleIcon(freightType: string) {
  const iconMap: Record<string, string> = {
    air: "✈️",
    sea: "🚢",
    road: "🚚",
    courier: "📦",
  };
  const emoji = iconMap[freightType] || "📦";
  return L.divIcon({
    html: `<div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); animation: bounce 1s infinite alternate;">${emoji}</div>`,
    className: "vehicle-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function createOriginIcon() {
  return L.divIcon({
    html: `<div style="width: 24px; height: 24px; background: #22c55e; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    className: "origin-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createDestinationIcon() {
  return L.divIcon({
    html: `<div style="width: 24px; height: 24px; background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    className: "destination-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createCheckpointIcon() {
  return L.divIcon({
    html: `<div style="width: 16px; height: 16px; background: #ff5e02; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(255,94,2,0.5); animation: pulse-ring 1.5s infinite;"></div>`,
    className: "checkpoint-marker",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [positions, map]);
  return null;
}

interface ShipmentMapProps {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  status: string;
  freightType: string;
  checkpoints?: Array<{ lat: number; lng: number; location: string; status: string }>;
}

export function ShipmentMap({ originLat, originLng, destLat, destLng, status, freightType, checkpoints = [] }: ShipmentMapProps) {
  const origin: [number, number] = [originLat, originLng];
  const destination: [number, number] = [destLat, destLng];

  // Filter valid checkpoints (with coords), already sorted desc by timestamp
  const validCheckpoints = checkpoints.filter(cp => cp.lat && cp.lng);

  // ===== FIXED VEHICLE POSITION LOGIC =====
  // Status takes priority over checkpoint position
  let vehiclePos: [number, number];

  if (status === "delivered") {
    // Delivered → vehicle is at destination, no matter what
    vehiclePos = destination;
  } else if (status === "pending" || status === "cancelled") {
    // Pending → vehicle is at origin
    vehiclePos = origin;
  } else if (validCheckpoints.length > 0) {
    // Has checkpoints → use the most recent one
    vehiclePos = [validCheckpoints[0].lat, validCheckpoints[0].lng];
  } else {
    // No checkpoints → estimate based on status
    const progressMap: Record<string, number> = {
      picked_up: 0.15,
      in_transit: 0.5,
      out_for_delivery: 0.85,
    };
    const progress = progressMap[status] ?? 0.15;
    vehiclePos = [
      origin[0] + (destination[0] - origin[0]) * progress,
      origin[1] + (destination[1] - origin[1]) * progress,
    ];
  }

  // Build the full route: origin → checkpoints (reversed to chronological) → destination
  const routePoints: [number, number][] = [origin];
  const chronologicalCheckpoints = [...validCheckpoints].reverse();
  chronologicalCheckpoints.forEach(cp => {
    routePoints.push([cp.lat, cp.lng]);
  });
  routePoints.push(destination);

  // All positions for fit bounds
  const allPositions = [...routePoints, vehiclePos];

  // Split route into completed and remaining based on vehicle position
  const completedRoute: [number, number][] = [];
  const remainingRoute: [number, number][] = [];

  // Find where the vehicle is in the route
  let vehicleIndex = -1;
  for (let i = 0; i < routePoints.length; i++) {
    if (routePoints[i][0] === vehiclePos[0] && routePoints[i][1] === vehiclePos[1]) {
      vehicleIndex = i;
      break;
    }
  }

  if (vehicleIndex === -1) {
    // Vehicle is between points — draw everything as completed up to the closest point
    completedRoute.push(origin, vehiclePos);
    remainingRoute.push(vehiclePos, destination);
  } else {
    // Draw completed route up to vehicle
    for (let i = 0; i < vehicleIndex; i++) {
      completedRoute.push(routePoints[i], routePoints[i + 1]);
    }
    // Draw remaining route from vehicle to destination
    for (let i = vehicleIndex; i < routePoints.length - 1; i++) {
      remainingRoute.push(routePoints[i], routePoints[i + 1]);
    }
  }

  return (
    <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-border shadow-lg">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-4px); }
        }
        .leaflet-container {
          background: #1b3e69;
        }
        .leaflet-tile {
          filter: brightness(0.9) contrast(1.1) saturate(0.85);
        }
      `}</style>
      
      <MapContainer
        center={origin}
        zoom={5}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        {/* Completed route (solid orange) */}
        {completedRoute.length > 0 && (
          <Polyline
            positions={completedRoute}
            pathOptions={{ color: "#ff5e02", weight: 3, opacity: 0.8 }}
          />
        )}
        
        {/* Remaining route (dashed gray) */}
        {remainingRoute.length > 0 && (
          <Polyline
            positions={remainingRoute}
            pathOptions={{ color: "#94a3b8", weight: 2, opacity: 0.6, dashArray: "10 10" }}
          />
        )}
        
        {/* Origin marker */}
        <Marker position={origin} icon={createOriginIcon()} />
        
        {/* Destination marker */}
        <Marker position={destination} icon={createDestinationIcon()} />
        
        {/* Checkpoint markers (airports, customs, etc.) */}
        {validCheckpoints.map((cp, i) => (
          <Marker 
            key={i} 
            position={[cp.lat, cp.lng]} 
            icon={createCheckpointIcon()} 
          />
        ))}
        
        {/* Vehicle marker */}
        <Marker position={vehiclePos} icon={createVehicleIcon(freightType)} />
        
        <FitBounds positions={allPositions} />
      </MapContainer>

      {/* Status badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-background/90 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-lg">
        <span className="text-xs sm:text-sm font-bold text-primary capitalize">
          {status.replace("_", " ")}
        </span>
      </div>

      {/* Freight type badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-background/90 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 shadow-lg">
        <span className="text-xs sm:text-sm font-bold text-accent capitalize">
          {freightType} Freight
        </span>
      </div>
    </div>
  );
}