import { api } from "./api";
import type {
  Driver,
  Vehicle,
  DriverStats,
  RegisterDriverRequest,
  CreateVehicleRequest,
  UpdateDriverLocationRequest,
  ApiResponse,
  PaginatedResponse,
  Location,
} from "./types";

export interface DriverFilters {
  status?: "online" | "offline" | "busy";
  rating?: number;
  vehicleType?: string;
  location?: Location;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface VehicleFilters {
  type?: "sedan" | "suv" | "luxury" | "van" | "bike";
  status?: "available" | "in_use" | "maintenance";
  page?: number;
  limit?: number;
}

class DriversService {
  // Driver Management
  async registerAsDriver(driverData: RegisterDriverRequest): Promise<Driver> {
    try {
      const response = await api.post<ApiResponse<Driver>>(
        "/drivers/register",
        driverData,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to register as driver");
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to register as driver");
    }
  }

  async getDriverProfile(driverId?: string): Promise<Driver> {
    try {
      const url = driverId ? `/drivers/${driverId}` : "/drivers/profile";
      const response = await api.get<ApiResponse<Driver>>(url);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get driver profile");
    } catch (error: any) {
      throw new Error("Failed to load driver profile");
    }
  }

  async updateDriverProfile(driverData: Partial<Driver>): Promise<Driver> {
    try {
      const response = await api.put<ApiResponse<Driver>>(
        "/drivers/profile",
        driverData,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update profile");
    } catch (error: any) {
      throw new Error("Failed to update driver profile");
    }
  }

  async getDrivers(
    filters?: DriverFilters,
  ): Promise<PaginatedResponse<Driver>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Driver>>>(
        "/drivers",
        {
          params: filters,
        },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get drivers");
    } catch (error: any) {
      throw new Error("Failed to load drivers");
    }
  }

  async updateDriverLocation(
    locationData: UpdateDriverLocationRequest,
  ): Promise<void> {
    try {
      const response = await api.post<ApiResponse<void>>(
        "/drivers/location",
        locationData,
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update location");
      }
    } catch (error: any) {
      throw new Error("Failed to update driver location");
    }
  }

  async setDriverStatus(status: "online" | "offline" | "busy"): Promise<void> {
    try {
      const response = await api.patch<ApiResponse<void>>("/drivers/status", {
        status,
      });
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error: any) {
      throw new Error("Failed to update driver status");
    }
  }

  async getDriverStats(driverId?: string): Promise<DriverStats> {
    try {
      const url = driverId ? `/drivers/${driverId}/stats` : "/drivers/stats";
      const response = await api.get<ApiResponse<DriverStats>>(url);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get driver stats");
    } catch (error: any) {
      throw new Error("Failed to load driver statistics");
    }
  }

  async getDriverEarnings(
    period: "daily" | "weekly" | "monthly",
    driverId?: string,
  ): Promise<{
    total: number;
    breakdown: Array<{
      date: string;
      earnings: number;
      rides: number;
      hours: number;
    }>;
  }> {
    try {
      const url = driverId
        ? `/drivers/${driverId}/earnings`
        : "/drivers/earnings";
      const response = await api.get(url, {
        params: { period },
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get earnings");
    } catch (error: any) {
      throw new Error("Failed to load driver earnings");
    }
  }

  // Vehicle Management
  async createVehicle(vehicleData: CreateVehicleRequest): Promise<Vehicle> {
    try {
      const response = await api.post<ApiResponse<Vehicle>>(
        "/vehicles",
        vehicleData,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create vehicle");
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to create vehicle");
    }
  }

  async getVehicles(
    filters?: VehicleFilters,
  ): Promise<PaginatedResponse<Vehicle>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Vehicle>>>(
        "/vehicles",
        {
          params: filters,
        },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get vehicles");
    } catch (error: any) {
      throw new Error("Failed to load vehicles");
    }
  }

  async getVehicle(vehicleId: string): Promise<Vehicle> {
    try {
      const response = await api.get<ApiResponse<Vehicle>>(
        `/vehicles/${vehicleId}`,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get vehicle");
    } catch (error: any) {
      throw new Error("Failed to load vehicle details");
    }
  }

  async updateVehicle(
    vehicleId: string,
    vehicleData: Partial<Vehicle>,
  ): Promise<Vehicle> {
    try {
      const response = await api.put<ApiResponse<Vehicle>>(
        `/vehicles/${vehicleId}`,
        vehicleData,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update vehicle");
    } catch (error: any) {
      throw new Error("Failed to update vehicle");
    }
  }

  async updateVehicleStatus(
    vehicleId: string,
    status: "available" | "in_use" | "maintenance",
  ): Promise<Vehicle> {
    try {
      const response = await api.patch<ApiResponse<Vehicle>>(
        `/vehicles/${vehicleId}/status`,
        { status },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update status");
    } catch (error: any) {
      throw new Error("Failed to update vehicle status");
    }
  }

  async deleteVehicle(vehicleId: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<void>>(
        `/vehicles/${vehicleId}`,
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete vehicle");
      }
    } catch (error: any) {
      throw new Error("Failed to delete vehicle");
    }
  }

  async assignVehicleToDriver(
    vehicleId: string,
    driverId: string,
  ): Promise<Driver> {
    try {
      const response = await api.patch<ApiResponse<Driver>>(
        `/drivers/${driverId}/assign-vehicle`,
        { vehicleId },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to assign vehicle");
    } catch (error: any) {
      throw new Error("Failed to assign vehicle to driver");
    }
  }

  async unassignVehicleFromDriver(driverId: string): Promise<Driver> {
    try {
      const response = await api.patch<ApiResponse<Driver>>(
        `/drivers/${driverId}/unassign-vehicle`,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to unassign vehicle");
    } catch (error: any) {
      throw new Error("Failed to unassign vehicle from driver");
    }
  }

  // Driver Documents
  async uploadDriverDocument(
    documentType: "license" | "insurance" | "registration",
    file: File,
  ): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("type", documentType);

      const response = await api.post("/drivers/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to upload document");
    } catch (error: any) {
      throw new Error("Failed to upload driver document");
    }
  }

  async getDriverDocuments(): Promise<
    Array<{
      type: string;
      url: string;
      uploadedAt: Date;
      status: "pending" | "approved" | "rejected";
    }>
  > {
    try {
      const response = await api.get("/drivers/documents");
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get documents");
    } catch (error: any) {
      throw new Error("Failed to load driver documents");
    }
  }
}

export const driversService = new DriversService();
