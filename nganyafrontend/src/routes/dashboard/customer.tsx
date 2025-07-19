// src/pages/customer/CustomerDashboard.tsx
import { MapView } from "@/components/MapView";
import { BookingPanel } from "@/components/BookingPanel";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";

// ⭐ UPDATED: Define the search parameters interface to store only geometry coordinates ⭐
interface CustomerDashboardSearch {
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  geometryCoordinates?: [number, number][]; // ⭐ Changed from 'geometry' to 'geometryCoordinates' ⭐
  distance?: number;
  duration?: number;
  instructions?: any[];
}

export const Route = createFileRoute('/dashboard/customer')({
  component: CustomerDashboard,
  // ⭐ UPDATED: Define the search schema for type safety and defaults, handling geometryCoordinates ⭐
  validateSearch: (search: Record<string, unknown>): CustomerDashboardSearch => {
    return {
      pickupLat: typeof search.pickupLat === 'number' ? search.pickupLat : undefined,
      pickupLng: typeof search.pickupLng === 'number' ? search.pickupLng : undefined,
      destinationLat: typeof search.destinationLat === 'number' ? search.destinationLat : undefined,
      destinationLng: typeof search.destinationLng === 'number' ? search.destinationLng : undefined,
      // ⭐ UPDATED: Validate geometryCoordinates as an array ⭐
      geometryCoordinates: Array.isArray(search.geometryCoordinates) ? search.geometryCoordinates as [number, number][] : undefined,
      distance: typeof search.distance === 'number' ? search.distance : undefined,
      duration: typeof search.duration === 'number' ? search.duration : undefined,
      instructions: Array.isArray(search.instructions) ? search.instructions : undefined,
    };
  },
})

export function CustomerDashboard() {
  const routeSearch = useSearch({ from: '/dashboard/customer' });
  const navigate = useNavigate();

  // ⭐ UPDATED: Function to update route data in the URL search parameters, passing only coordinates ⭐
  const setRouteData = (data: {
    pickupLat?: number;
    pickupLng?: number;
    destinationLat?: number;
    destinationLng?: number;
    geometry?: { coordinates: [number, number][] }; // Expecting geometry with coordinates
    distance?: number;
    duration?: number;
    instructions?: any[];
  } | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        pickupLat: data?.pickupLat,
        pickupLng: data?.pickupLng,
        destinationLat: data?.destinationLat,
        destinationLng: data?.destinationLng,
        geometryCoordinates: data?.geometry?.coordinates, // ⭐ Pass only the coordinates array ⭐
        distance: data?.distance,
        duration: data?.duration,
        instructions: data?.instructions,
      }),
      replace: true,
    });
  };

  // ⭐ UPDATED: Convert routeSearch data to the format expected by MapView ⭐
  const mapRouteData = routeSearch.pickupLat !== undefined && routeSearch.pickupLng !== undefined &&
                       routeSearch.destinationLat !== undefined && routeSearch.destinationLng !== undefined &&
                       routeSearch.geometryCoordinates
    ? {
        start: { lat: routeSearch.pickupLat, lon: routeSearch.pickupLng },
        end: { lat: routeSearch.destinationLat, lon: routeSearch.destinationLng },
        geometry: {
          type: 'LineString', // Assuming it's always a LineString for a route
          coordinates: routeSearch.geometryCoordinates,
        },
        distance: routeSearch.distance || 0,
        duration: routeSearch.duration || 0,
        instructions: routeSearch.instructions || [],
      }
    : null;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="customer" />

      <div className="flex-1 lg:ml-0">
        <div className="h-screen flex relative">
          {/* Map View - Full screen on mobile, left side on desktop */}
          <div className="flex-1 relative">
            {/* Pass mapRouteData to MapView */}
            <MapView routeData={mapRouteData} />

            {/* Mobile booking panel - slides up from bottom */}
            <div className="absolute bottom-0 left-0 right-0 lg:hidden">
              {/* Pass setRouteData to BookingPanel */}
              <BookingPanel setRouteData={setRouteData} />
            </div>

            {/* Status bar and quick actions for mobile */}
            <div className="lg:hidden absolute top-4 left-4 right-4 z-40 space-y-4">
              {/* Status bar */}
              <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    All Systems Online
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    12 drivers nearby • Avg wait: 3 min {/* This is mock data, could be dynamic */}
                  </p>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-lg">🚗</span>
                    </div>
                    <span className="text-xs font-medium">Book Ride</span>
                    <span className="text-xs text-muted-foreground">
                      From $8
                    </span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-lg">👥</span>
                    </div>
                    <span className="text-xs font-medium">Share Ride</span>
                    <span className="text-xs text-muted-foreground">
                      Save 60%
                    </span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-lg">📦</span>
                    </div>
                    <span className="text-xs font-medium">Send Package</span>
                    <span className="text-xs text-muted-foreground">
                      Same day
                    </span>
                  </button>
                </div>

                {/* Get Started for new users */}
                <button
                  onClick={() => {}}
                  className="w-full p-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-md transition-all"
                >
                  New User? Get Started →
                </button>
              </div>
            </div>
          </div>

          {/* Desktop booking panel - fixed right sidebar */}
          <div className="hidden lg:block w-96 border-l border-border bg-background">
            <div className="p-4 h-full">
              {/* Pass setRouteData to BookingPanel */}
              <BookingPanel setRouteData={setRouteData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
