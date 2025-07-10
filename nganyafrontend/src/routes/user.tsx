import UsersList from '@/components/users/Users'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UsersList />;
}
