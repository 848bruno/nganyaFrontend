import { Outlet } from '@tanstack/react-router';
import { ModernNavigation } from '@/components/Header';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { BottomNavigation } from '@/components/BottomNavigation';

export function AppContent() {
  return (
    <>
      <ModernNavigation />
      <ChatbotWidget />
      <Outlet />
      <BottomNavigation />
    </>
  );
}