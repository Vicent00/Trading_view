import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] grid grid-rows-[60px_1fr]">
      {/* Navbar */}
      <Navbar />

      {/* Main Layout Grid: Sidebar + Content */}
      <div className="grid grid-cols-[auto_1fr]">
        <Sidebar />

        {/* Main Content */}
        <main className="overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
