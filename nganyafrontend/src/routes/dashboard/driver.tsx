import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Car,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Users,
  TrendingUp,
  Zap,
  AlertTriangle,
  Navigation,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { rideshareService } from '@/lib/dashboard-service'
import { toast } from '@/components/ui/use-toast'
import type { Vehicle, Ride } from '@/lib/types'

interface DriverDashboardStats {
  todayEarnings: number
  weeklyEarnings: number
  monthlyEarnings: number
  totalRides: number
  rating: number
  completionRate: number
  hoursOnline: number
  activeRides: number
}

export const Route = createFileRoute('/dashboard/driver')({
  component: DriverDashboard,
})

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [currentRide, setCurrentRide] = useState<Ride | null>(null)
  const [pendingRides, setPendingRides] = useState<Ride[]>([])
  const [driverStats, setDriverStats] = useState<DriverDashboardStats>({
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    totalRides: 0,
    rating: 0,
    completionRate: 0,
    hoursOnline: 0,
    activeRides: 0,
  })
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [vehicleRes, rideRes] = await Promise.all([
        rideshareService.getVehicles({ limit: 1 }),
        rideshareService.getRides({ limit: 10 }),
      ])

      const vehicleData = vehicleRes.items?.[0] ?? null
      setVehicle(vehicleData)

      const rides = rideRes.items ?? []
      const activeRide = rides.find((r) => r.status === 'active') || null
      const pending = rides.filter((r) => r.status === 'pending')
      setCurrentRide(activeRide)
      setPendingRides(pending)

      const stats: DriverDashboardStats = {
        todayEarnings: 240,
        weeklyEarnings: 860,
        monthlyEarnings: 3400,
        totalRides: rides.length,
        rating: 4.7,
        completionRate: 92,
        hoursOnline: 48,
        activeRides: activeRide ? 1 : 0,
      }
      setDriverStats(stats)
    } catch (error: any) {
      console.error('Failed to load dashboard:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRide = async (rideId: string) => {
    try {
      await rideshareService.updateRideStatus(rideId, 'active')
      loadDashboardData()
      toast({ title: 'Ride accepted' })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeclineRide = async (rideId: string) => {
    try {
      await rideshareService.updateRideStatus(rideId, 'cancelled')
      loadDashboardData()
      toast({ title: 'Ride declined' })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleCompleteRide = async () => {
    try {
      if (!currentRide) return
      await rideshareService.updateRideStatus(currentRide.id, 'completed')
      loadDashboardData()
      toast({ title: 'Ride completed' })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const weeklyGoal = {
    target: 1500,
    current: driverStats.weeklyEarnings,
    percentage: Math.min((driverStats.weeklyEarnings / 1500) * 100, 100),
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar userType="driver" />
        <div className="flex-1 lg:ml-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="driver" />
      <div className="flex-1 lg:ml-0">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Driver Dashboard</h1>
            <div className="flex items-center gap-2">
              <Switch checked={isOnline} onCheckedChange={setIsOnline} />
              <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Today</p>
                    <h3 className="text-xl font-semibold">
                      Ksh {driverStats.todayEarnings.toFixed(0)}
                    </h3>
                  </div>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Rides</p>
                    <h3 className="text-xl font-semibold">
                      {driverStats.totalRides}
                    </h3>
                  </div>
                  <Car className="w-5 h-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <h3 className="text-xl font-semibold">
                      {driverStats.rating.toFixed(1)} / 5
                    </h3>
                  </div>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Online</p>
                    <h3 className="text-xl font-semibold">
                      {driverStats.hoursOnline} hrs
                    </h3>
                  </div>
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Goal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={weeklyGoal.percentage} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {weeklyGoal.current} of {weeklyGoal.target} achieved
              </p>
            </CardContent>
          </Card>

          {currentRide && (
            <Card>
              <CardHeader>
                <CardTitle>Current Ride</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Fare: Ksh {currentRide.fare}</p>
                <p>
                  Pickup: {currentRide.pickUpLocation.lat},{' '}
                  {currentRide.pickUpLocation.lng}
                </p>
                <p>
                  Drop-off: {currentRide.dropOffLocation.lat},{' '}
                  {currentRide.dropOffLocation.lng}
                </p>
                <Button className="mt-4" onClick={handleCompleteRide}>
                  Complete Ride
                </Button>
              </CardContent>
            </Card>
          )}

          {isOnline && pendingRides.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Rides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="border border-border p-3 rounded-md space-y-1"
                  >
                    <p>
                      Fare: Ksh {ride.fare} | Pickup: {ride.pickUpLocation.lat},{' '}
                      {ride.pickUpLocation.lng}
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => handleAcceptRide(ride.id)}>
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeclineRide(ride.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
