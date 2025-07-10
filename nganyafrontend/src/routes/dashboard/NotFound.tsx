import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-8">
          <MapPin className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Route Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Looks like you took a wrong turn. Let's get you back on track!
        </p>

        <div className="space-y-3">
          <Button onClick={() => navigate("/")} className="w-full" size="lg">
            <MapPin className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
