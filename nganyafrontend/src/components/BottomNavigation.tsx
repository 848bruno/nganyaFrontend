import { Home, Car, Package, User, MapPin } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export function BottomNavigation() {
  const router = useRouter();
  const location = router.state.currentLocation;

  const navItems = [
    { path: "/index", icon: Home, label: "Home" },
    { path: "/booking", icon: Car, label: "Rides" },
    { path: "/delivery", icon: Package, label: "Delivery" },
    { path: "/drive", icon: MapPin, label: "Drive" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => router.navigate({ to: item.path })}
              className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-1 ${isActive ? "text-primary" : ""}`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}