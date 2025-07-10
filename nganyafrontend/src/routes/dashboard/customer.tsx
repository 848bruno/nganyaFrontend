import { MapView } from '@/components/MapView'
import { BookingPanel } from '@/components/BookingPanel'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useRouter, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/customer')({
  component: Customer,
})
export default function Customer() {
  const navigate = useRouter()

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="customer" />

      <div className="flex-1 lg:ml-0">
        <div className="h-screen flex relative">
          {/* Map View - Full screen on mobile, left side on desktop */}
          <div className="flex-1 relative">
            <MapView />

            {/* Mobile booking panel - slides up from bottom */}
            <div className="absolute bottom-0 left-0 right-0 lg:hidden">
              <BookingPanel />
            </div>

            {/* Status bar and quick actions for mobile */}
            <div className="lg:hidden absolute top-4 left-4 right-4 z-40 space-y-4">
              {/* Status bar */}
              <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    All Systems Online
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    12 drivers nearby • Avg wait: 3 min
                  </p>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-lg">🚗</span>
                    </div>
                    <span className="text-xs font-medium">Book Ride</span>
                    <span className="text-xs text-muted-foreground">
                      From $8
                    </span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-lg">👥</span>
                    </div>
                    <span className="text-xs font-medium">Share Ride</span>
                    <span className="text-xs text-muted-foreground">
                      Save 60%
                    </span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white text-lg">📦</span>
                    </div>
                    <span className="text-xs font-medium">Send Package</span>
                    <span className="text-xs text-muted-foreground">
                      Same day
                    </span>
                  </button>
                </div>

                {/* Get Started for new users */}
                <button
                  onClick={() => navigate('/')}
                  className="w-full p-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-md transition-all"
                >
                  New User? Get Started →
                </button>
              </div>
            </div>
          </div>

          {/* Desktop booking panel - fixed right sidebar */}
          <div className="hidden lg:block w-96 border-l border-border bg-background">
            <div className="p-4 h-full">
              <BookingPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
