// src/components/BookingPanel.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  ArrowUpDown,
  Clock,
  Users,
  Filter,
  DollarSign,
  Zap,
  Share2,
  Loader2,
  MessageSquare, // Import MessageSquare icon
  Car, // Import Car icon for suggested drivers section
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { VehicleCard } from './VehicleCard'; // Assuming this component exists or will be created
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import debounce from 'lodash.debounce';

// ⭐ Mock rideshareService for demonstration purposes within this single file context ⭐
// In a real application, this would be a separate service file (e.g., src/lib/rideshare-service.ts)
// that encapsulates API calls to your backend.
const API_BASE_URL = 'http://localhost:3001';

const mockRideshareService = {
  // This method orchestrates calls to backend geocoding, routing, and driver finding endpoints
  getSuggestedDriversAndRoute: async (pickupAddress: string, destinationAddress: string) => {
    // ⭐ MODIFIED: Send addresses directly to /route/calculate, as per backend's expectation ⭐
    const routeResponse = await fetch(`${API_BASE_URL}/route/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup: pickupAddress, // Send pickup address string
        dropoff: destinationAddress, // Send dropoff address string
      }),
    }).then(res => {
      if (!res.ok) throw new Error(`Route calculation failed: ${res.statusText}`);
      return res.json();
    });

    if (!routeResponse || !routeResponse.geometry) {
      throw new Error('Could not calculate route.');
    }

    // Use the geocoded coordinates returned by the backend's /route/calculate endpoint
    const pickupLat = routeResponse.start.lat;
    const pickupLng = routeResponse.start.lon;
    const destinationLat = routeResponse.end.lat;
    const destinationLng = routeResponse.end.lon;

    // ⭐ NEW: Frontend validation and logging of parsed coordinates (from backend response) ⭐
    console.log('Parsed Pickup Coords from backend:', { pickupLat, pickupLng });
    console.log('Parsed Destination Coords from backend:', { destinationLat, destinationLng });

    if (isNaN(pickupLat) || isNaN(pickupLng)) {
      throw new Error(`Invalid pickup coordinates from backend: lat=${routeResponse.start.lat}, lon=${routeResponse.start.lon}`);
    }
    if (isNaN(destinationLat) || isNaN(destinationLng)) {
      throw new Error(`Invalid destination coordinates from backend: lat=${routeResponse.end.lat}, lon=${routeResponse.end.lon}`);
    }
    // ⭐ END NEW ⭐

    // 3. Find nearest online drivers using the pickup coordinates (now correctly obtained from routeResponse)
    const driversResponse = await fetch(`${API_BASE_URL}/users/drivers/nearest?latitude=${pickupLat}&longitude=${pickupLng}&maxDistanceKm=10&limit=5`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Assuming authentication is handled by a global interceptor or context for this API call
    }).then(res => {
      if (!res.ok) throw new Error(`Fetching nearest drivers failed: ${res.statusText}`);
      return res.json();
    });

    if (!driversResponse) {
      throw new Error('Could not find nearest drivers.');
    }

    // Combine results into the format expected by the frontend components
    return {
      route: {
        pickupLatitude: pickupLat,
        pickupLongitude: pickupLng,
        destinationLatitude: destinationLat,
        destinationLongitude: destinationLng,
        geometry: routeResponse.geometry,
        distance: routeResponse.distance, // in meters
        duration: routeResponse.duration, // in seconds
        instructions: routeResponse.instructions,
      },
      suggestedVehicles: driversResponse.map((driver: any) => {
        // Calculate a mock price based on route distance and driver's estimated time
        const baseFare = 5;
        const pricePerKm = 1.5;
        const pricePerMin = 0.2;

        const distanceKm = (routeResponse.distance || 0) / 1000;
        const durationMin = (routeResponse.duration || 0) / 60;

        const price = baseFare + distanceKm * pricePerKm + durationMin * pricePerMin;

        return {
          id: driver.assignedVehicle?.id || `mock-vehicle-${driver.id}`, // Fallback ID
          type: driver.assignedVehicle?.type || 'Standard', // Fallback type
          driver: driver, // Pass the full driver object
          price: parseFloat(price.toFixed(2)),
          estimatedTime: `${driver.distance?.toFixed(0) || '~'} min`, // Distance from backend for driver proximity
          capacity: driver.assignedVehicle?.capacity || 4, // Fallback capacity
          features: [], // Populate if available from backend
          vehicleInfo: driver.assignedVehicle ? `${driver.assignedVehicle.model} (${driver.assignedVehicle.licensePlate})` : 'N/A Vehicle',
          pickupLatitude: pickupLat,
          pickupLongitude: pickupLng,
          destinationLatitude: destinationLat,
          destinationLongitude: destinationLng,
        };
      }),
    };
  },
  // Placeholder for createRide - assuming it exists in your actual rideshareService
  createRide: async (rideData: any) => {
    const response = await fetch(`${API_BASE_URL}/rides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rideData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create ride');
    }
    return response.json();
  }
};
// ⭐ END Mock rideshareService ⭐


import type { User, CreateRideRequest } from '@/lib/types';

// ⭐ NEW Type for Suggested Vehicle from Backend (now based on User and Vehicle) ⭐
interface SuggestedVehicle {
  id: string; // Vehicle ID
  type: string; // Vehicle type (e.g., "Economy", "Premium")
  driver: User; // The driver is now a User object
  price: number; // Calculated price for this route
  estimatedTime: string; // Estimated time to pickup (e.g., "5 min")
  capacity: number;
  features?: string[];
  vehicleInfo?: string;
  // ⭐ Add coordinates for booking ⭐
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}

interface BookingPanelProps {
  // ⭐ Updated setRouteData to match the new signature from customer-dashboard ⭐
  setRouteData: (data: {
    pickupLat?: number;
    pickupLng?: number;
    destinationLat?: number;
    destinationLng?: number;
    geometry?: any;
    distance?: number;
    duration?: number;
    instructions?: any[];
  } | null) => void;
  // ⭐ NEW PROP: Chat initiation function ⭐
  onInitiateChat: (driverId: string) => void;
}

export function BookingPanel({ setRouteData, onInitiateChat }: BookingPanelProps) {
  const { user } = useAuth();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [activeTab, setActiveTab] = useState('ride');
  const [isBooking, setIsBooking] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // State to hold the final list of suggested vehicles derived from nearest drivers
  const [suggestedVehicles, setSuggestedVehicles] = useState<SuggestedVehicle[]>([]);

  // State for geocoded coordinates (to pass to useNearestDrivers)
  const [currentRouteCoordinates, setCurrentRouteCoordinates] = useState<{
    pickup: { lat: number; lng: number } | null;
    destination: { lat: number; lng: number } | null;
    distance?: number;
    duration?: number;
  } | null>(null);

  // ⭐ Debounced function for geocoding and setting coordinates ⭐
  const debouncedGeocodeAndSetCoords = useCallback(
    debounce(async (pickupAddress: string, destinationAddress: string) => {
      // ⭐ Log addresses before API call for debugging ⭐
      console.log('Attempting geocoding for:', { pickupAddress, destinationAddress });

      // ⭐ Ensure both addresses are non-empty ⭐
      if (!pickupAddress.trim() || !destinationAddress.trim()) {
        setSuggestedVehicles([]);
        setRouteData(null); // Clear route data in URL
        setCurrentRouteCoordinates(null);
        setIsCalculatingRoute(false);
        console.log('Geocoding skipped: One or both addresses are empty.');
        return;
      }

      setIsCalculatingRoute(true);
      setSuggestedVehicles([]);
      setCurrentRouteCoordinates(null); // Clear previous coords

      try {
        // ⭐ Use the combined API call from mockRideshareService ⭐
        const response = await mockRideshareService.getSuggestedDriversAndRoute(
          pickupAddress,
          destinationAddress,
        );

        // Update route data in the URL search parameters
        setRouteData({
          pickupLat: response.route.pickupLatitude,
          pickupLng: response.route.pickupLongitude,
          destinationLat: response.route.destinationLatitude,
          destinationLng: response.route.destinationLongitude,
          geometry: response.route.geometry,
          distance: response.route.distance,
          duration: response.route.duration,
          instructions: response.route.instructions,
        });

        setCurrentRouteCoordinates({
          pickup: { lat: response.route.pickupLatitude, lng: response.route.pickupLongitude },
          destination: { lat: response.route.destinationLatitude, lng: response.route.destinationLongitude },
          distance: response.route.distance,
          duration: response.route.duration,
        });

        setSuggestedVehicles(response.suggestedVehicles); // Directly use suggestedVehicles from the response

        if (response.suggestedVehicles.length > 0) {
          setSelectedVehicleId(response.suggestedVehicles[0].id); // Auto-select first
          toast({
            title: 'Route & Vehicles Found!',
            description: `Distance: ${(response.route.distance / 1000).toFixed(2)} km, Duration: ${(
              response.route.duration / 60
            ).toFixed(0)} min. ${response.suggestedVehicles.length} drivers found.`,
          });
        } else {
          toast({
            title: 'No Vehicles Found',
            description: 'No drivers available for this route currently.',
            variant: 'default',
          });
        }
      } catch (error: any) {
        console.error('Error geocoding or calculating route:', error);
        toast({
          title: 'Location Error',
          description: error.message || 'Could not calculate route. Please try again.',
          variant: 'destructive',
        });
        setSuggestedVehicles([]);
        setRouteData(null); // Clear route data in URL on error
        setCurrentRouteCoordinates(null);
      } finally {
        setIsCalculatingRoute(false);
      }
    }, 500),
    [setRouteData], // Dependency for useCallback
  );

  // Effect to trigger geocoding when inputs change
  useEffect(() => {
    // ⭐ Only trigger if both pickup and destination are non-empty ⭐
    if (pickup.trim() && destination.trim()) {
      debouncedGeocodeAndSetCoords(pickup, destination);
    } else {
      setSuggestedVehicles([]);
      setRouteData(null); // Clear route data in URL
      setCurrentRouteCoordinates(null);
    }
  }, [pickup, destination, debouncedGeocodeAndSetCoords, setRouteData]);


  const handleBooking = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to book a ride.',
        variant: 'destructive',
      });
      return;
    }

    if (!destination.trim() || !currentRouteCoordinates || !currentRouteCoordinates.pickup || !currentRouteCoordinates.destination) {
      toast({
        title: 'Location Details Missing',
        description: 'Please ensure pickup and destination are set and route is calculated.',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'ride' && !selectedVehicleId) {
      toast({
        title: 'Vehicle Selection Required',
        description: 'Please select a vehicle.',
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);
    try {
      if (activeTab === 'ride') {
        const selectedVehicleData = suggestedVehicles.find((v) => v.id === selectedVehicleId);

        if (!selectedVehicleData) {
          toast({
            title: 'Invalid Vehicle Selection',
            description: 'Please select an available vehicle.',
            variant: 'destructive',
          });
          setIsBooking(false);
          return;
        }

        // ⭐ UPDATED: Construct rideData to match the CreateRideRequest interface ⭐
        const rideData: CreateRideRequest = {
          type: selectedVehicleData.type.toLowerCase() as CreateRideRequest['type'],
          pickUpLocation: {
            lat: currentRouteCoordinates.pickup.lat,
            lng: currentRouteCoordinates.pickup.lng,
          },
          dropOffLocation: {
            lat: currentRouteCoordinates.destination.lat,
            lng: currentRouteCoordinates.destination.lng,
          },
          fare: selectedVehicleData.price, // Map estimatedPrice to fare
          passengerCount: 1, // Assuming 1 passenger for now, can be made dynamic
          driverId: selectedVehicleData.driver.id,
          vehicleId: selectedVehicleData.id,
          pickupAddress: pickup, // Pass original address for backend logging/records
          destinationAddress: destination, // Pass original address for backend logging/records
          pickupLatitude: currentRouteCoordinates.pickup.lat,
          pickupLongitude: currentRouteCoordinates.pickup.lng,
          destinationLatitude: currentRouteCoordinates.destination.lat,
          destinationLongitude: currentRouteCoordinates.destination.lng,
          estimatedPrice: selectedVehicleData.price, // Add estimatedPrice
        };

        const ride = await mockRideshareService.createRide(rideData);

        toast({
          title: 'Ride Requested!',
          description: 'Your ride has been successfully booked!',
        });

      } else {
        toast({
          title: 'Feature Not Fully Implemented',
          description: 'This feature is under development.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Unable to book ride. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const overallLoading = isCalculatingRoute; // Removed isLoadingNearestDrivers as it's part of isCalculatingRoute now

  return (
    <div className="w-full max-w-md bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6 md:hidden"></div>

        {/* Service Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ride" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Ride
            </TabsTrigger>
            <TabsTrigger value="carpool" className="flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              Share
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Send
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ride">
            <h2 className="text-xl font-bold">Book Your Ride</h2>
          </TabsContent>
          <TabsContent value="carpool">
            <h2 className="text-xl font-bold">Share a Ride</h2>
          </TabsContent>
          <TabsContent value="delivery">
            <h2 className="text-xl font-bold">Send Package</h2>
          </TabsContent>
        </Tabs>

        {/* Location inputs */}
        <div className="space-y-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-green-500" />
            <Input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="pl-10 bg-green-50 border-green-200"
              placeholder="Pickup location"
            />
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-border"></div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-primary" />
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10 bg-primary/5 border-primary/20"
              placeholder="Where to?"
            />
          </div>
          {overallLoading && (
            <Button className="w-full" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating Route & Finding Drivers...
            </Button>
          )}
        </div>

        {/* Trip options */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Now</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>1 passenger</span>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Service-specific content */}
      <div className="max-h-96 overflow-y-auto">
        <div className="p-4 space-y-3">
          {activeTab === 'ride' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-muted-foreground">Available Vehicles</h3>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Best Price
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Fastest
                  </Badge>
                </div>
              </div>
              {overallLoading ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <span>Searching for vehicles...</span>
                </div>
              ) : suggestedVehicles.length > 0 ? (
                // ⭐ NEW: Suggested Nearest Drivers Section ⭐
                <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-3 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <Car size={20} /> Suggested Drivers
                  </h3>
                  <div className="space-y-4">
                    {suggestedVehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        id={vehicle.id}
                        type={vehicle.type}
                        price={vehicle.price}
                        estimatedTime={vehicle.estimatedTime}
                        capacity={vehicle.capacity}
                        vehicleInfo={vehicle.vehicleInfo}
                        driver={{
                          id: vehicle.driver.id, // Pass driver ID
                          name: vehicle.driver.name,
                          rating: vehicle.driver.averageRating || 0,
                          image: vehicle.driver.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${vehicle.driver.email}` : '/placeholder.svg',
                          trips: vehicle.driver.totalRidesCompleted || 0,
                        }}
                        isSelected={selectedVehicleId === vehicle.id}
                        onSelect={setSelectedVehicleId}
                        onInitiateChat={onInitiateChat} // ⭐ Pass chat initiation function ⭐
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Enter pickup and destination to find available vehicles.
                </p>
              )}
            </>
          )}

          {activeTab === 'carpool' && (
            <>
              <div className="mb-3">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Available Shared Rides</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Save up to 60% by sharing!</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-muted-foreground py-10">
                Carpooling feature is under development. Stay tuned!
              </p>
            </>
          )}

          {activeTab === 'delivery' && (
            <>
              <h3 className="font-medium text-sm text-muted-foreground mb-3">Package Options</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Small Package</h4>
                    <span className="font-bold">$8</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Up to 5kg • 30x30x30cm</p>
                  <p className="text-sm text-primary">Delivery in 45 min</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Medium Package</h4>
                    <span className="font-bold">$15</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Up to 15kg • 50x50x50cm</p>
                  <p className="text-sm text-primary">Delivery in 60 min</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Large Package</h4>
                    <span className="font-bold">$25</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Up to 30kg • 80x80x80cm</p>
                  <p className="text-sm text-primary">Delivery in 90 min</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      {(selectedVehicleId || activeTab === 'delivery') && (
        <div className="p-4 border-t border-border bg-muted/20">
          <Button
            className="w-full"
            size="lg"
            onClick={handleBooking}
            disabled={isBooking || !user || !currentRouteCoordinates || !selectedVehicleId}
          >
            {isBooking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {activeTab === 'ride' && 'Confirm Booking'}
                {activeTab === 'carpool' && 'Join Shared Ride'}
                {activeTab === 'delivery' && 'Schedule Delivery'}
              </>
            )}
          </Button>

          {!user && (
            <p className="text-center text-sm text-muted-foreground mt-2">Please sign in to book a ride</p>
          )}
        </div>
      )}
    </div>
  );
}
