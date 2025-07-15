import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'



import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'


import type { QueryClient } from '@tanstack/react-query'
import { ModernNavigation } from '@/components/Header.tsx'
import { ChatbotWidget } from '@/components/ChatbotWidget.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <ModernNavigation />
      <ChatbotWidget />
      <Outlet />
      <TanStackRouterDevtools />

      <TanStackQueryLayout />
    </>
  ),
})
