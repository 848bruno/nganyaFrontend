// src/lib/api.ts
import { authService } from './auth-service'; // Assuming auth-service is in the same lib directory

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Axios-like response interface
export interface AxiosResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers; // Changed to Headers type for consistency with fetch
}

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  public defaults: {
    headers: {
      common: Record<string, string>;
    };
  };

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    // ⭐ Initialize token from localStorage directly
    this.token = localStorage.getItem("rideflow_access_token"); // Ensure this key matches auth-service
    this.defaults = {
      headers: {
        common: {},
      },
    };
    // ⭐ Set initial Authorization header if token exists
    if (this.token) {
      this.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("rideflow_access_token", token); // Ensure this key matches auth-service
    this.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("rideflow_access_token"); // Ensure this key matches auth-service
    delete this.defaults.headers.common["Authorization"];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0 // ⭐ New parameter for retry logic ⭐
  ): Promise<AxiosResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.defaults.headers.common,
      ...(options.headers as Record<string, string>),
    };

    // Always ensure the latest token is used for the request
    const currentToken = authService.getAccessToken(); 
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    } else {
      delete headers["Authorization"]; // Remove if no token is available
    }

    const isDemoMode = currentToken?.startsWith("demo-token-");
    if (!isDemoMode && import.meta.env.DEV) {
      console.log("API Request:", {
        url,
        method: options.method || "GET",
        headers: Object.fromEntries(
          Object.entries(headers).filter(([key]) => key !== "Authorization"),
        ),
        retryCount // ⭐ Log retry count ⭐
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
      });

      if (!isDemoMode && import.meta.env.DEV) {
        console.log("API Response:", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });
      }

      const responseClone = response.clone();
      let data;

      try {
        const textData = await response.text();
        if (!textData) {
          data = {};
        } else {
          try {
            data = JSON.parse(textData);
          } catch (jsonError) {
            if (!isDemoMode && import.meta.env.DEV) {
              console.log("Non-JSON response:", textData);
            }
            data = { message: textData };
          }
        }
      } catch (readError) {
        if (!isDemoMode && import.meta.env.DEV) {
          console.error("Failed to read response:", readError);
        }
        data = { message: "Failed to read server response" };
      }

      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data?.message
            ? data.message
            : typeof data === "string"
              ? data
              : `HTTP ${response.status}: ${response.statusText}`;

        const error = {
          response: {
            data: data,
            status: response.status,
            statusText: response.statusText,
          },
          message: errorMessage,
        };

        if (!isDemoMode && import.meta.env.DEV) {
          console.error("API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            message: errorMessage,
            data: data,
          });
        }

        // ⭐ START: Token Refresh Logic ⭐
        if (response.status === 401 && retryCount === 0 && endpoint !== '/auth/refresh') { // Prevent infinite refresh loop
            console.log("API Client: 401 received, attempting token refresh...");
            try {
                const newAccessToken = await authService.refreshAccessToken();
                // Update client's internal token
                this.setToken(newAccessToken); 
                // Retry the original request with the new token
                console.log("API Client: Token refreshed, retrying original request for endpoint:", endpoint);
                return this.request<T>(endpoint, options, retryCount + 1); // Increment retryCount
            } catch (refreshError: any) {
                console.error("API Client: Token refresh failed, logging out.", refreshError.message);
                authService.logout(); // Ensure logout on refresh failure
                // Re-throw the original 401 error or the refresh error, depending on desired behavior
                throw { ...error, message: refreshError.message || "Failed to refresh token, logging out." };
            }
        }
        // ⭐ END: Token Refresh Logic ⭐

        throw error; // Re-throw if not a 401 or retry attempt fails
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error: any) {
      if (
        !isDemoMode &&
        import.meta.env.DEV &&
        !error.message?.includes("Failed to fetch")
      ) {
        console.error("API Request failed:", {
          url,
          error: error.message,
        });
      }

      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your internet connection and try again.",
        );
      }

      throw error;
    }
  }

  // --- Existing methods remain the same, they will call the updated request method ---

  async get<T>(
    endpoint: string,
    config?: { params?: any },
  ): Promise<AxiosResponse<T>> {
    let url = endpoint;
    if (config?.params) {
      const searchParams = new URLSearchParams();
      Object.keys(config.params).forEach((key) => {
        if (config.params[key] !== undefined && config.params[key] !== null) {
          searchParams.append(key, config.params[key].toString());
        }
      });
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<AxiosResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<AxiosResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<AxiosResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); 

      const response = await fetch(this.baseURL, {
        method: "GET",
        mode: "cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return response.status < 500;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("API health check timed out");
      } else if (!error.message?.includes("Failed to fetch")) {
        console.warn("API health check failed:", error.message);
      }
      return false;
    }
  }
}

export const apiClient = new ApiClient();

// Export as 'api' for compatibility with new services
export const api = apiClient;