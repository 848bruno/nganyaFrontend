// Core User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "driver" | "admin";
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  firstName:string;
  lastName:string;
  
}

// --- Vehicle Enums ---
export enum VehicleType {
  Sedan = "sedan",
  SUV = "suv",
  Luxury = "luxury",
  Van = "van",
  Bike = "bike",
}

export enum VehicleStatus {
  Available = "available",
  InUse = "in_use",
  Maintenance = "maintenance",
}
// --- End Vehicle Enums ---

// Vehicle Types
export interface Vehicle {
  id: string;
  licensePlate: string;
  type: VehicleType; // Using the enum here
  status: VehicleStatus; // Using the enum here
  model: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

// --- Driver Enum ---
export enum DriverStatus {
  Active = "active",
  Inactive = "inactive",
  OnDuty = "on_duty",
  OffDuty = "off_duty",
  Suspended = "suspended",
}
// --- End Driver Enum ---

// Driver Types
export interface Driver {
  id: string;
  userId: string;
  user: User;
  licenseNumber: string;
  rating: number;
  vehicleId?: string;
  vehicle?: Vehicle;
  // ✨ ADDED: Driver Status property
  status: DriverStatus; // Add this line
  createdAt: Date;
  updatedAt: Date;
}

// ... (existing imports and interfaces)

export interface DriverDashboardStats {
  totalRidesCompleted: number;
  totalRevenueEarned: number;
  averageRating: number;
  totalHoursOnline: number;
  upcomingBookings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalRides: number; 
   rating: number,
    completionRate: number,
    hoursOnline: number,
    activeRides: number; // Total number of rides currently active,
  totalDeliveries: number;
  totalDistanceCovered: number; // Total distance covered by the driver
  totalTimeSpent: number; // Total time spent on rides and deliveries
  totalCancelledRides: number; // Total number of rides cancelled by the driver
  totalCancelledDeliveries: number; // Total number of deliveries cancelled by the driver
  totalActiveRides: number; // Total number of rides currently active
  totalActiveDeliveries: number; // Total number of deliveries currently active
  totalFeedbackReceived: number; // Total number of feedback received from users
  averageResponseTime: number; // Average time taken by the driver to respond to ride or delivery requests
  totalSupportTickets: number; // Total number of support tickets raised by the driver
  totalSupportTicketsResolved: number; // Total number of support tickets resolved by the driver
  totalSupportTicketsPending: number; // Total number of support tickets pending resolution
  // Add any other relevant stats for a driver dashboard
}


export enum DeliveryStatus {
  Pending = 'pending',
  PickedUp = 'picked_up',
  InTransit = 'in_transit',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}
// Location Type
export interface Location {
  lat: number;
  lng: number;
}

// Route Types (for carpooling)
export interface Route {
  id: string;
  driverId: string;
  driver: Driver;
  startPoint: Location;
  endPoint: Location;
  stops?: Location[];
  startTime: Date;
  availableSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

// Ride Types
export interface Ride {
  id: string;
  driverId: string;
  driver: Driver;
  vehicleId: string;
  vehicle: Vehicle;
  routeId?: string;
  route?: Route;
  pickUpLocation: Location;
  dropOffLocation: Location;
  type: "private" | "carpool";
  status: "pending" | "active" | "completed" | "cancelled";
  fare: number;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types
export interface Booking {
  id: string;
  userId: string;
  user: User;
  rideId?: string;
  ride?: Ride;
  deliveryId?: string;
  delivery?: Delivery;
  type: "ride" | "delivery";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  seatNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Delivery Types
export interface Delivery {
  id: string;
  userId: string;
  user: User;
  driverId?: string;
  driver?: Driver;
  vehicleId?: string;
  vehicle?: Vehicle;
  pickUpLocation: Location;
  dropOffLocation: Location;
  itemType: string;
  status: "pending" | "picked_up" | "in_transit" | "delivered" | "cancelled";
  proofOfDelivery?: string;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  user: User;
  amount: number;
  method: "card" | "wallet" | "cash";
  status: "pending" | "completed" | "failed";
  transactionId: string;
  bookingId?: string;
  booking?: Booking;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface Review {
  id: string;
  driverId: string;
  driver: Driver;
  userId: string;
  user: User;
  rating: number;
  comment?: string;
  rideId: string;
  ride: Ride;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  user: User;
  message: string;
  type:
    | "booking_confirmation"
    | "driver_arrival"
    | "delivery_update"
    | "general";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Types
export interface DriverStats {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalRides: number;
  rating: number;
  completionRate: number;
  hoursOnline: number;
}

export interface AdminStats {
  totalUsers: number;
  activeDrivers: number;
  totalVehicles: number;
  monthlyRevenue: number;
  totalRides: number;
  completionRate: number;
  averageRating: number;
  supportTickets: number;
}

// Form Types for API calls
export interface CreateRideRequest {
  pickUpLocation: Location;
  dropOffLocation: Location;
  type: "private" | "carpool";
  routeId?: string;
}

export interface CreateDeliveryRequest {
  pickUpLocation: Location;
  dropOffLocation: Location;
  itemType: string;
  description?: string;
}

export interface UpdateDriverLocationRequest {
  location: Location;
  heading?: number;
}

export interface CreateReviewRequest {
  rideId: string;
  driverId: string;
  rating: number;
  comment?: string;
}

export interface RegisterDriverRequest {
  licenseNumber: string;
  vehicleId?: string;
}

export interface CreateVehicleRequest {
  licensePlate: string;
  type: VehicleType; // Using the enum here
  model: string;
  year: number;
}


// export interface PaginatedResponse<T> {
//   items: T[]; 
//   total: number;
//   data: T[]; 
//   page: number; 
//   limit: number; 
//   totalPages: number; }

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'driver' | 'rider'; // Or more specific roles as needed
}

export interface CreateVehicleRequest {
  licensePlate: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
}