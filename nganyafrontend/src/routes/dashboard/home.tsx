// import { useState, useEffect } from "react";
// import { MapPin, Car, Users,  BarChart, Eye,  EyeOff,  ArrowRight,  Star, Shield, Clock, Package, DollarSign, Zap, CheckCircle, PlayCircle, Loader2, Phone, Mail, Globe, TrendingUp, Award,
//   // Lightning,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Progress } from "@/components/ui/progress";
// import { authService } from "@/lib/auth-service";
// import { toast } from "@/components/ui/use-toast";
// import { Link, useRouter, useSearch } from "@tanstack/react-router";

// export default function ModernHome() {
//   const router = useRouter();
//   const search = useSearch();
//   const [activeTab, setActiveTab] = useState("signin");
//   const [userRole, setUserRole] = useState<"customer" | "driver" | "admin">("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
//     name: "",
//     phone: "",
//   });

//   // Handle URL parameters
//   useEffect(() => {
//     const type = search.type as string;
//     const action = search.action as string;

//     if (type && ["customer", "driver", "admin"].includes(type)) {
//       setUserRole(type as "customer" | "driver" | "admin");
//     }

//     if (action && ["signin", "signup"].includes(action)) {
//       setActiveTab(action);
//     }
//   }, [search]);

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleLogin = async () => {
//     if (!userRole) {
//       toast({
//         title: "Role Required",
//         description: "Please select your role before signing in.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!formData.email || !formData.password) {
//       toast({
//         title: "Missing Information",
//         description: "Please enter your email and password.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await authService.login({
//         email: formData.email,
//         password: formData.password,
//       });

//       if (response.user.role !== userRole) {
//         toast({
//           title: "Role Mismatch",
//           description: `Your account is registered as ${response.user.role}, not ${userRole}.`,
//           variant: "destructive",
//         });
//         setIsLoading(false);
//         return;
//       }

//       authService.setCurrentUser(response.user);
//       toast({
//         title: "Welcome back!",
//         description: `Successfully signed in as ${response.user.name}`,
//       });

//       switch (response.user.role) {
//         case "driver":
//           router.navigate({ to: "/dashboard/driver" });
//           break;
//         case "admin":
//           router.navigate({ to: "/dashboard/admin" });
//           break;
//         case "customer":
//           router.navigate({ to: "/dashboard/customer" });
//           break;
//         default:
//           router.navigate({ to: "/index" });
//       }

//     } catch (error: any) {
//       toast({
//         title: "Sign In Failed",
//         description: error.message || "Invalid credentials. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRegister = async () => {
//     if (!userRole) {
//       toast({
//         title: "Role Required",
//         description: "Please select your role before signing up.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!formData.name || !formData.email || !formData.password) {
//       toast({
//         title: "Missing Information",
//         description: "Please fill in all required fields.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast({
//         title: "Password Mismatch",
//         description: "Passwords do not match. Please try again.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await authService.register({
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         phone: formData.phone,
//         role: userRole,
//       });

//       authService.setCurrentUser(response.user);
//       toast({
//         title: "Welcome to RideFlow!",
//         description: `Account created successfully for ${response.user.name}`,
//       });

//       switch (response.user.role) {
//         case "driver":
//           router.navigate({ to: "/dashboard/driver" });
//           break;
//         case "admin":
//           router.navigate({ to: "/dashboard/admin" });
//           break;
//         case "customer":
//           router.navigate({ to: "/dashboard/customer" });
//           break;
//         default:
//           router.navigate({ to: "/index" });
//       }
//     } catch (error: any) {
//       toast({
//         title: "Registration Failed",
//         description:
//           error.message || "Unable to create account. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const services = [
//     {
//       title: "Ride Booking",
//       description: "Book instant rides with professional drivers in your area",
//       icon: Car,
//       gradient: "from-blue-500 to-blue-600",
//       features: [
//         "Real-time GPS tracking",
//         "Multiple vehicle options",
//         "Secure payment methods",
//         "24/7 availability",
//       ],
//     },
//     {
//       title: "Ride Sharing",
//       description: "Share rides and save money while meeting new people",
//       icon: Users,
//       gradient: "from-green-500 to-green-600",
//       features: [
//         "Save up to 60% on rides",
//         "Eco-friendly travel",
//         "Meet verified riders",
//         "Flexible scheduling",
//       ],
//     },
//     {
//       title: "Package Delivery",
//       description: "Fast and reliable delivery service for your packages",
//       icon: Package,
//       gradient: "from-purple-500 to-purple-600",
//       features: [
//         "Same-day delivery",
//         "Package tracking",
//         "Secure handling",
//         "Proof of delivery",
//       ],
//     },
//     {
//       title: "Driver Platform",
//       description: "Earn money driving with flexible schedules",
//       icon: DollarSign,
//       gradient: "from-orange-500 to-orange-600",
//       features: [
//         "Competitive earnings",
//         "Flexible hours",
//         "Driver support",
//         "Performance bonuses",
//       ],
//     },
//   ];

//   const stats = [
//     {
//       label: "Active Users",
//       value: "50K+",
//       icon: Users,
//       color: "text-blue-600",
//     },
//     {
//       label: "Completed Rides",
//       value: "1M+",
//       icon: Car,
//       color: "text-green-600",
//     },
//     {
//       label: "Cities Covered",
//       value: "25+",
//       icon: Globe,
//       color: "text-purple-600",
//     },
//     {
//       label: "Average Rating",
//       value: "4.8",
//       icon: Star,
//       color: "text-yellow-600",
//     },
//   ];

//   const testimonials = [
//     {
//       name: "Sarah Johnson",
//       role: "Regular Customer",
//       content:
//         "RideFlow has revolutionized my daily commute. The drivers are professional and the app is super easy to use.",
//       avatar: "SJ",
//       rating: 5,
//     },
//     {
//       name: "Mike Rodriguez",
//       role: "Driver Partner",
//       content:
//         "I love the flexibility RideFlow offers. I can work whenever I want and the earnings are great!",
//       avatar: "MR",
//       rating: 5,
//     },
//     {
//       name: "Emma Chen",
//       role: "Business Owner",
//       content:
//         "The delivery service has been a game-changer for our business. Fast, reliable, and professional.",
//       avatar: "EC",
//       rating: 5,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
//       {/* Hero Section */}
//       <section className="relative overflow-hidden">
//         <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
//         <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-background/80" />

//         <div className="relative container mx-auto px-4 py-24">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//             {/* Left Column - Hero Content */}
//             <div className="space-y-8">
//               <div className="space-y-6">
//                 <Badge variant="secondary" className="w-fit">
//                   {/* <Lightning className="w-3 h-3 mr-1" /> */}
//                   Now Available in 25+ Cities
//                 </Badge>

//                 <h1 className="text-5xl md:text-6xl font-bold leading-tight">
//                   The Future of{" "}
//                   <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
//                     Transportation
//                   </span>
//                 </h1>

//                 <p className="text-xl text-muted-foreground leading-relaxed">
//                   RideFlow connects riders, drivers, and businesses through our
//                   comprehensive transportation platform. Experience safe,
//                   reliable, and affordable mobility solutions at your
//                   fingertips.
//                 </p>
//               </div>

//               {/* Quick Stats */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                 {stats.map((stat, index) => {
//                   const Icon = stat.icon;
//                   return (
//                     <div key={index} className="text-center">
//                       <div className="flex justify-center mb-2">
//                         <Icon className={`w-6 h-6 ${stat.color}`} />
//                       </div>
//                       <div className="text-2xl font-bold">{stat.value}</div>
//                       <div className="text-sm text-muted-foreground">
//                         {stat.label}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* CTA Buttons */}
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <Link to="/app">
//                   <Button
//                     size="lg"
//                     className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
//                   >
//                     <PlayCircle className="w-5 h-5" />
//                     Try Demo Now
//                   </Button>
//                 </Link>
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   onClick={() => setActiveTab("signup")}
//                   className="flex items-center gap-2"
//                 >
//                   <ArrowRight className="w-5 h-5" />
//                   Get Started Free
//                 </Button>
//               </div>

//               {/* Trust Indicators */}
//               <div className="flex items-center gap-6 pt-6 border-t border-border">
//                 <div className="flex items-center gap-2">
//                   <Shield className="w-5 h-5 text-green-600" />
//                   <span className="text-sm font-medium">
//                     Bank-level Security
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Clock className="w-5 h-5 text-blue-600" />
//                   <span className="text-sm font-medium">24/7 Support</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Award className="w-5 h-5 text-yellow-600" />
//                   <span className="text-sm font-medium">Award Winning</span>
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - Authentication Form */}
//             <div className="lg:pl-8">
//               <Card className="w-full max-w-md mx-auto shadow-2xl bg-card/50 backdrop-blur-sm border-border/50">
//                 <CardHeader className="text-center pb-4">
//                   <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
//                     Join RideFlow Today
//                   </CardTitle>
//                   <p className="text-muted-foreground">
//                     Choose your role and start your journey
//                   </p>
//                 </CardHeader>

//                 <CardContent className="space-y-6">
//                   {/* Role Selection */}
//                   <div className="space-y-3">
//                     <Label className="text-sm font-medium">
//                       I want to join as:
//                     </Label>
//                     <Select
//                       value={userRole}
//                       onValueChange={(value: any) => setUserRole(value)}
//                     >
//                       <SelectTrigger className="h-12">
//                         <SelectValue placeholder="Select your role" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="customer">
//                           <div className="flex items-center gap-2 py-2">
//                             <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
//                               <MapPin className="w-4 h-4 text-blue-600" />
//                             </div>
//                             <div>
//                               <div className="font-medium">Customer</div>
//                               <div className="text-xs text-muted-foreground">
//                                 Book rides & deliveries
//                               </div>
//                             </div>
//                           </div>
//                         </SelectItem>
//                         <SelectItem value="driver">
//                           <div className="flex items-center gap-2 py-2">
//                             <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
//                               <Car className="w-4 h-4 text-green-600" />
//                             </div>
//                             <div>
//                               <div className="font-medium">Driver</div>
//                               <div className="text-xs text-muted-foreground">
//                                 Earn money driving
//                               </div>
//                             </div>
//                           </div>
//                         </SelectItem>
//                         <SelectItem value="admin">
//                           <div className="flex items-center gap-2 py-2">
//                             <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
//                               <BarChart className="w-4 h-4 text-purple-600" />
//                             </div>
//                             <div>
//                               <div className="font-medium">Business</div>
//                               <div className="text-xs text-muted-foreground">
//                                 Manage operations
//                               </div>
//                             </div>
//                           </div>
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <Tabs value={activeTab} onValueChange={setActiveTab}>
//                     <TabsList className="grid w-full grid-cols-2">
//                       <TabsTrigger value="signin">Sign In</TabsTrigger>
//                       <TabsTrigger value="signup">Sign Up</TabsTrigger>
//                     </TabsList>

//                     <TabsContent value="signin" className="space-y-4 mt-6">
//                       <div className="space-y-2">
//                         <Label htmlFor="signin-email">Email</Label>
//                         <Input
//                           id="signin-email"
//                           type="email"
//                           placeholder="Enter your email"
//                           value={formData.email}
//                           onChange={(e) =>
//                             handleInputChange("email", e.target.value)
//                           }
//                           className="h-12"
//                         />
//                       </div>

//                       <div className="space-y-2">
//                         <Label htmlFor="signin-password">Password</Label>
//                         <div className="relative">
//                           <Input
//                             id="signin-password"
//                             type={showPassword ? "text" : "password"}
//                             placeholder="Enter your password"
//                             value={formData.password}
//                             onChange={(e) =>
//                               handleInputChange("password", e.target.value)
//                             }
//                             className="h-12 pr-10"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setShowPassword(!showPassword)}
//                             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                           >
//                             {showPassword ? (
//                               <EyeOff className="w-4 h-4" />
//                             ) : (
//                               <Eye className="w-4 h-4" />
//                             )}
//                           </button>
//                         </div>
//                       </div>

//                       <div className="flex items-center justify-between text-sm">
//                         <button className="text-primary hover:underline">
//                           Forgot password?
//                         </button>
//                       </div>

//                       <Button
//                         className="w-full h-12"
//                         onClick={handleLogin}
//                         disabled={isLoading}
//                       >
//                         {isLoading ? (
//                           <>
//                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                             Signing In...
//                           </>
//                         ) : (
//                           <>
//                             Sign In
//                             <ArrowRight className="w-4 h-4 ml-2" />
//                           </>
//                         )}
//                       </Button>
//                     </TabsContent>

//                     <TabsContent value="signup" className="space-y-4 mt-6">
//                       <div className="grid grid-cols-1 gap-4">
//                         <div className="space-y-2">
//                           <Label htmlFor="signup-name">Full Name</Label>
//                           <Input
//                             id="signup-name"
//                             placeholder="Enter your full name"
//                             value={formData.name}
//                             onChange={(e) =>
//                               handleInputChange("name", e.target.value)
//                             }
//                             className="h-12"
//                           />
//                         </div>

//                         <div className="space-y-2">
//                           <Label htmlFor="signup-email">Email</Label>
//                           <Input
//                             id="signup-email"
//                             type="email"
//                             placeholder="Enter your email"
//                             value={formData.email}
//                             onChange={(e) =>
//                               handleInputChange("email", e.target.value)
//                             }
//                             className="h-12"
//                           />
//                         </div>

//                         <div className="space-y-2">
//                           <Label htmlFor="signup-phone">Phone Number</Label>
//                           <Input
//                             id="signup-phone"
//                             type="tel"
//                             placeholder="Enter your phone number"
//                             value={formData.phone}
//                             onChange={(e) =>
//                               handleInputChange("phone", e.target.value)
//                             }
//                             className="h-12"
//                           />
//                         </div>

//                         <div className="space-y-2">
//                           <Label htmlFor="signup-password">Password</Label>
//                           <div className="relative">
//                             <Input
//                               id="signup-password"
//                               type={showPassword ? "text" : "password"}
//                               placeholder="Create a password"
//                               value={formData.password}
//                               onChange={(e) =>
//                                 handleInputChange("password", e.target.value)
//                               }
//                               className="h-12 pr-10"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => setShowPassword(!showPassword)}
//                               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                             >
//                               {showPassword ? (
//                                 <EyeOff className="w-4 h-4" />
//                               ) : (
//                                 <Eye className="w-4 h-4" />
//                               )}
//                             </button>
//                           </div>
//                         </div>

//                         <div className="space-y-2">
//                           <Label htmlFor="signup-confirm">
//                             Confirm Password
//                           </Label>
//                           <Input
//                             id="signup-confirm"
//                             type="password"
//                             placeholder="Confirm your password"
//                             value={formData.confirmPassword}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 "confirmPassword",
//                                 e.target.value,
//                               )
//                             }
//                             className="h-12"
//                           />
//                         </div>
//                       </div>

//                       <div className="text-xs text-muted-foreground">
//                         By signing up, you agree to our{" "}
//                         <button className="text-primary hover:underline">
//                           Terms of Service
//                         </button>{" "}
//                         and{" "}
//                         <button className="text-primary hover:underline">
//                           Privacy Policy
//                         </button>
//                       </div>

//                       <Button
//                         className="w-full h-12"
//                         onClick={handleRegister}
//                         disabled={isLoading}
//                       >
//                         {isLoading ? (
//                           <>
//                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                             Creating Account...
//                           </>
//                         ) : (
//                           <>
//                             Create Account
//                             <ArrowRight className="w-4 h-4 ml-2" />
//                           </>
//                         )}
//                       </Button>
//                     </TabsContent>
//                   </Tabs>

//                   {/* Role-specific CTA */}
//                   {userRole && (
//                     <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50">
//                       <div className="text-sm">
//                         {userRole === "customer" && (
//                           <div>
//                             <h4 className="font-medium mb-1">As a Customer:</h4>
//                             <p className="text-muted-foreground">
//                               Book rides, share trips, and send packages with
//                               ease.
//                             </p>
//                           </div>
//                         )}
//                         {userRole === "driver" && (
//                           <div>
//                             <h4 className="font-medium mb-1">As a Driver:</h4>
//                             <p className="text-muted-foreground">
//                               Earn money with flexible hours and competitive
//                               rates.
//                             </p>
//                           </div>
//                         )}
//                         {userRole === "admin" && (
//                           <div>
//                             <h4 className="font-medium mb-1">As a Business:</h4>
//                             <p className="text-muted-foreground">
//                               Manage your fleet and track business performance.
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {/* Quick Demo Access */}
//                   <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
//                     <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
//                       <PlayCircle className="w-4 h-4" />
//                       Quick Demo Access
//                     </h4>
//                     <div className="grid grid-cols-1 gap-2">
//                       <Link to="/app">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="w-full justify-start text-xs h-9"
//                         >
//                           <MapPin className="w-3 h-3 mr-2" />
//                           Customer Booking App
//                         </Button>
//                       </Link>
//                       <Link to="/driver-dashboard">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="w-full justify-start text-xs h-9"
//                         >
//                           <Car className="w-3 h-3 mr-2" />
//                           Driver Dashboard
//                         </Button>
//                       </Link>
//                       <Link to="/admin-dashboard">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="w-full justify-start text-xs h-9"
//                         >
//                           <BarChart className="w-3 h-3 mr-2" />
//                           Admin Dashboard
//                         </Button>
//                       </Link>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Services Section */}
//       <section className="py-24 bg-muted/30">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <Badge variant="secondary" className="mb-4">
//               <Star className="w-3 h-3 mr-1" />
//               Our Services
//             </Badge>
//             <h2 className="text-4xl font-bold mb-6">
//               Complete Transportation Solutions
//             </h2>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//               From personal rides to business logistics, we've got you covered
//               with our comprehensive platform
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {services.map((service, index) => {
//               const Icon = service.icon;
//               return (
//                 <Card
//                   key={index}
//                   className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm hover:-translate-y-1"
//                 >
//                   <CardHeader className="pb-4">
//                     <div className="flex items-center gap-3 mb-4">
//                       <div
//                         className={`w-12 h-12 bg-gradient-to-r ${service.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
//                       >
//                         <Icon className="w-6 h-6 text-white" />
//                       </div>
//                     </div>
//                     <CardTitle className="text-xl group-hover:text-primary transition-colors">
//                       {service.title}
//                     </CardTitle>
//                     <p className="text-muted-foreground text-sm leading-relaxed">
//                       {service.description}
//                     </p>
//                   </CardHeader>
//                   <CardContent className="pt-0">
//                     <ul className="space-y-3">
//                       {service.features.map((feature, idx) => (
//                         <li
//                           key={idx}
//                           className="flex items-center gap-2 text-sm"
//                         >
//                           <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
//                           <span>{feature}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="py-24">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <Badge variant="secondary" className="mb-4">
//               <Users className="w-3 h-3 mr-1" />
//               Testimonials
//             </Badge>
//             <h2 className="text-4xl font-bold mb-6">What Our Users Say</h2>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//               Join thousands of satisfied customers, drivers, and businesses who
//               trust RideFlow
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, index) => (
//               <Card
//                 key={index}
//                 className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm"
//               >
//                 <CardContent className="pt-6">
//                   <div className="flex items-center gap-1 mb-4">
//                     {[...Array(testimonial.rating)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className="w-4 h-4 fill-yellow-400 text-yellow-400"
//                       />
//                     ))}
//                   </div>
//                   <p className="text-muted-foreground mb-6 italic">
//                     "{testimonial.content}"
//                   </p>
//                   <div className="flex items-center gap-3">
//                     <Avatar className="w-10 h-10">
//                       <AvatarFallback className="bg-primary/10 text-primary">
//                         {testimonial.avatar}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <div className="font-medium">{testimonial.name}</div>
//                       <div className="text-sm text-muted-foreground">
//                         {testimonial.role}
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-24 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-600/10">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-4xl font-bold mb-6">
//             Ready to Transform Your Transportation?
//           </h2>
//           <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
//             Join RideFlow today and experience the future of mobility. Whether
//             you're looking to ride, drive, or manage a fleet, we have the
//             perfect solution for you.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Button
//               size="lg"
//               onClick={() => setActiveTab("signup")}
//               className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
//             >
//               Get Started Now
//               <ArrowRight className="w-5 h-5 ml-2" />
//             </Button>
//             <Link to="/app">
//               <Button variant="outline" size="lg">
//                 <PlayCircle className="w-5 h-5 mr-2" />
//                 Try Demo
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }