'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@/store/uiStore';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);

  return (
    <div className="min-h-screen bg-[#0a0a0a] grid grid-rows-[60px_1fr]">
      {/* Navbar */}
      <Navbar />

      {/* Main Layout Grid: Sidebar + Content */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr]">
        {/* Mobile Sidebar Overlay Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
