import { Star, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";

interface VehicleCardProps {
  id: string;
  type: string;
  driver: {
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
}: VehicleCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
      }`}
      onClick={() => onSelect(id)}
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
        <Link to="/booking">
          <Button
            className="w-full mt-3"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            Book Now
          </Button>
        </Link>
      )}
    </div>
  );
}