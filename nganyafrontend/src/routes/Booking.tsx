import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Star,
  Navigation,
  Car,
  Share,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { ridesService } from "@/lib/rides-service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useRouter, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/Booking')({
  component: Booking,
})

export default function Booking() {
  const navigate = useRouter();
  const { user } = useAuth();
  const [ride, setRide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState(5);

  useEffect(() => {
    loadRideData();
  }, []);

  const loadRideData = async () => {
    try {
      const rideId = localStorage.getItem("currentRideId");
      if (!rideId) {
        toast({
          title: "No Active Ride",
          description: "No active ride found. Redirecting...",
          variant: "destructive",
        });
        navigate("/index");
        return;
      }

      const rideData = await ridesService.getRideById(rideId);
      setRide(rideData);

      // Set initial estimated time based on ride status
      if (rideData.status === "requested") {
        setEstimatedTime(5);
      } else if (rideData.status === "accepted") {
        setEstimatedTime(3);
      }
    } catch (error: any) {
      toast({
        title: "Error Loading Ride",
        description: "Unable to load ride details. Please try again.",
        variant: "destructive",
      });
      navigate("/index");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    if (!ride) return;

    const interval = setInterval(() => {
      setEstimatedTime((prev) => Math.max(0, prev - 1));
      // Optionally refresh ride data
      loadRideData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [ride]);

  const getStatusProgress = () => {
    if (!ride) return 0;

    switch (ride.status) {
      case "requested":
        return 25;
      case "accepted":
        return 50;
      case "driver_arriving":
        return 75;
      case "in_progress":
        return 90;
      case "completed":
        return 100;
      default:
        return 25;
    }
  };

  const getStatusText = () => {
    if (!ride) return "Loading...";

    switch (ride.status) {
      case "requested":
        return "Finding your driver...";
      case "accepted":
        return ride.driver
          ? `${ride.driver.user?.name} is ${estimatedTime} min away`
          : `Driver assigned, ${estimatedTime} min away`;
      case "driver_arriving":
        return "Driver has arrived";
      case "in_progress":
        return "Trip in progress";
      case "completed":
        return "Trip completed";
      default:
        return "Processing request...";
    }
  };

  const getStatusColor = () => {
    if (!ride) return "text-gray-600";

    switch (ride.status) {
      case "requested":
        return "text-yellow-600";
      case "accepted":
        return "text-blue-600";
      case "driver_arriving":
        return "text-green-600";
      case "in_progress":
        return "text-purple-600";
      case "completed":
        return "text-green-700";
      default:
        return "text-blue-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No active ride found</p>
          <Button onClick={() => navigate("/index")} className="mt-4">
            Book a New Ride
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/index")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Your Ride</h1>
            <p className="text-sm text-muted-foreground">
              Booking #{ride.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Progress */}
      <div className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className={`text-lg font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </h2>
            <div className="flex items-center justify-center gap-4 mt-2">
              <p className="text-sm text-muted-foreground">
                ETA:{" "}
                {new Date(
                  Date.now() + estimatedTime * 60000,
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {ride.distance && (
                <Badge variant="secondary" className="text-xs">
                  {ride.distance} km
                </Badge>
              )}
            </div>
          </div>
          <Progress value={getStatusProgress()} className="w-full h-2" />

          {/* Real-time status indicators */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Live tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">On route</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mx-4 mb-6 h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              Live tracking coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Driver Info */}
      <div className="mx-4 mb-6 bg-card rounded-2xl border border-border p-6">
        {ride.driver ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Your Driver</h3>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Arriving in {estimatedTime} min
              </Badge>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16 ring-2 ring-green-500 ring-offset-2">
                <AvatarImage
                  src={ride.driver.user?.avatar || "/placeholder.svg"}
                />
                <AvatarFallback>
                  {ride.driver.user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "D"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h4 className="font-medium">
                  {ride.driver.user?.name || "Driver"}
                </h4>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {ride.driver.rating || 4.5}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {ride.driver.totalTrips || 0} trips
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {ride.driver.vehicles?.[0]
                    ? `${ride.driver.vehicles[0].make} ${ride.driver.vehicles[0].model}`
                    : "Vehicle info updating..."}
                </p>
                {ride.driver.vehicles?.[0] && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {ride.driver.vehicles[0].licensePlate}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {ride.driver.vehicles[0].color}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button size="icon" variant="outline" className="h-12 w-12">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" className="h-12 w-12">
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button variant="outline" size="sm" className="text-xs">
                <Share className="w-3 h-3 mr-1" />
                Share Trip
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Navigation className="w-3 h-3 mr-1" />
                Directions
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Emergency
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <h3 className="font-medium mb-2">Finding Your Driver</h3>
            <p className="text-sm text-muted-foreground">
              Looking for the best driver in your area...
            </p>
          </div>
        )}
      </div>

      {/* Trip Details */}
      <div className="mx-4 mb-6 bg-card rounded-2xl border border-border p-6">
        <h3 className="font-medium mb-4">Trip Details</h3>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Pickup</p>
              <p className="font-medium">{ride.pickupAddress}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-3 h-3 bg-primary rounded-full mt-1"></div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Destination</p>
              <p className="font-medium">{ride.destinationAddress}</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {ride.estimatedDuration
                ? `${ride.estimatedDuration} min`
                : "Calculating..."}
            </span>
          </div>
          <div className="text-lg font-bold">
            ${ride.finalPrice || ride.estimatedPrice}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            Contact Support
          </Button>
          <Button variant="destructive" className="flex-1">
            Cancel Trip
          </Button>
        </div>
      </div>
    </div>
  );
}
