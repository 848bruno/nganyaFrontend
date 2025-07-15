import DriversList from '@/components/users/DriverLIst';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Admin/drivers')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DriversList />;
}

