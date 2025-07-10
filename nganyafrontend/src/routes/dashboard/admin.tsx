import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo } from "react";
import {
  Users,
  Car,
  DollarSign,
  MapPin,
  AlertTriangle,
  Clock,
  Star,
  BarChart3,
  Activity,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { toast } from "@/components/ui/use-toast";
import { 
  useAdminStats,
  useRides,
  useDrivers,
  useUsers,
  useNotifications
} from "@/useHooks";
import type { User, Driver, Ride, Notification } from "@/lib/types";

export const Route = createFileRoute('/dashboard/admin')({
  component: AdminDashboard,
})

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch stats and data using hooks
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { data: ridesData, isLoading: ridesLoading } = useRides(1, 10);
  const { data: driversData, isLoading: driversLoading } = useDrivers(1, 5);
  const { data: usersData, isLoading: usersLoading } = useUsers(1, 10);
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(1, 10);
  
  // Extract data from responses
  const recentRides = ridesData?.items || [];
  const topDrivers = driversData?.items || [];
  const recentUsers = usersData?.items || [];
  const notifications = notificationsData?.items || [];
  
  // Calculate loading state
  const isLoading = statsLoading || ridesLoading || driversLoading || usersLoading || notificationsLoading;
  
  // Refresh all data
  const refreshData = () => {
    // In a real app, you'd invalidate all queries here
    toast({
      title: "Refreshing Data",
      description: "Dashboard data is being updated",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "confirmed":
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "active":
      case "in_transit":
      case "picked_up":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

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
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="admin" />

      <div className="flex-1 lg:ml-0">
        <div className="p-6 space-y-6">
          {/* Header */}
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
              <Button variant="outline" size="sm" onClick={refreshData}>
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Registered users
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Drivers
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.activeDrivers.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Currently working
                    </p>
                  </div>
                  <Car className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.monthlyRevenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This month's earnings
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Rides
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.totalRides.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      All time rides
                    </p>
                  </div>
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={stats.completionRate}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Rating</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {stats.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <Progress
                    value={(stats.averageRating / 5) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Vehicle Utilization</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.totalVehicles} vehicles
                    </span>
                  </div>
                  <Progress 
                    value={(stats.activeDrivers / stats.totalVehicles) * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Top Drivers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDrivers.slice(0, 5).map((driver, index) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={driver.user?.profileImage} />
                            <AvatarFallback className="text-xs">
                              {driver.user?.name?.charAt(0) || "D"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {driver.user?.name || "Driver"}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              License: {driver.licenseNumber}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">
                                {driver.rating?.toFixed(1) || "4.5"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${driver.vehicle?.status === `available` ? `bg-green-100 text-green-800` : `bg-gray-100 text-gray-800`}`}
                      >
                        {driver.vehicle?.status || "No vehicle"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tables */}
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
                    <Clock className="w-5 h-5" />
                    Recent Rides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentRides.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No recent rides</h3>
                      <p className="mt-1 text-sm text-gray-500">No rides have been completed yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ride ID</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Fare</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentRides.map((ride) => (
                          <TableRow key={ride.id}>
                            <TableCell className="font-medium">
                              {ride.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {ride.driver?.user?.name || "Unknown"}
                            </TableCell>
                            <TableCell className="capitalize">
                              {ride.type}
                            </TableCell>
                            <TableCell className="text-green-600">
                              ${ride.fare?.toFixed(2) || "0.00"}
                            </TableCell>
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Recent Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.phone || "N/A"}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(user.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    System Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                      <p className="mt-1 text-sm text-gray-500">All systems are operational</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}