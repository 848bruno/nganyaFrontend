import {
  Home,
  Car,
  Users,
  Package,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  MapPin,
  CreditCard,
  Bell,
  Star,
  Route,
  Truck,
  Calendar,
  User,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useContext, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  badge?: string;
  subItems?: SidebarItem[];
}

interface DashboardSidebarProps {
  userType: "customer" | "driver" | "admin";
}

const sidebarItems = {
  customer: [
    { icon: Home, label: "Dashboard", href: "/index" },
    { icon: Car, label: "Book Ride", href: "/Booking" },
    { icon: Users, label: "Carpool", href: "/Carpool" },
    { icon: Package, label: "Delivery", href: "/Delivery" },
    { icon: MapPin, label: "My Trips", href: "/MyTrips" },
    { icon: CreditCard, label: "Payments", href: "/Payments" },
    { icon: Star, label: "Reviews", href: "/Reviews" },
    {
      icon: Bell,
      label: "Notifications",
      href: "/notifications",
      badge: "3",
    },
  ],
  driver: [
    { icon: Home, label: "Home", href: "/index" },
    { icon: Car, label: "My Rides", href: "/Rides" },
    { icon: Route, label: "Routes", href: "/Routes" },
    { icon: Truck, label: "Vehicle", href: "/Vehicle" },
    { icon: BarChart3, label: "Earnings", href: "/Earnings" },
    { icon: Calendar, label: "Schedule", href: "/Schedule" },
    { icon: Star, label: "Reviews", href: "/Reviews" },
    {
      icon: Bell,
      label: "Notifications",
      href: "notifications",
      badge: "5",
    },
  ],
  admin: [
    { icon: Home, label: "home", href: "/" },
    { icon: Users, label: "Users", href: "/User" },
    { icon: Car, label: "Drivers", href: "/admin/drivers" },
    { icon: Truck, label: "Vehicles", href: "/vehicles" },
    { icon: MapPin, label: "Rides", href: "/admin-dashboard/rides" },
    { icon: Package, label: "Deliveries", href: "/admin-dashboard/deliveries" },
    { icon: BarChart3, label: "Analytics", href: "/admin-dashboard/analytics" },
    { icon: CreditCard, label: "Payments", href: "/admin-dashboard/payments" },
    {
      icon: Bell,
      label: "Notifications",
      href: "/admin-dashboard/notifications",
      badge: "12",
    },
  ],
};

export function DashboardSidebar({ userType }: DashboardSidebarProps) {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = sidebarItems[userType] || [];

  const handleSignOut = () => {
    if (authContext?.logout) {
      authContext.logout();
    }
    router.navigate({ to: "/" });
  };

  const isActive = (href: string) => {
    const pathname = router.state.location.pathname;
    if (href === "/index" && pathname === "/index") return true;
    if (href === "/driver" && pathname === "/driver") return true;
    if (href === "/admin" && pathname === "/admin") return true;
    return (
      pathname.startsWith(href) &&
      href !== "/index" &&
      href !== "/driver" &&
      href !== "/admin"
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
     

      {/* User Info */}
      {/* <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary/10">
              {authContext?.user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {authContext?.user?.name || "User"}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {authContext?.user?.role || userType}
                </Badge>
                {userType === "driver" && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      Online
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div> */}

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex items-center gap-3 h-11 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                collapsed ? "px-3" : "px-4",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant={active ? "secondary" : "default"}
                      className="ml-auto"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>

      <Separator />

      {/* Footer Actions */}
      <div className="p-4 space-y-1">
        <Link
          to="/profile"
          className={cn(
            "flex items-center gap-3 h-11 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            collapsed ? "px-3" : "px-4",
          )}
        >
          <User className="w-5 h-5 flex-shrink-0" />
          {!collapsed && "Profile"}
        </Link>

        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 h-11 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            collapsed ? "px-3" : "px-4",
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && "Settings"}
        </Link>

        <Link
          to="/help"
          className={cn(
            "flex items-center gap-3 h-11 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            collapsed ? "px-3" : "px-4",
          )}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!collapsed && "Help"}
        </Link>

        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 h-11 px-4 py-2 rounded-md text-sm font-medium transition-colors w-full text-destructive hover:bg-accent hover:text-destructive",
            collapsed ? "px-3" : "px-4",
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-6 z-10 rounded-full border bg-background shadow-md"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform",
                collapsed && "rotate-180",
              )}
            />
          </Button>
        </div>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarContent />
        </div>

        {/* Mobile Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-30 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}