import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ImpersonationBanner } from './ImpersonationBanner';
import { SubscriptionAlertBanner } from './SubscriptionAlertBanner';

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ImpersonationBanner />
      <SubscriptionAlertBanner />
      <div className="flex-1 flex min-w-0">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
