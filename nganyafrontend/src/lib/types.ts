// Core User Types
export enum UserRole { // Re-adding UserRole enum for clarity, though string literals are used below
  Customer = 'customer',
  Driver = 'driver',
  Admin = 'admin',
}

// ⭐ NEW: Vehicle Interface - Exported ⭐
export interface Vehicle {
  id: string;
  licensePlate: string;
  type: VehicleType;
  status: VehicleStatus;
  model: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
  currentDriver?: User | null; // Optional: if you want to link back to the driver
}

export interface User {
  id: string;
  name: string; // Consider splitting into firstName and lastName
  email: string;
  password?: string; // Should not be sent to frontend after creation/update
  role: UserRole; // Using the enum for consistency
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  firstName?: string; // Added for consistency with potential backend split
  lastName?: string; // Added for consistency with potential backend split

  // ⭐ RE-ADDED: Driver-specific fields (will be null/undefined for non-drivers) ⭐
  isOnline?: boolean;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  driverLicenseNumber?: string | null;
  driverStatus?: 'pending' | 'approved' | 'rejected' | null; // Re-added
  totalRidesCompleted?: number;
  averageRating?: number;
  assignedVehicle?: Vehicle; // Populated Vehicle object
  assignedVehicleId?: string | null; // Foreign key
}

// --- Vehicle Enums ---
export enum VehicleType {
  Sedan = 'sedan',
  SUV = 'suv',
  Luxury = 'luxury',
  Van = 'van',
  Bike = 'bike',
}

export enum VehicleStatus {
  Available = 'available',
  InUse = 'in_use',
  Maintenance = 'maintenance',
}
// --- End Vehicle Enums ---

// ⭐ REMOVED: Driver Types - as they are now merged into User ⭐
// export interface Driver { ... }

// --- Driver Status Enum (now part of User entity's driverStatus) ---
// This enum can be removed if you're directly using string literals 'pending', 'approved', etc.
// Or keep it if you want strong typing for the driverStatus property on User.
export enum DriverStatus {
  Active = "active",
  Inactive = "inactive",
  OnDuty = "on_duty",
  OffDuty = "off_duty",
  Suspended = "suspended",
}
// --- End Driver Status Enum ---


// ⭐ MODIFIED: Driver Dashboard Stats - Added missing properties ⭐
export interface DriverDashboardStats {
  todayEarnings: number;
  weeklyProgress: number;
  totalBookings: number; // Total bookings by this driver
  totalRides: number; // Total rides completed by this driver
  rating: number; // Average rating of this driver
  completionRate: number;
  hoursOnline: number;
  weeklyEarnings: number;
  isOnline?: boolean; // Added for consistency with frontend usage
  // ⭐ Added properties from AdminStats that were being returned by getAdminStats ⭐
  totalUsers: number;
  activeDrivers: number;
  totalVehicles: number;
  monthlyRevenue: number;
  averageRating: number; // Already exists, but ensure it's there
  supportTickets: number;
}

export enum DeliveryStatus {
  Pending = 'pending',
  PickedUp = 'picked_up',
  InTransit = 'in_transit',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}
// Location Type (remains the same)
export interface Location {
  lat: number;
  lng: number;
}

// Route Types (for carpooling)
export interface Route {
  id: string;
  driverId: string;
  driver: User; // Driver is now a User
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
  driver: User; // Driver is now a User
  vehicleId: string;
  vehicle: Vehicle;
  routeId?: string;
  route?: Route;
  pickUpLocation: Location;
  dropOffLocation: Location;
  type: 'private' | 'carpool';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  fare: number;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  bookings?: Booking[]; // Added for DriverDashboard to access customer name
  reviews?: Review[]; // Added for consistency with backend
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
  type: 'ride' | 'delivery';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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
  driver?: User; // Driver is now a User
  vehicleId?: string;
  vehicle?: Vehicle;
  pickUpLocation: Location;
  dropOffLocation: Location;
  itemType: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
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
  method: 'card' | 'wallet' | 'cash';
  status: 'pending' | 'completed' | 'failed';
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
  driver: User; // Driver is now a User
  userId: string;
  user: User; // Customer is a User
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
  type: 'booking_confirmation' | 'driver_arrival' | 'delivery_update' | 'general';
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
  // ⭐ Added for consistency with normalizePaginatedResponse ⭐
  items?: T[];
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// Dashboard Types (Adjusted to reflect User as driver)
// ⭐ REMOVED: AdminStats - Merged into DriverDashboardStats for simplicity as per usage ⭐
// export interface AdminStats { ... }

// Form Types for API calls
// ⭐ UPDATED: CreateRideRequest to match backend's CreateRideDto structure ⭐
export interface CreateRideRequest {
  driverId: string;
  vehicleId: string;
  routeId?: string | null;
  pickUpLocation: Location; // Now a Location object
  dropOffLocation: Location; // Now a Location object
  type: 'private' | 'carpool';
  status: 'pending' | 'active' | 'completed' | 'cancelled'; // Added status, typically 'pending' from frontend
  fare: number; // Maps to estimatedPrice from frontend
  startTime?: Date;
  endTime?: Date;
  pickupAddress:string;
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

export interface CreateVehicleRequest {
  licensePlate: string;
  type: VehicleType;
  model: string;
  year: number;
  status: VehicleStatus; // Added status for creation
}

export interface CreateUserRequest {
  name: string; // Changed from firstName, lastName as per your backend
  email: string;
  password?: string;
  phone: string;
  role: UserRole; // Using UserRole enum
  driverLicenseNumber?: string; // Only for creating a driver
  passengerCount:string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
  // ⭐ RE-ADDED: Driver-specific fields for DTO consistency ⭐
  isOnline?: boolean;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  driverLicenseNumber?: string | null;
  driverStatus?: 'pending' | 'approved' | 'rejected' | null;
  totalRidesCompleted?: number;
  averageRating?: number;
  assignedVehicle?: Vehicle;
  assignedVehicleId?: string | null;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  phone?: string;
  // ⭐ RE-ADDED: Driver-specific fields for DTO consistency ⭐
  isOnline?: boolean;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  driverLicenseNumber?: string | null;
  driverStatus?: 'pending' | 'approved' | 'rejected' | null;
  totalRidesCompleted?: number;
  averageRating?: number;
  assignedVehicleId?: string | null; // For assigning/unassigning vehicle
}
