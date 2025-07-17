// src/components/BookingPanel.tsx
import { useState, useEffect, useCallback } from "react"; // ⭐ Add useEffect, useCallback ⭐
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { VehicleCard } from "./VehicleCard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import debounce from 'lodash.debounce'; // ⭐ Install: npm install lodash.debounce @types/lodash.debounce ⭐

import { ridesService } from "@/lib/rides-service";
import { geoService } from "@/lib/geo-service"; // This will be your service for new backend calls

// ⭐ NEW Type for Suggested Vehicle from Backend ⭐
interface SuggestedVehicle {
  id: string; // Vehicle ID
  type: string; // Vehicle type (e.g., "Economy", "Premium")
  driver: {
    id: string; // Driver's user ID
    name: string;
    rating: number;
    image?: string; // Driver's profile image
    trips: number;
  };
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
  setRouteData: React.Dispatch<React.SetStateAction<any>>;
}

export function BookingPanel({ setRouteData }: BookingPanelProps) {
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [pickup, setPickup] = useState("Your current location");
  const [destination, setDestination] = useState("");
  const [activeTab, setActiveTab] = useState("ride");
  const [isBooking, setIsBooking] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [suggestedVehicles, setSuggestedVehicles] = useState<SuggestedVehicle[]>([]); // ⭐ NEW State ⭐
  const [currentRouteCoordinates, setCurrentRouteCoordinates] = useState<{
    pickup: { lat: number; lng: number } | null;
    destination: { lat: number; lng: number } | null;
  } | null>(null); // ⭐ NEW State to store geocoded coords ⭐


  // ⭐ Debounced function for route calculation and driver suggestion ⭐
  const debouncedCalculateAndSuggest = useCallback(
    debounce(async (pickupAddress: string, destinationAddress: string) => {
      if (!pickupAddress.trim() || !destinationAddress.trim()) {
        setSuggestedVehicles([]); // Clear suggestions if inputs are empty
        setRouteData(null);
        setCurrentRouteCoordinates(null);
        setIsCalculatingRoute(false);
        return;
      }

      setIsCalculatingRoute(true);
      setRouteData(null); // Clear previous route data
      setSuggestedVehicles([]); // Clear previous suggestions
      setCurrentRouteCoordinates(null); // Clear previous coords

      try {
        // ⭐ Call backend API for route calculation AND nearest drivers ⭐
        // This single API call will do geocoding, route calculation, and driver matching.
        const response = await geoService.getSuggestedDriversAndRoute(
          pickupAddress,
          destinationAddress
        );

        setRouteData(response.route); // Data for map display
        setSuggestedVehicles(response.suggestedVehicles); // Data for vehicle cards
        setCurrentRouteCoordinates({
          pickup: { lat: response.route.pickupLatitude, lng: response.route.pickupLongitude },
          destination: { lat: response.route.destinationLatitude, lng: response.route.destinationLongitude },
        });

        if (response.suggestedVehicles.length === 0) {
          toast({
            title: "No Vehicles Found",
            description: "No drivers available for this route currently.",
            variant: "default",
          });
        } else {
          toast({
            title: "Route & Vehicles Found!",
            description: `Distance: ${(response.route.distance / 1000).toFixed(2)} km, Duration: ${(response.route.duration / 60).toFixed(0)} min. ${response.suggestedVehicles.length} drivers found.`,
          });
          setSelectedVehicle(response.suggestedVehicles[0]?.id || null); // Auto-select the first suggested vehicle
        }
      } catch (error: any) {
        console.error("Error calculating route or fetching drivers:", error);
        toast({
          title: "Calculation Failed",
          description: error.message || "Could not calculate route or find drivers. Please try again.",
          variant: "destructive",
        });
        setSuggestedVehicles([]); // Ensure no old suggestions remain on error
      } finally {
        setIsCalculatingRoute(false);
      }
    }, 500), // ⭐ Debounce by 500ms ⭐
    [setRouteData] // Dependency for useCallback
  );

  // ⭐ useEffect to trigger calculation on input change ⭐
  useEffect(() => {
    // Only trigger if both pickup and destination are not empty
    if (pickup.trim() && destination.trim()) {
      debouncedCalculateAndSuggest(pickup, destination);
    } else {
      setSuggestedVehicles([]);
      setRouteData(null);
      setCurrentRouteCoordinates(null);
    }
  }, [pickup, destination, debouncedCalculateAndSuggest, setRouteData]);


  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a ride.",
        variant: "destructive",
      });
      return;
    }

    if (!destination.trim() || !currentRouteCoordinates) {
      toast({
        title: "Location Details Missing",
        description: "Please ensure pickup and destination are set and route is calculated.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "ride" && !selectedVehicle) {
      toast({
        title: "Vehicle Selection Required",
        description: "Please select a vehicle.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      if (activeTab === "ride") {
        const selectedVehicleData = suggestedVehicles.find(
          (v) => v.id === selectedVehicle,
        );

        if (!selectedVehicleData) {
          toast({
            title: "Invalid Vehicle Selection",
            description: "Please select an available vehicle.",
            variant: "destructive",
          });
          setIsBooking(false);
          return;
        }

        // ⭐ Use the actual geocoded coordinates from currentRouteCoordinates ⭐
        const rideData = {
          type: selectedVehicleData.type.toLowerCase() as any, // Use type from suggested vehicle
          pickupAddress: pickup,
          pickupLatitude: currentRouteCoordinates.pickup!.lat, // Non-null assertion as we check it above
          pickupLongitude: currentRouteCoordinates.pickup!.lng,
          destinationAddress: destination,
          destinationLatitude: currentRouteCoordinates.destination!.lat,
          destinationLongitude: currentRouteCoordinates.destination!.lng,
          estimatedPrice: selectedVehicleData.price, // Use price from suggested vehicle
          passengerCount: 1, // You might want to make this dynamic
          driverId: selectedVehicleData.driver.id, // Pass the suggested driver's ID
          vehicleId: selectedVehicleData.id, // Pass the suggested vehicle's ID
        };

        const ride = await ridesService.createRide(rideData);

        toast({
          title: "Ride Requested!",
          description: "Your ride has been successfully booked!",
        });

        // You might want to navigate to a ride tracking page here
      } else {
        toast({
          title: "Feature Not Fully Implemented",
          description: "This feature is under development.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book ride. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6 md:hidden"></div>

        {/* Service Type Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-4"
        >
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
          {/* ⭐ REMOVED Calculate Route Button ⭐ */}
          {isCalculatingRoute && ( // Show loader when calculating
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
          {activeTab === "ride" && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Available Vehicles
                </h3>
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
              {isCalculatingRoute ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <span>Searching for vehicles...</span>
                </div>
              ) : suggestedVehicles.length > 0 ? (
                suggestedVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    {...vehicle}
                    driver={{ // Ensure driver object matches VehicleCardProps
                        name: vehicle.driver.name,
                        rating: vehicle.driver.rating,
                        image: vehicle.driver.image,
                        trips: vehicle.driver.trips,
                    }}
                    isSelected={selectedVehicle === vehicle.id}
                    onSelect={setSelectedVehicle}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  Enter pickup and destination to find available vehicles.
                </p>
              )}
            </>
          )}

          {activeTab === "carpool" && (
            <>
              <div className="mb-3">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Available Shared Rides
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Save up to 60% by sharing!
                    </span>
                  </div>
                </div>
              </div>
              {/* This part still uses mock data. You'd need a backend endpoint for carpool suggestions too. */}
              {mockCarpoolRides.map((ride) => (
                <div
                  key={ride.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedVehicle === ride.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedVehicle(ride.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{ride.route}</span>
                      <Badge variant="outline" className="text-xs">
                        {ride.availableSeats} seats left
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${ride.price}</div>
                      <div className="text-xs text-green-600">
                        {ride.savings}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{ride.driver.name}</span>
                    <span>⭐ {ride.driver.rating}</span>
                    <span>{ride.estimatedTime}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "delivery" && (
            <>
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                Package Options
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Small Package</h4>
                    <span className="font-bold">$8</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Up to 5kg • 30x30x30cm
                  </p>
                  <p className="text-sm text-primary">Delivery in 45 min</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Medium Package</h4>
                    <span className="font-bold">$15</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Up to 15kg • 50x50x50cm
                  </p>
                  <p className="text-sm text-primary">Delivery in 60 min</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Large Package</h4>
                    <span className="font-bold">$25</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Up to 30kg • 80x80x80cm
                  </p>
                  <p className="text-sm text-primary">Delivery in 90 min</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      {(selectedVehicle || activeTab === "delivery") && (
        <div className="p-4 border-t border-border bg-muted/20">
          <Button
            className="w-full"
            size="lg"
            onClick={handleBooking}
            disabled={isBooking || !user || !currentRouteCoordinates} // Disable if no route calculated
          >
            {isBooking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {activeTab === "ride" && "Confirm Booking"}
                {activeTab === "carpool" && "Join Shared Ride"}
                {activeTab === "delivery" && "Schedule Delivery"}
              </>
            )}
          </Button>

          {!user && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Please sign in to book a ride
            </p>
          )}
        </div>
      )}
    </div>
  );
}