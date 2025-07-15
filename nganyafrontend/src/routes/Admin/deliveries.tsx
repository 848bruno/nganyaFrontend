import DeliveryList from '@/components/users/DeliveryList';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Admin/deliveries')({
  component: RouteComponent,
})

function RouteComponent() {
   return <DeliveryList />;
}
