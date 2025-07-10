import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Users,
  Car,
  TrendingUp,
  DollarSign,
  MapPin,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  Activity,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { toast } from '@/components/ui/use-toast'
import type {

  User,
  Driver,
  Ride,
  Booking,
  Notification,
} from '@/lib/types'
import { useDrivers, useRides, useUsers } from '@/useHooks'
import { useNotifications } from '../../useHooks'


export const Route = createFileRoute('/dashboard/admin')({
  component: Admin,
})

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview')

  const {
    data: recentUsers = { data: [] },
    isLoading: usersLoading,
  } = useUsers(1, 10)
  const {
    data: topDrivers = { data: [] },
    isLoading: driversLoading,
  } = useDrivers(1, 5)
  const {
    data: recentRides = { data: [] },
    isLoading: ridesLoading,
  } = useRides(1, 10)
  const {
    data: notifications = { data: [] },
    isLoading: notificationsLoading,
  } = useNotifications(1, 10)
const safeUsers = recentUsers?.data ?? []
const safeDrivers = topDrivers?.data ?? []
const safeRides = recentRides?.data ?? []
const safeNotifications = notifications?.data ?? []
  const isLoading = usersLoading || driversLoading || ridesLoading || notificationsLoading

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'active':
      case 'in_transit':
      case 'picked_up':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString()
  }

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar userType="admin" />
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
      <DashboardSidebar userType="admin" />

      <div className="flex-1 lg:ml-0">
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Business Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor and manage your RideFlow operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                <Activity className="w-3 h-3 mr-1" />
                All Systems Operational
              </Badge>
            </div>
          </div>

          {/* Drivers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" /> Top Drivers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeDrivers.slice(0, 5).map((driver, index) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {driver.user?.name?.charAt(0) || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {driver.user?.name || 'Driver'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          License: {driver.licenseNumber}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {driver.vehicle?.status || 'No vehicle'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Recent Rides</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Recent Rides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ride ID</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeRides.map((ride) => (
                        <TableRow key={ride.id}>
                          <TableCell className="font-medium">
                            {ride.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>{ride.driver?.user?.name || 'N/A'}</TableCell>
                          <TableCell className="capitalize">{ride.type}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusColor(ride.status)}
                            >
                              {ride.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(ride.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> Recent Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> System Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {safeNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 p-3 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
