import "./styles.css";

import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";

import { BottomNavigation } from "@/components/BottomNavigation";
import { ModernNavigation } from "./components/Header";

import { RouterProvider, createRouter, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons missing in Leaflet
// Ensure this is done only once, and before any map components try to render
if (typeof L !== 'undefined' && L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
  // Only delete if it exists to prevent errors if it was already deleted
  if (L.Icon.Default.prototype._getIconUrl) {
    delete L.Icon.Default.prototype._getIconUrl;
  }
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
}
// --- LEAFLET ICON FIX END ---

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// Create Router
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

// Register router types
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Inner Layout that uses useRouter (now safe)
function AppLayout() {
  const router = useRouter();
  const location = router.state.location;

  const showBottomNav = !["/", "/pages/DriverDashboard", "/pages/AdminDashboard"].includes(location.pathname);
  const showTopNav = true;

  return (
    <div className="min-h-screen bg-background">
      {showTopNav && <ModernNavigation />}
      <main className={showTopNav ? "pt-0" : ""}>
        {/* TanStack Router handles route outlet automatically */}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}

// Full App wrapped properly
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="rideflow-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
        
          <RouterProvider router={router} />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

// Mount App to DOM
createRoot(document.getElementById("root")!).render(<App />);
