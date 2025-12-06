import { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  mobileCards?: ReactNode;
}

export function ResponsiveTable({ children, mobileCards }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop table view */}
      <div className="hidden lg:block overflow-x-auto">
        {children}
      </div>
      
      {/* Mobile cards view */}
      {mobileCards && (
        <div className="lg:hidden space-y-3 p-4">
          {mobileCards}
        </div>
      )}
    </>
  );
}
