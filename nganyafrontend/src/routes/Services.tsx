import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Car,
  Users,
  Package,
  DollarSign,
  Shield,
  Clock,
  Star,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute('/Services')({
  component: Services,
})

export default function Services() {
  const navigate = useNavigate();

  const services = [
    {
      title: "Ride Booking",
      description: "Book instant rides with professional drivers in your area",
      icon: Car,
      gradient: "from-blue-500 to-blue-600",
      price: "Starting from $8",
      features: [
        "Real-time GPS tracking",
        "Multiple vehicle options",
        "Secure payment methods",
        "24/7 availability",
        "Professional drivers",
        "In-app communication",
      ],
    },
    {
      title: "Ride Sharing (Carpool)",
      description: "Share rides and save money while meeting new people",
      icon: Users,
      gradient: "from-green-500 to-green-600",
      price: "Save up to 60%",
      features: [
        "Cost-effective travel",
        "Eco-friendly option",
        "Meet verified riders",
        "Flexible scheduling",
        "Route optimization",
        "Split fare automatically",
      ],
    },
    {
      title: "Package Delivery",
      description: "Fast and reliable delivery service for your packages",
      icon: Package,
      gradient: "from-purple-500 to-purple-600",
      price: "Same-day delivery",
      features: [
        "Real-time tracking",
        "Secure handling",
        "Proof of delivery",
        "Insurance coverage",
        "Multiple package sizes",
        "Express options",
      ],
    },
    {
      title: "Driver Partnership",
      description: "Earn money driving with flexible schedules",
      icon: DollarSign,
      gradient: "from-orange-500 to-orange-600",
      price: "Earn $15-25/hour",
      features: [
        "Flexible working hours",
        "Weekly payouts",
        "Performance bonuses",
        "Driver support",
        "Vehicle maintenance help",
        "Insurance coverage",
      ],
    },
  ];

  const businessFeatures = [
    {
      icon: Shield,
      title: "Safety First",
      description: "All drivers are background-checked and vehicles inspected",
    },
    {
      icon: Clock,
      title: "24/7 Service",
      description:
        "Round-the-clock availability for all your transportation needs",
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Maintaining high standards with regular quality checks",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Our Services
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Complete Transportation{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Solutions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From personal rides to business logistics, we provide comprehensive
            transportation services tailored to your needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${service.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {service.price}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (service.title === "Driver Partnership") {
                        navigate({ 
                          to: "/", 
                          search: { action: "signup", type: "driver" } 
                        });
                      } else {
                        navigate({ 
                          to: "/", 
                          search: { action: "signup", type: "customer" } 
                        });
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Business Features */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Why Choose RideFlow?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {businessFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers and drivers who trust RideFlow
            for their transportation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate({ 
                to: "/", 
                search: { action: "signup" } 
              })}
              className="bg-gradient-to-r from-primary to-blue-600"
            >
              Sign Up Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate({ to: "/contact" })}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}