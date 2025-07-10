import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requireAuth = true,
}: ProtectedRouteProps) {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // Check if we're in demo mode
    const token = localStorage.getItem("rideflow_token");
    const isDemoMode = token?.startsWith("demo-token-");

    // If authentication is required and user is not authenticated
    if (requireAuth && !authContext?.isAuthenticated) {
      // Store the attempted route for redirect after login
      sessionStorage.setItem("redirectAfterLogin", router.state.location.pathname);
      router.navigate({ to: "/", replace: true });
      return;
    }

    // In demo mode, allow access to all dashboards regardless of role
    if (isDemoMode) {
      return; // Allow access to any route in demo mode
    }

    // If user is authenticated but doesn't have the required role (production mode only)
    if (
      authContext?.isAuthenticated &&
      allowedRoles.length > 0 &&
      authContext.user?.role &&
      !allowedRoles.includes(authContext.user.role) &&
      !isDemoMode
    ) {
      // Redirect to appropriate dashboard based on user role
      switch (authContext.user.role) {
        case "driver":
          router.navigate({ to: "/pages/DriverDashboard", replace: true });
          break;
        case "admin":
          router.navigate({ to: "/pages/AdminDashboard", replace: true });
          break;
        default:
          router.navigate({ to: "/app", replace: true });
      }
      return;
    }
  }, [
    authContext?.isAuthenticated,
    authContext?.user?.role,
    allowedRoles,
    requireAuth,
    router,
  ]);

  // Show loading spinner while checking authentication
  if (authContext?.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !authContext?.isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Check if we're in demo mode for final render check
  const token = localStorage.getItem("rideflow_token");
  const isDemoMode = token?.startsWith("demo-token-");

  // If role restriction exists and user doesn't have required role (production mode only)
  if (
    authContext?.isAuthenticated &&
    allowedRoles.length > 0 &&
    authContext.user?.role &&
    !allowedRoles.includes(authContext.user.role) &&
    !isDemoMode
  ) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}