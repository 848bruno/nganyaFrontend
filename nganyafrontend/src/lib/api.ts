const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ridesharingbackend-x2gi.onrender.com";

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
  headers: any;
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
    this.token = localStorage.getItem("access_token");
    this.defaults = {
      headers: {
        common: {},
      },
    };
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("access_token", token);
    this.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("access_token");
    delete this.defaults.headers.common["Authorization"];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<AxiosResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.defaults.headers.common,
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    // Only log in development or when not in demo mode
    const isDemoMode = this.token?.startsWith("demo-token-");
    if (!isDemoMode && import.meta.env.DEV) {
      console.log("API Request:", {
        url,
        method: options.method || "GET",
        headers: Object.fromEntries(
          Object.entries(headers).filter(([key]) => key !== "Authorization"),
        ),
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors", // Explicitly set CORS mode
      });

      // Only log in development or when not in demo mode
      if (!isDemoMode && import.meta.env.DEV) {
        console.log("API Response:", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });
      }

      // Clone the response so we can read it multiple times if needed
      const responseClone = response.clone();
      let data;

      try {
        // First try to read as text to avoid JSON parsing issues
        const textData = await response.text();

        if (!textData) {
          data = {};
        } else {
          // Try to parse as JSON
          try {
            data = JSON.parse(textData);
          } catch (jsonError) {
            // If JSON parsing fails, treat as plain text
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

        // Only log errors in development or when not in demo mode
        if (!isDemoMode && import.meta.env.DEV) {
          console.error("API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            message: errorMessage,
            data: data,
          });
        }
        throw error;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error: any) {
      // Only log unexpected errors, not network failures when API is down
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

      // Enhance error message for common issues
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

  // Health check method to test API connectivity
  async healthCheck(): Promise<boolean> {
    try {
      // Try a simple GET request to check if the API is reachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(this.baseURL, {
        method: "GET",
        mode: "cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Consider API healthy if we get any response (even error responses)
      return response.status < 500;
    } catch (error: any) {
      // Don't log network errors as they're expected when API is down
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
