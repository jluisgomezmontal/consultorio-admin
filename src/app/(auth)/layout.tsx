import { Footer } from "@/components/ui/footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
      <Footer />
    </div>
  );
}
