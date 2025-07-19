import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Drive')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/Drive"!</div>
}
