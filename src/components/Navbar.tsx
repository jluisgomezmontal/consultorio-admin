'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useConsultorio } from '@/contexts/ConsultorioContext';
import { cn } from '@/lib/utils';
import { Menu, X, Building2 } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { consultorios, selectedConsultorio, setSelectedConsultorio } = useConsultorio();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/citas', label: 'Citas' },
  { href: '/pacientes', label: 'Pacientes' },
  { href: '/pagos', label: 'Pagos' },
  ...(user && user.role !== 'recepcionista'
    ? [{ href: '/reportes', label: 'Reportes' }]
    : []),
  ...(user && user.role === 'admin'
    ? [{ href: '/users', label: 'Usuarios' }]
    : []),
  ...(user && user.role === 'admin'
    ? [  { href: '/consultorios', label: 'Consultorios' }]
    : []),
];


  const handleNavClick = () => setMobileOpen(false);

  return (
    <nav className="border-b bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex flex-shrink-0 items-center gap-2">
              <img src="/miconsultorio.svg" alt="Consultorio" className="h-8 w-8 md:h-9 md:w-9" />
              <span className="text-lg md:text-xl font-bold">Mi Consultorio</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-2 lg:space-x-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-primary'
                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Selector de Consultorio */}
            {user?.role !== 'admin' && consultorios.length > 0 && (
              <div className="hidden lg:flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedConsultorio?.id || selectedConsultorio?._id || ''}
                  onValueChange={(value: string) => {
                    const consultorio = consultorios.find((c: any) => (c.id === value) || (c._id === value));
                    if (consultorio) {
                      setSelectedConsultorio(consultorio);
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleccionar consultorio">
                      {selectedConsultorio?.name || 'Seleccionar consultorio'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {consultorios.map((consultorio: any) => (
                      <SelectItem key={consultorio.id || consultorio._id || `consultorio-${Math.random()}`} value={consultorio.id || consultorio._id || ''}>
                        {consultorio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <ThemeToggle />
            <div className="text-sm hidden lg:block">
              <p className="font-medium">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Rol'}</p>
            </div>
            <Button onClick={logout} variant="outline" size="sm" className="hidden lg:inline-flex">
              Cerrar Sesión
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((prev: boolean) => !prev)}
              aria-label="Abrir menú"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <div className="space-y-4 border-t border-border pb-4 pt-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <Button onClick={logout} size="sm" variant="outline">
                Cerrar Sesión
              </Button>
            </div>
            {/* Selector de Consultorio - Mobile */}
            {user?.role !== 'admin' && consultorios.length > 0 && (
              <div className="flex flex-col gap-2 px-3">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  Consultorio Activo
                </label>
                <Select
                  value={selectedConsultorio?.id || selectedConsultorio?._id || ''}
                  onValueChange={(value: string) => {
                    const consultorio = consultorios.find((c: any) => (c.id === value) || (c._id === value));
                    if (consultorio) {
                      setSelectedConsultorio(consultorio);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar consultorio">
                      {selectedConsultorio?.name || 'Seleccionar consultorio'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {consultorios.map((consultorio: any) => (
                      <SelectItem key={consultorio.id || consultorio._id || `consultorio-${Math.random()}`} value={consultorio.id || consultorio._id || ''}>
                        {consultorio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleNavClick}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
