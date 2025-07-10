import { Car, Navigation2, Clock, MapPin, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MapView() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
      {/* Map Background with Roads */}
      <div className="absolute inset-0">
        {/* Main roads */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 right-0 h-2 bg-gray-300 opacity-60"></div>
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-300 opacity-40"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-300 opacity-40"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-2 bg-gray-300 opacity-60"></div>
        </div>

        {/* Grid pattern for city blocks */}
        <svg className="w-full h-full opacity-5" viewBox="0 0 100 100">
          <defs>
            <pattern
              id="cityGrid"
              patternUnits="userSpaceOnUse"
              width="10"
              height="10"
            >
              <path
                d="M 0,5 L 10,5 M 5,0 L 5,10"
                stroke="#374151"
                strokeWidth="0.3"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#cityGrid)" />
        </svg>
      </div>

      {/* Mock vehicles on map */}
      <div className="absolute inset-0">
        {/* Available Vehicle 1 - Economy */}
        <div className="absolute top-[30%] left-[35%] transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative group">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <Car className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              John • Economy • $12
            </div>
          </div>
        </div>

        {/* Available Vehicle 2 - Premium */}
        <div className="absolute top-[55%] left-[65%] transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative group">
            <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <Car className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Sarah • Premium • $18
            </div>
          </div>
        </div>

        {/* Busy Vehicle */}
        <div className="absolute top-[25%] left-[70%] transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative group">
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center shadow-lg opacity-60">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <Clock className="w-3 h-3 text-white" />
            </div>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Mike • Busy
            </div>
          </div>
        </div>

        {/* Luxury Vehicle */}
        <div className="absolute top-[75%] left-[25%] transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative group">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-xl">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              David • Luxury • $35
            </div>
          </div>
        </div>

        {/* Shared Ride */}
        <div className="absolute top-[45%] left-[40%] transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative group">
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Shared Ride • 2 seats • $6
            </div>
          </div>
        </div>

        {/* Current location pin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-8 h-8 bg-red-500 rounded-full shadow-lg animate-bounce flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="absolute inset-0 w-8 h-8 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              You are here
            </div>
          </div>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <Button size="icon" variant="outline" className="bg-white shadow-lg">
          <Navigation2 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" className="bg-white shadow-lg">
          <span className="text-lg font-bold">+</span>
        </Button>
        <Button size="icon" variant="outline" className="bg-white shadow-lg">
          <span className="text-lg font-bold">-</span>
        </Button>
      </div>
    </div>
  );
}
