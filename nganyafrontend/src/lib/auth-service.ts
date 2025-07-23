// src/lib/auth-service.ts
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
    console.log('AuthService constructor: Initializing...');
    const storedAccessToken = localStorage.getItem("rideflow_access_token");
    const storedRefreshToken = localStorage.getItem("rideflow_refresh_token");
    const storedUser = localStorage.getItem("rideflow_user");

    console.log('AuthService constructor: Stored access token from localStorage:', storedAccessToken ? 'PRESENT' : 'MISSING', '(value:', storedAccessToken, ')');
    console.log('AuthService constructor: Stored user from localStorage:', storedUser ? 'PRESENT' : 'MISSING');

    if (storedAccessToken && storedUser) {
      this.accessToken = storedAccessToken;
      this.refreshToken = storedRefreshToken;
      this.currentUser = JSON.parse(storedUser);
      this.updateApiToken(storedAccessToken);
      console.log('AuthService constructor: Successfully initialized from localStorage.');
    } else {
      console.log('AuthService constructor: No complete auth data in localStorage.');
    }
  }

  private updateApiToken(token: string) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log('AuthService: API Authorization header updated with token:', token ? 'PRESENT' : 'MISSING');
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
    console.log('AuthService: login function called for email:', credentials.email);
    const response = await api.post("/auth/signin", credentials);
    console.log('AuthService: login - API response received. Status:', response.status);

    const data = response.data as { accessToken: string; refreshToken?: string; user: any };
    const accessToken = data.accessToken;
    const refreshToken = data.refreshToken;
    const userRaw = data.user;

    console.log('AuthService: login - Response data parsed. accessToken from API:', accessToken ? 'PRESENT' : 'MISSING', '(value:', accessToken, ')');
    console.log('AuthService: login - User data from API:', userRaw ? 'PRESENT' : 'MISSING');

    if (!accessToken || !userRaw) {
      console.error("AuthService: Invalid login response: Missing token or user data");
      throw new Error("Invalid login response: Missing token or user data");
    }

    const user = this.normalizeUser(userRaw);
    this.setTokens(accessToken, refreshToken); // This calls setAccessToken internally
    this.setCurrentUser(user);
    console.log('AuthService: login - Tokens and user set internally. Current internal accessToken:', this.accessToken ? 'PRESENT' : 'MISSING');

    return { user, accessToken, refreshToken };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log('AuthService: register function called for email:', data.email);
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/signup", data);
    console.log('AuthService: register - API response received. Status:', response.status);

    const accessToken = response.data.data?.accessToken;
    const refreshToken = response.data.data?.refreshToken;
    const userRaw = response.data.data?.user;

    console.log('AuthService: register - Response data parsed. accessToken from API:', accessToken ? 'PRESENT' : 'MISSING', '(value:', accessToken, ')');
    console.log('AuthService: register - User data from API:', userRaw ? 'PRESENT' : 'MISSING');

    if (!accessToken || !userRaw) {
      console.error("AuthService: Invalid registration response: Missing token or user data");
      throw new Error("Invalid registration response: Missing token or user data");
    }

    const user = this.normalizeUser(userRaw);
    this.setTokens(accessToken, refreshToken);
    this.setCurrentUser(user);
    console.log('AuthService: register - Tokens and user set internally. Current internal accessToken:', this.accessToken ? 'PRESENT' : 'MISSING');

    return { user, accessToken, refreshToken };
  }

  async getProfile(): Promise<User> {
    console.log('AuthService: getProfile function called.');
    const response = await api.get<ApiResponse<User>>("/auth/profile");
    console.log('AuthService: getProfile - API response received. Status:', response.status);

    if (response.data.success && response.data.data) {
      const user = this.normalizeUser(response.data.data);
      this.setCurrentUser(user);
      console.log('AuthService: getProfile - Profile fetched successfully. Current internal user:', this.currentUser ? 'PRESENT' : 'MISSING');
      return user;
    }

    console.error('AuthService: Failed to fetch profile:', response.data.message);
    throw new Error("Failed to fetch profile");
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    console.log('AuthService: updateProfile function called.');
    const response = await api.put<ApiResponse<User>>("/auth/profile", userData);
    console.log('AuthService: updateProfile - API response received. Status:', response.status);

    if (response.data.success && response.data.data) {
      const user = this.normalizeUser(response.data.data);
      this.setCurrentUser(user);
      console.log('AuthService: updateProfile - Profile updated successfully.');
      return user;
    }

    console.error('AuthService: Failed to update profile:', response.data.message);
    throw new Error("Failed to update profile");
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    console.log('AuthService: changePassword function called.');
    const response = await api.post<ApiResponse<void>>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    console.log('AuthService: changePassword - API response received. Status:', response.status);

    if (!response.data.success) {
      console.error('AuthService: Failed to change password:', response.data.message);
      throw new Error(response.data.message || "Failed to change password");
    }
    console.log('AuthService: Password changed successfully.');
  }

  async forgotPassword(email: string): Promise<void> {
    console.log('AuthService: forgotPassword function called for email:', email);
    const response = await api.post<ApiResponse<void>>("/auth/forgot-password", { email });
    console.log('AuthService: forgotPassword - API response received. Status:', response.status);

    if (!response.data.success) {
      console.error('AuthService: Failed to send reset email:', response.data.message);
      throw new Error(response.data.message || "Failed to send reset email");
    }
    console.log('AuthService: Reset email sent successfully.');
  }

  async refreshAccessToken(): Promise<string> {
    console.log('AuthService: refreshAccessToken function called.');
    if (!this.refreshToken) {
      console.warn('AuthService: No refresh token available for refresh, throwing error.');
      throw new Error("No refresh token available");
    }

    console.log('AuthService: Calling /auth/refresh with refresh token.');
    const response = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh", {
      refreshToken: this.refreshToken
    });
    console.log('AuthService: /auth/refresh API response received. Status:', response.status);

    const newAccessToken = response.data.data?.accessToken;
    if (!newAccessToken) {
      console.error('AuthService: Token refresh failed: Missing new access token in response.');
      throw new Error("Token refresh failed");
    }

    this.setAccessToken(newAccessToken);
    console.log('AuthService: Access token refreshed successfully. New internal accessToken:', this.accessToken ? 'PRESENT' : 'MISSING');
    return newAccessToken;
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    console.log('AuthService: setTokens called. New accessToken present:', accessToken ? 'YES' : 'NO', '(value:', accessToken, ')');
    this.accessToken = accessToken;
    localStorage.setItem("rideflow_access_token", accessToken);
    this.updateApiToken(accessToken);

    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem("rideflow_refresh_token", refreshToken);
      console.log('AuthService: Refresh token also set. RefreshToken present:', refreshToken ? 'YES' : 'NO');
    }
  }

  setAccessToken(token: string): void {
    console.log('AuthService: setAccessToken called. Token present:', token ? 'YES' : 'NO', '(value:', token, ')');
    this.accessToken = token;
    localStorage.setItem("rideflow_access_token", token);
    this.updateApiToken(token);
  }

  setCurrentUser(user: User): void {
    console.log('AuthService: setCurrentUser called. User present:', user ? 'YES' : 'NO');
    this.currentUser = user;
    localStorage.setItem("rideflow_user", JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    console.log('AuthService: getCurrentUser called. Returning internal user:', this.currentUser ? 'PRESENT' : 'MISSING');
    return this.currentUser;
  }

  getAccessToken(): string | null {
    console.log('AuthService: getAccessToken called. Returning internal accessToken:', this.accessToken ? 'PRESENT' : 'MISSING');
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    console.log('AuthService: getRefreshToken called. Returning internal refreshToken:', this.refreshToken ? 'PRESENT' : 'MISSING');
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    console.log('AuthService: isAuthenticated called. AccessToken:', this.accessToken ? 'PRESENT' : 'MISSING', 'CurrentUser:', this.currentUser ? 'PRESENT' : 'MISSING');
    return !!(this.accessToken && this.currentUser);
  }

  logout(): void {
    console.log('AuthService: logout function called. Clearing all tokens and user data.');
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser = null;
    localStorage.removeItem("rideflow_access_token");
    localStorage.removeItem("rideflow_refresh_token");
    localStorage.removeItem("rideflow_user");
    delete api.defaults.headers.common["Authorization"];
  }

  clearCurrentUser(): void {
    console.log('AuthService: clearCurrentUser called.');
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
