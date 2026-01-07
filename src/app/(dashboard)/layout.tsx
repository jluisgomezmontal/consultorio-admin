import { Footer } from "@/components/ui/footer";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
import { SyncProgress } from "@/components/offline/SyncProgress";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <OfflineIndicator />
      <SyncProgress />
      {children}
      <Footer />
    </div>
  );
}
