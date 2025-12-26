import { Footer } from "@/components/ui/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {children}
      <Footer />
    </div>
  );
}
