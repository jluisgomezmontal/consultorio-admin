import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/Navbar";
import { PlanGuard } from "@/components/PlanGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanGuard>
      <div className="min-h-screen bg-background flex flex-col w-full">
        <Navbar />
        {children}
        <Footer />
      </div>
    </PlanGuard>
  );
}
