import { useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { VehicleCard } from './VehicleCard'
import { ridesService } from '@/lib/rides-service'
import { driversService } from '@/lib/drivers-service'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'
import { useRouter, createFileRoute } from '@tanstack/react-router'



const mockVehicles = [
  {
    id: '1',
    type: 'Economy',
    driver: {
      name: 'John Doe',
      rating: 4.9,
      image: '/placeholder.svg',
      trips: 1247,
    },
    price: 12,
    estimatedTime: '5 min',
    capacity: 4,
    features: ['AC', 'Music'],
    vehicleInfo: 'Toyota Camry 2020',
  },
  {
    id: '2',
    type: 'Premium',
    driver: {
      name: 'Sarah Wilson',
      rating: 4.8,
      image: '/placeholder.svg',
      trips: 892,
    },
    price: 18,
    estimatedTime: '3 min',
    capacity: 4,
    features: ['AC', 'WiFi', 'Premium Interior'],
    vehicleInfo: 'BMW 3 Series 2022',
  },
  {
    id: '3',
    type: 'Luxury',
    driver: {
      name: 'David Chen',
      rating: 4.9,
      image: '/placeholder.svg',
      trips: 543,
    },
    price: 35,
    estimatedTime: '7 min',
    capacity: 4,
    features: ['AC', 'WiFi', 'Leather Seats', 'Champagne'],
    vehicleInfo: 'Mercedes S-Class 2023',
  },
]

const mockCarpoolRides = [
  {
    id: 'c1',
    type: 'Shared Ride',
    driver: {
      name: 'Mike Johnson',
      rating: 4.7,
      image: '/placeholder.svg',
      trips: 324,
    },
    price: 6,
    estimatedTime: '12 min',
    capacity: 2,
    availableSeats: 2,
    route: 'Downtown → Airport',
    savings: 'Save $8 vs private ride',
  },
  {
    id: 'c2',
    type: 'Shared Ride',
    driver: {
      name: 'Lisa Park',
      rating: 4.6,
      image: '/placeholder.svg',
      trips: 567,
    },
    price: 4,
    estimatedTime: '15 min',
    capacity: 3,
    availableSeats: 1,
    route: 'Mall → University',
    savings: 'Save $12 vs private ride',
  },
]

export function BookingPanel() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [pickup, setPickup] = useState('Your current location')
  const [destination, setDestination] = useState('')
  const [activeTab, setActiveTab] = useState('ride')
  const [isBooking, setIsBooking] = useState(false)
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false)

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to book a ride.',
        variant: 'destructive',
      })
      return
    }

    if (!destination.trim()) {
      toast({
        title: 'Destination Required',
        description: 'Please enter your destination.',
        variant: 'destructive',
      })
      return
    }

    if (activeTab === 'ride' && !selectedVehicle) {
      toast({
        title: 'Vehicle Selection Required',
        description: 'Please select a vehicle.',
        variant: 'destructive',
      })
      return
    }

    setIsBooking(true)
    try {
      if (activeTab === 'ride') {
        // Create ride request
        const selectedVehicleData = mockVehicles.find(
          (v) => v.id === selectedVehicle,
        )

        const rideData = {
          type: (selectedVehicleData?.type.toLowerCase() as any) || 'regular',
          pickupAddress: pickup,
          pickupLatitude: 40.7128, // Demo coordinates - NYC
          pickupLongitude: -74.006,
          destinationAddress: destination,
          destinationLatitude: 40.7589, // Demo coordinates - Times Square
          destinationLongitude: -73.9851,
          estimatedPrice: selectedVehicleData?.price || 15,
          passengerCount: 1,
        }

        const ride = await ridesService.createRide(rideData)

        toast({
          title: 'Ride Requested!',
          description: 'Looking for nearby drivers...',
        })

        // Store ride ID for the booking page
        localStorage.setItem('currentRideId', ride.id)
        router.navigate({ to: '/booking' })
      }

      // For now, other tabs will navigate to placeholder
      else {
        router.navigate({ to: '/booking' })
      }
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Unable to book ride. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsBooking(false)
    }
  }

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
              {mockVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  {...vehicle}
                  isSelected={selectedVehicle === vehicle.id}
                  onSelect={setSelectedVehicle}
                />
              ))}
            </>
          )}

          {activeTab === 'carpool' && (
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
              {mockCarpoolRides.map((ride) => (
                <div
                  key={ride.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedVehicle === ride.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
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

          {activeTab === 'delivery' && (
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
      {(selectedVehicle || activeTab === 'delivery') && (
        <div className="p-4 border-t border-border bg-muted/20">
          <Button
            className="w-full"
            size="lg"
            onClick={handleBooking}
            disabled={isBooking || !user}
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
            <p className="text-center text-sm text-muted-foreground mt-2">
              Please sign in to book a ride
            </p>
          )}
        </div>
      )}
    </div>
  )
}
