import { api } from "./api";
import type { User, ApiResponse } from "./types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "customer" | "driver" | "admin";
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    const storedAccessToken = localStorage.getItem("rideflow_access_token");
    const storedRefreshToken = localStorage.getItem("rideflow_refresh_token");
    const storedUser = localStorage.getItem("rideflow_user");

    if (storedAccessToken && storedUser) {
      this.accessToken = storedAccessToken;
      this.refreshToken = storedRefreshToken;
      this.currentUser = JSON.parse(storedUser);
      this.updateApiToken(storedAccessToken);
    }
  }

  private updateApiToken(token: string) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  private normalizeUser(raw: any): User {
    return {
      id: raw.id,
      email: raw.email,
      role: raw.role,
      name: raw.name || raw.email?.split("@")[0] || "User",
      phone: raw.phone || "",
      createdAt: new Date(raw.createdAt || new Date()),
      updatedAt: new Date(raw.updatedAt || new Date()),
    };
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
const response = await api.post("/auth/signin", credentials);

const data = response.data as { accessToken: string; refreshToken?: string; user: any };
const accessToken = data.accessToken;
const refreshToken = data.refreshToken;
const userRaw = data.user;

    if (!accessToken || !userRaw) {
      throw new Error("Invalid login response: Missing token or user data");
    }

    const user = this.normalizeUser(userRaw);
    this.setTokens(accessToken, refreshToken);
    this.setCurrentUser(user);

    return { user, accessToken, refreshToken };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/signup", data);

    const accessToken = response.data.data?.accessToken;
    const refreshToken = response.data.data?.refreshToken;
    const userRaw = response.data.data?.user;

    if (!accessToken || !userRaw) {
      throw new Error("Invalid registration response: Missing token or user data");
    }

    const user = this.normalizeUser(userRaw);
    this.setTokens(accessToken, refreshToken);
    this.setCurrentUser(user);

    return { user, accessToken, refreshToken };
  }

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>("/auth/profile");

    if (response.data.success && response.data.data) {
      const user = this.normalizeUser(response.data.data);
      this.setCurrentUser(user);
      return user;
    }

    throw new Error("Failed to fetch profile");
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>("/auth/profile", userData);

    if (response.data.success && response.data.data) {
      const user = this.normalizeUser(response.data.data);
      this.setCurrentUser(user);
      return user;
    }

    throw new Error("Failed to update profile");
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>("/auth/change-password", {
      currentPassword,
      newPassword,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to change password");
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>("/auth/forgot-password", { email });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to send reset email");
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh", {
      refreshToken: this.refreshToken
    });

    const newAccessToken = response.data.data?.accessToken;
    if (!newAccessToken) {
      throw new Error("Token refresh failed");
    }

    this.setAccessToken(newAccessToken);
    return newAccessToken;
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    localStorage.setItem("rideflow_access_token", accessToken);
    this.updateApiToken(accessToken);

    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem("rideflow_refresh_token", refreshToken);
    }
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem("rideflow_access_token", token);
    this.updateApiToken(token);
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem("rideflow_user", JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken && this.currentUser);
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser = null;
    localStorage.removeItem("rideflow_access_token");
    localStorage.removeItem("rideflow_refresh_token");
    localStorage.removeItem("rideflow_user");
    delete api.defaults.headers.common["Authorization"];
  }

  clearCurrentUser(): void {
    this.currentUser = null;
    localStorage.removeItem("rideflow_user");
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  canAccess(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.currentUser?.role ?? "");
  }

  getRedirectPath(role: string): string {
    const stored = sessionStorage.getItem("redirectAfterLogin");
    if (stored) {
      sessionStorage.removeItem("redirectAfterLogin");
      return stored;
    }

    switch (role) {
      case "admin":
        return "/dashboard/Admin";
      case "driver":
        return "/dashboard/Driver";
      case "customer":
        return "/dashboard/customer";
      default:
        return "/";
    }
  }
}

export const authService = new AuthService();