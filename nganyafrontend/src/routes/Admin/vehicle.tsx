import VehiclesList from '@/components/users/VehiclesList';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Admin/vehicle')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VehiclesList />;
}
