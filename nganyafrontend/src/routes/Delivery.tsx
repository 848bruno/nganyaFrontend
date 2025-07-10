import {
  ArrowLeft,
  Package,
  Clock,
  MapPin,
  Truck,
  Shield,
  Camera,
  FileText,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/Delivery')({
  component: Delivery,
})

export default function Delivery() {
  const { navigate } = useRouter()

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/index' })}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Delivery Service</h1>
            <p className="text-sm text-muted-foreground">
              Fast & reliable deliveries
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {/* Hero section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-secondary to-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Delivery Made Simple</h2>
          <p className="text-muted-foreground">
            Send packages, documents, or groceries anywhere in the city with
            real-time tracking.
          </p>
        </div>

        {/* Package Tracking */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 mb-8">
          <h3 className="font-medium mb-4">Track Your Package</h3>
          <div className="flex gap-3">
            <Input
              placeholder="Enter tracking ID (e.g., DL123456)"
              className="flex-1"
            />
            <Button>Track</Button>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="grid gap-4 mb-8">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Standard Delivery
                </div>
                <Badge variant="secondary">Most Popular</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Same-day • Up to 20kg
                  </span>
                  <span className="font-bold text-lg">$8</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>4-6 hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Insured up to $100</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Express Delivery
                </div>
                <Badge variant="outline">2 Hour</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Priority • Up to 10kg
                  </span>
                  <span className="font-bold text-lg">$15</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Within 2 hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Camera className="w-4 h-4 text-purple-500" />
                    <span>Photo proof</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="w-5 h-5 text-secondary" />
                Bulk & Large Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Van service • Up to 100kg
                  </span>
                  <span className="font-bold text-lg">$25+</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>6-8 hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span>Digital receipt</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Delivery Form */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <h3 className="font-medium mb-4">Schedule Delivery</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickup">Pickup Address</Label>
                <Input id="pickup" placeholder="Enter pickup location" />
              </div>
              <div>
                <Label htmlFor="delivery">Delivery Address</Label>
                <Input id="delivery" placeholder="Enter delivery location" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Package Weight</Label>
                <Input id="weight" placeholder="e.g., 2.5 kg" />
              </div>
              <div>
                <Label htmlFor="value">Declared Value</Label>
                <Input id="value" placeholder="e.g., $50" />
              </div>
            </div>
            <Button className="w-full" size="lg">
              <DollarSign className="w-4 h-4 mr-2" />
              Get Quote & Schedule
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="bg-muted/50 rounded-2xl p-6 mb-8">
          <h3 className="font-medium mb-4">Why Choose Our Delivery?</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">Real-time GPS tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Scheduled & on-demand delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm">Proof of delivery with photos</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button className="w-full" size="lg">
            Schedule a Delivery
          </Button>
          <Button variant="outline" className="w-full">
            Get Price Quote
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              navigate({
                to: '/',
                search: { type: 'customer', action: 'signup' },
              })
            }
          >
            New User? Sign Up for Delivery
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Delivery service coming soon to your area. Sign up for early access.
          </p>
        </div>
      </div>
    </div>
  )
}
