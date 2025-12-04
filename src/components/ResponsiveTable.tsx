import { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  mobileCards?: ReactNode;
}

export function ResponsiveTable({ children, mobileCards }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        {children}
      </div>
      
      {/* Mobile cards view */}
      {mobileCards && (
        <div className="md:hidden space-y-3 p-4">
          {mobileCards}
        </div>
      )}
    </>
  );
}
