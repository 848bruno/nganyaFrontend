// Core User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "driver" | "admin";
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  licensePlate: string;
  type: "sedan" | "suv" | "luxury" | "van" | "bike";
  status: "available" | "in_use" | "maintenance";
  model: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

// Driver Types
export interface Driver {
  id: string;
  userId: string;
  user: User;
  licenseNumber: string;
  rating: number;
  vehicleId?: string;
  vehicle?: Vehicle;
  createdAt: Date;
  updatedAt: Date;
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
  type: "sedan" | "suv" | "luxury" | "van" | "bike";
  model: string;
  year: number;
}
