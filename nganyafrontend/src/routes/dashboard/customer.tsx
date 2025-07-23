// src/pages/customer/CustomerDashboard.tsx
import { MapView } from '@/components/MapView'
import { BookingPanel } from '@/components/BookingPanel'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { ChatInterface } from '@/components/ChatInterface'
import { ChatProvider, useChat } from '@/contexts/ChatContext'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import React, { useState, useEffect, useCallback } from 'react'
import { rideshareService } from '@/lib/dashboard-service'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

// Define the search parameters interface (only for URL-friendly data)
interface CustomerDashboardSearch {
  pickupLat?: number
  pickupLng?: number
  destinationLat?: number
  destinationLng?: number
  distance?: number
  duration?: number
  instructions?: any[]
}

// Define the full route data interface for internal state (as expected by MapView)
interface FullRouteDataType {
  start: { lat: number; lon: number }
  end: { lat: number; lon: number }
  geometry: {
    type: string
    coordinates: [number, number][] // OSRM returns [lon, lat]
  }
  distance: number
  duration: number
  instructions: any[]
}

// Define the type for data passed to handleSetRouteData
interface RouteDataForSettingState {
  pickupLat: number
  pickupLng: number
  destinationLat: number
  destinationLng: number
  geometry: { type: string; coordinates: [number, number][] }
  distance: number
  duration: number
  instructions: any[]
}

export const Route = createFileRoute('/dashboard/customer')({
  component: CustomerDashboard,
  validateSearch: (
    search: Record<string, unknown>,
  ): CustomerDashboardSearch => {
    return {
      pickupLat:
        typeof search.pickupLat === 'number' ? search.pickupLat : undefined,
      pickupLng:
        typeof search.pickupLng === 'number' ? search.pickupLng : undefined,
      destinationLat:
        typeof search.destinationLat === 'number'
          ? search.destinationLat
          : undefined,
      destinationLng:
        typeof search.destinationLng === 'number'
          ? search.destinationLng
          : undefined,
      distance:
        typeof search.distance === 'number' ? search.distance : undefined,
      duration:
        typeof search.duration === 'number' ? search.duration : undefined,
      instructions: Array.isArray(search.instructions)
        ? search.instructions
        : undefined,
    }
  },
})

// Inner component to encapsulate logic that uses ChatContext
function CustomerDashboardContent({
  handleSetRouteData,
  fullRouteData,
  isCalculatingRouteOnLoad,
  routeSearch,
  isChatOpen,
  setIsChatOpen, // This prop is correctly received here
}: {
  handleSetRouteData: (data: RouteDataForSettingState | null) => void
  fullRouteData: FullRouteDataType | null
  isCalculatingRouteOnLoad: boolean
  routeSearch: CustomerDashboardSearch
  isChatOpen: boolean
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { createConversation, selectConversation } = useChat()

  const handleInitiateChat = useCallback(
    (driverId: string) => {
      createConversation([driverId])
      setIsChatOpen(true)
    },
    [createConversation, setIsChatOpen],
  )

  // The useEffect for route calculation on load remains in the parent CustomerDashboard
  // but its dependencies are passed down as props to ensure reactivity.

  return (
    <div className="flex min-h-screen bg-background">
      {/* 🎯 UPDATE THIS LINE: Pass setIsChatOpen to DashboardSidebar */}
      <DashboardSidebar userType="customer" setIsChatOpen={setIsChatOpen} />

      <div className="flex-1 lg:ml-0">
        <div className="h-screen flex relative">
          <div className="flex-1 relative">
            <MapView routeData={fullRouteData} />

            <div className="absolute bottom-0 left-0 right-0 lg:hidden">
              <BookingPanel
                setRouteData={handleSetRouteData}
                onInitiateChat={handleInitiateChat}
              />
            </div>

            <div className="lg:hidden absolute top-4 left-4 right-4 z-40 space-y-4">
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

                <button
                  onClick={() => {}}
                  className="w-full p-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-md transition-all"
                >
                  New User? Get Started →
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-96 border-l border-border bg-background">
            <div className="p-4 h-full">
              <BookingPanel
                setRouteData={handleSetRouteData}
                onInitiateChat={handleInitiateChat}
              />
            </div>
          </div>
        </div>
      </div>
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}

export function CustomerDashboard() {
  const routeSearch = useSearch({ from: '/dashboard/customer' })
  const navigate = useNavigate()

  const [fullRouteData, setFullRouteData] = useState<FullRouteDataType | null>(
    null,
  )
  const [isCalculatingRouteOnLoad, setIsCalculatingRouteOnLoad] =
    useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false) // State to control chat modal

  // Log routeSearch on component mount to aid debugging initial load
  useEffect(() => {
    console.log('CustomerDashboard mounted. Current routeSearch:', routeSearch)
  }, []) // Empty dependency array means this runs once on mount

  const handleSetRouteData = useCallback(
    (data: RouteDataForSettingState | null) => {
      navigate({
        search: (prevSearch: CustomerDashboardSearch) => ({
          ...prevSearch,
          pickupLat: data?.pickupLat,
          pickupLng: data?.pickupLng,
          destinationLat: data?.destinationLat,
          destinationLng: data?.destinationLng,
          distance: data?.distance,
          duration: data?.duration,
          instructions: data?.instructions,
        }),
        replace: true,
      })

      if (data) {
        setFullRouteData({
          start: { lat: data.pickupLat, lon: data.pickupLng },
          end: { lat: data.destinationLat, lon: data.destinationLng },
          geometry: data.geometry,
          distance: data.distance || 0,
          duration: data.duration || 0,
          instructions: data.instructions || [],
        })
      } else {
        setFullRouteData(null)
      }
    },
    [navigate],
  )

  // Effect to re-calculate route if URL params are present but fullRouteData is not set.
  // This useEffect is responsible for loading the map route when the page loads,
  // especially if navigation (e.g., after sign-in) includes route parameters in the URL.
  useEffect(() => {
    if (
      routeSearch.pickupLat !== undefined &&
      routeSearch.pickupLng !== undefined &&
      routeSearch.destinationLat !== undefined &&
      routeSearch.destinationLng !== undefined &&
      !fullRouteData &&
      !isCalculatingRouteOnLoad
    ) {
      const fetchRouteOnLoad = async () => {
        setIsCalculatingRouteOnLoad(true)
        try {
          const fetchedRoute = await rideshareService.getRoute(
            [routeSearch.pickupLat!, routeSearch.pickupLng!],
            [routeSearch.destinationLat!, routeSearch.destinationLng!],
          )

          if (
            fetchedRoute &&
            fetchedRoute.geometry &&
            fetchedRoute.geometry.type
          ) {
            handleSetRouteData({
              pickupLat: routeSearch.pickupLat!,
              pickupLng: routeSearch.pickupLng!,
              destinationLat: routeSearch.destinationLat!,
              destinationLng: routeSearch.destinationLng!,
              geometry: fetchedRoute.geometry,
              distance: fetchedRoute.distance,
              duration: fetchedRoute.duration,
              instructions: fetchedRoute.instructions,
            })
          } else {
            toast({
              title: 'Route Load Error',
              description:
                'Could not load route from URL. Please re-enter locations.',
              variant: 'destructive',
            })
            handleSetRouteData(null)
          }
        } catch (error: any) {
          console.error('Error re-calculating route on load:', error)
          toast({
            title: 'Route Load Error',
            description:
              error.message || 'Failed to re-calculate route from URL.',
            variant: 'destructive',
          })
          handleSetRouteData(null)
        } finally {
          setIsCalculatingRouteOnLoad(false)
        }
      }

      fetchRouteOnLoad()
    }
  }, [routeSearch, fullRouteData, handleSetRouteData, isCalculatingRouteOnLoad])

  return (
    <ChatProvider>
      <CustomerDashboardContent
        handleSetRouteData={handleSetRouteData}
        fullRouteData={fullRouteData}
        isCalculatingRouteOnLoad={isCalculatingRouteOnLoad}
        routeSearch={routeSearch}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
      />
    </ChatProvider>
  )
}