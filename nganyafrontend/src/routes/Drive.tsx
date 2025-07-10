import { ArrowLeft, Car, DollarSign, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/Drive')({
  component: Drive,
})
export default function Drive() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/index" })}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Drive & Earn</h1>
            <p className="text-sm text-muted-foreground">
              Join our driver community
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {/* Hero section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Start Earning Today</h2>
          <p className="text-muted-foreground">
            Turn your car into a money-making machine. Drive when you want, earn
            what you deserve.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
                Flexible Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Earn up to $25/hour during peak times. Keep 85% of your
                earnings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" />
                Your Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Drive whenever you want. Take breaks anytime. You're in control.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-accent" />
                Support Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                24/7 driver support and a community of thousands of drivers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={() =>
              navigate({ to: "/", search: { type: "driver", action: "signup" } })
            }
          >
            Get Started - Sign Up Now
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              navigate({ to: "/", search: { type: "driver", action: "signin" } })
            }
          >
            Already a Driver? Sign In
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate({ to: "/pages/DriverDashboard" })}
          >
            Demo Driver Dashboard
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            This feature is coming soon. Join our waitlist to be notified when
            driver registration opens.
          </p>
        </div>
      </div>
    </div>
  );
}
