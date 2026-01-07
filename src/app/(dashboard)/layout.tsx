'use client';

import { Footer } from "@/components/ui/footer";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
import { SyncProgress } from "@/components/offline/SyncProgress";
import { useOfflineDataPreload } from '@/hooks/useOfflineDataPreload';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Preload data to IndexedDB when online
  useOfflineDataPreload();
  
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <OfflineIndicator />
      <SyncProgress />
      {children}
      <Footer />
    </div>
  );
}
