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
