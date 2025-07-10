import {
  MapPin,
  Menu,
  User,
  Bell,
  Car,
  Package,
  Globe,
  Phone,
} from "lucide-react";
import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthDialog } from "@/components/auth-dialog";
import { AuthContext } from "@/contexts/AuthContext";

import { useRouter, useLocation } from "@tanstack/react-router";

const navigationItems = [
  {
    label: "Book Ride",
    href: "/Booking",
    icon: Car,
    description: "Book instant rides",
  },
  {
    label: "Drive & Earn",
    href: "/Drive",
    icon: Car,
    description: "Start earning as a driver",
  },
  {
    label: "Delivery",
    href: "/Delivery",

    icon: Package,
    description: "Send packages",
  },
  {
    label: "Driver Hub",
    href: "/Drive",
    icon: Car,
    description: "Driver dashboard",
  },
];

export function ModernNavigation() {
  const router = useRouter();
  const location = useLocation();
  const authContext = useContext(AuthContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<"signin" | "signup">(
    "signin"
  );
  const [authDialogRole, setAuthDialogRole] = useState<
    "customer" | "driver" | "admin"
  >("");

  const openAuthDialog = (
    tab: "signin" | "signup",
    role: "customer" | "driver" | "admin"
  ) => {
    setAuthDialogTab(tab);
    setAuthDialogRole(role);
    setAuthDialogOpen(true);
  };

  const handleSignOut = () => {
    authContext?.logout?.();
    router.navigate({ to: "/" });
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.navigate({ to: "/" })}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    RideFlow
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Transportation Platform
                  </p>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {location.pathname === "/" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!authContext?.isAuthenticated) {
                        localStorage.setItem(
                          "rideflow_token",
                          "demo-token-customer"
                        );
                      }
                      router.navigate({ to: "/Booking" });
                    }}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Book Ride
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!authContext?.isAuthenticated) {
                        localStorage.setItem(
                          "rideflow_token",
                          "demo-token-driver"
                        );
                      }
                      router.navigate({ to: "/Drive" });
                    }}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Drive & Earn
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!authContext?.isAuthenticated) {
                        localStorage.setItem(
                          "rideflow_token",
                          "demo-token-customer"
                        );
                      }
                      router.navigate({ to: "/Delivery" });
                    }}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Delivery
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.navigate({ to: "/Services" })}
              >
                <Globe className="w-4 h-4 mr-2" />
                Services
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.navigate({ to: "/Contact" })}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {authContext?.isAuthenticated &&
                !["/", "/services", "/contact"].includes(location.pathname) && (
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                    >
                      0
                    </Badge>
                  </Button>
                )}

              {!authContext?.isLoading && authContext?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" alt="User" />
                        <AvatarFallback className="bg-primary/10">
                          {authContext.user.name?.[0].toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{authContext.user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {authContext.user.email}
                        </p>
                        <Badge variant="secondary" className="w-fit text-xs">
                          {authContext.user.role}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.navigate({ to: "/profile" })}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAuthDialog("signin")}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openAuthDialog("signup")}
                    className="hidden sm:flex"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary-foreground" />
                      </div>
                      RideFlow
                    </SheetTitle>
                    <SheetDescription>
                      Your comprehensive transportation platform
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-8 space-y-4">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.href}
                          variant={isActive(item.href) ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            router.navigate({ to: item.href });
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          </div>
                        </Button>
                      );
                    })}

                    {!authContext?.user && (
                      <div className="border-t pt-4 mt-6">
                        <Button
                          className="w-full mb-2"
                          onClick={() => {
                            openAuthDialog("signup", "customer");
                            setMobileMenuOpen(false);
                          }}
                        >
                          Get Started
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            openAuthDialog("signin");
                            setMobileMenuOpen(false);
                          }}
                        >
                          Sign In
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultTab={authDialogTab}
        defaultRole={authDialogRole}
      />
    </>
  );
}
