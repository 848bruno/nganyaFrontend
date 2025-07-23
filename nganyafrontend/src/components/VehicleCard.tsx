// src/components/VehicleCard.tsx
import React from 'react';
import { Star, Users, Clock, MessageSquare } from "lucide-react"; // Import MessageSquare icon
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names

interface VehicleCardProps {
  id: string;
  type: string;
  driver: {
    id: string; // Ensure driver ID is available for chat initiation
    name: string;
    rating: number;
    image?: string;
    trips?: number;
  };
  price: number;
  estimatedTime: string;
  capacity: number;
  features?: string[];
  vehicleInfo?: string;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onInitiateChat: (driverId: string) => void; // New prop for initiating chat
}

export function VehicleCard({
  id,
  type,
  driver,
  price,
  estimatedTime,
  capacity,
  features = [],
  vehicleInfo,
  isSelected,
  onSelect,
  onInitiateChat, // Destructure new prop
}: VehicleCardProps) {
  return (
    <div
      className={cn(
        `p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
          isSelected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
        }`
      )}
      onClick={() => onSelect(id)} // Selecting the card for ride booking
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 ring-2 ring-offset-2 ring-green-500">
            <AvatarImage src={driver.image || "/placeholder.svg"} />
            <AvatarFallback>
              {driver.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{driver.name}</h4>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{driver.rating}</span>
              </div>
              {driver.trips && (
                <span className="text-xs text-muted-foreground">
                  {driver.trips} trips
                </span>
              )}
            </div>
            {vehicleInfo && (
              <p className="text-xs text-muted-foreground">{vehicleInfo}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">${price}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>

      {/* Vehicle features */}
      {features.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {features.map((feature) => (
            <span
              key={feature}
              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{capacity} seats</span>
          </div>
        </div>
        <div className="font-medium text-foreground">{type}</div>
      </div>

      {isSelected && (
        <div className="flex gap-2 mt-3">
          {/* Chat Button */}
          <Button
            className="flex-1"
            size="sm"
            variant="outline" // Use outline variant for the chat button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card selection when clicking chat button
              onInitiateChat(driver.id); // Call the chat initiation function
            }}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          {/* Book Now Button */}
          {/* Removed Link wrapper to directly use Button, as Link implies navigation,
              while Book Now should likely trigger a booking action within the current page.
              If it navigates, wrap the Button with Link again. */}
          <Button
            className="flex-1"
            size="sm"
            onClick={(e) => {
                e.stopPropagation(); // Prevent card selection when clicking Book Now
                // This onClick should trigger the booking logic in BookingPanel
                // Since BookingPanel handles the actual booking, VehicleCard doesn't need to know the full booking flow.
                // For now, it just prevents parent click and acts as a placeholder.
                // The BookingPanel's main "Confirm Booking" button will handle the final booking.
            }}
          >
            Book Now
          </Button>
        </div>
      )}
    </div>
  );
}