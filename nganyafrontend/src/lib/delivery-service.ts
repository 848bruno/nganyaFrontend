import { api } from "./api";
import type {
  Delivery,
  CreateDeliveryRequest,
  ApiResponse,
  PaginatedResponse,
  Location,
} from "./types";

export interface DeliveryFilters {
  status?: "pending" | "picked_up" | "in_transit" | "delivered" | "cancelled";
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface UpdateDeliveryStatusRequest {
  status: "pending" | "picked_up" | "in_transit" | "delivered" | "cancelled";
  proofOfDelivery?: string;
  notes?: string;
}

class DeliveryService {
  async createDelivery(deliveryData: CreateDeliveryRequest): Promise<Delivery> {
    try {
      const response = await api.post<ApiResponse<Delivery>>(
        "/deliveries",
        deliveryData,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create delivery");
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to create delivery");
    }
  }

  async getDeliveries(
    filters?: DeliveryFilters,
  ): Promise<PaginatedResponse<Delivery>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Delivery>>>(
        "/deliveries",
        {
          params: filters,
        },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get deliveries");
    } catch (error: any) {
      throw new Error("Failed to load deliveries");
    }
  }

  async getDelivery(deliveryId: string): Promise<Delivery> {
    try {
      const response = await api.get<ApiResponse<Delivery>>(
        `/deliveries/${deliveryId}`,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get delivery");
    } catch (error: any) {
      throw new Error("Failed to load delivery details");
    }
  }

  async updateDeliveryStatus(
    deliveryId: string,
    statusUpdate: UpdateDeliveryStatusRequest,
  ): Promise<Delivery> {
    try {
      const response = await api.patch<ApiResponse<Delivery>>(
        `/deliveries/${deliveryId}/status`,
        statusUpdate,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update delivery");
    } catch (error: any) {
      throw new Error("Failed to update delivery status");
    }
  }

  async cancelDelivery(deliveryId: string, reason?: string): Promise<Delivery> {
    try {
      const response = await api.patch<ApiResponse<Delivery>>(
        `/deliveries/${deliveryId}/cancel`,
        { reason },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to cancel delivery");
    } catch (error: any) {
      throw new Error("Failed to cancel delivery");
    }
  }

  async trackDelivery(deliveryId: string): Promise<{
    location: Location;
    status: string;
    estimatedDelivery?: Date;
    driver?: {
      name: string;
      phone: string;
      rating: number;
    };
    timeline: Array<{
      status: string;
      timestamp: Date;
      location?: Location;
      notes?: string;
    }>;
  }> {
    try {
      const response = await api.get(`/deliveries/${deliveryId}/track`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to track delivery");
    } catch (error: any) {
      throw new Error("Failed to track delivery");
    }
  }

  async estimateDeliveryCost(
    pickUp: Location,
    dropOff: Location,
    itemType: string,
    urgent?: boolean,
  ): Promise<{
    estimatedCost: number;
    distance: number;
    duration: number;
    breakdown: {
      baseCost: number;
      distanceCost: number;
      urgencyFee: number;
      serviceFee: number;
    };
  }> {
    try {
      const response = await api.post("/deliveries/estimate-cost", {
        pickUp,
        dropOff,
        itemType,
        urgent,
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to estimate cost");
    } catch (error: any) {
      throw new Error("Failed to estimate delivery cost");
    }
  }

  async getAvailableDrivers(location: Location): Promise<
    Array<{
      id: string;
      name: string;
      location: Location;
      vehicle: {
        type: string;
        model: string;
      };
      rating: number;
      estimatedArrival: number;
    }>
  > {
    try {
      const response = await api.post("/drivers/available-for-delivery", {
        location,
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to get available drivers",
      );
    } catch (error: any) {
      throw new Error("Failed to find available drivers");
    }
  }

  async uploadProofOfDelivery(
    deliveryId: string,
    file: File,
  ): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append("proof", file);

      const response = await api.post(
        `/deliveries/${deliveryId}/proof`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to upload proof");
    } catch (error: any) {
      throw new Error("Failed to upload proof of delivery");
    }
  }

  async getDeliveryHistory(
    userId?: string,
  ): Promise<PaginatedResponse<Delivery>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Delivery>>>(
        "/deliveries/history",
        {
          params: { userId },
        },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get history");
    } catch (error: any) {
      throw new Error("Failed to load delivery history");
    }
  }
}

export const deliveryService = new DeliveryService();
