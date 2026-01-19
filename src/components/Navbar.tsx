'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useConsultorio } from '@/contexts/ConsultorioContext';
import { usePaquete } from '@/hooks/usePaquete';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Building2, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  UserCog,
  Stethoscope,
  Sparkles,
  Package
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { consultorios, selectedConsultorio, setSelectedConsultorio } = useConsultorio();
  const { paqueteInfo, esPaquete } = usePaquete();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Early return if no user
  if (!user) {
    return null;
  }

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/citas', label: 'Citas', icon: Calendar },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/pagos', label: 'Pagos', icon: DollarSign },
  ...(user && user.role !== 'recepcionista'
    ? [{ href: '/reportes', label: 'Reportes', icon: BarChart3 }]
    : []),
];


  const handleNavClick = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex flex-shrink-0 items-center group">
              <Logo size="sm" className="md:hidden" />
              <Logo size="lg" className="hidden md:flex" />
            </Link>
            <div className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-0.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Selector de Consultorio o Texto */}
            {user?.role !== 'admin' && consultorios.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
                <Stethoscope className="h-4 w-4 text-primary" />
                {consultorios.length === 1 ? (
                  <span className="text-sm font-medium">
                    {selectedConsultorio?.name || consultorios[0]?.name}
                  </span>
                ) : (
                  <Select
                    value={selectedConsultorio?.id || selectedConsultorio?._id || ''}
                    onValueChange={(value: string) => {
                      const consultorio = consultorios.find((c: any) => (c.id === value) || (c._id === value));
                      if (consultorio) {
                        setSelectedConsultorio(consultorio);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-8 border-0 bg-transparent focus:ring-0">
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
                )}
              </div>
            )}
            <ThemeToggle />
            
            {/* Desktop: Dropdown menu para todos los usuarios */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden lg:flex items-center gap-2 h-10">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                      {user.photoUrl ? (
                        <Image
                          src={user.photoUrl}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'Usuario'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  {
                    !esPaquete("clinica") && user?.role !== 'recepcionista' && <Link href="/configuracion/paquetes" className="cursor-pointer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>Mi Plan</span>
                  </Link>
                  }
                </DropdownMenuItem>
                {user?.role === 'doctor' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/configuracion" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/users" className="cursor-pointer">
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>Usuarios</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/consultorios" className="cursor-pointer">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Consultorios</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/paquetes" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Administrar Paquetes</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/paquetes/gestion" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Gestión de Paquetes</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setMobileOpen((prev: boolean) => !prev)}
              aria-label="Abrir menú"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <div className="space-y-4 border-t border-border pb-4 pt-4 xl:hidden bg-card">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
              <Button onClick={logout} size="sm" variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </Button>
            </div>
            {/* Selector de Consultorio o Texto - Mobile */}
            {user?.role !== 'admin' && consultorios.length > 0 && (
              <div className="flex flex-col gap-2 px-3">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  Consultorio Activo
                </label>
                {consultorios.length === 1 ? (
                  <div className="text-sm font-medium py-2">
                    {selectedConsultorio?.name || consultorios[0]?.name}
                  </div>
                ) : (
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
                )}
              </div>
            )}
            <div className="flex flex-col space-y-1 px-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleNavClick}
                    className={cn(
                      'rounded-lg px-3 py-3 text-sm font-medium flex items-center gap-3 transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              {!esPaquete("clinica") && user?.role !== 'recepcionista' && (
                <Link
                  href="/configuracion/paquetes"
                  onClick={handleNavClick}
                  className={cn(
                    'rounded-lg px-3 py-3 text-sm font-medium flex items-center gap-3 transition-colors',
                    pathname === '/configuracion/paquetes' || pathname.startsWith('/configuracion/paquetes')
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Mi Plan</span>
                </Link>
              )}
              {user?.role === 'doctor' && (
                <Link
                  href="/configuracion"
                  onClick={handleNavClick}
                  className={cn(
                    'rounded-lg px-3 py-3 text-sm font-medium flex items-center gap-3 transition-colors',
                    pathname === '/configuracion' || pathname.startsWith('/configuracion/')
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span>Configuración</span>
                </Link>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link
                    href="/users"
                    onClick={handleNavClick}
                    className={cn(
                      'rounded-lg px-3 py-3 text-sm font-medium flex items-center gap-3 transition-colors',
                      pathname === '/users' || pathname.startsWith('/users/')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <UserCog className="h-5 w-5" />
                    <span>Usuarios</span>
                  </Link>
                  <Link
                    href="/consultorios"
                    onClick={handleNavClick}
                    className={cn(
                      'rounded-lg px-3 py-3 text-sm font-medium flex items-center gap-3 transition-colors',
                      pathname === '/consultorios' || pathname.startsWith('/consultorios/')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Building2 className="h-5 w-5" />
                    <span>Consultorios</span>
                  </Link>
                  <Link
                    href="/admin/paquetes"
                    onClick={handleNavClick}
                    className={cn(
                      'rounded-lg px-3 py-3 text-sm font-medium flex items-center gap-3 transition-colors',
                      pathname === '/admin/paquetes' || pathname.startsWith('/admin/paquetes')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Administrar Paquetes</span>
                  </Link>
                  <Link
                    href="/admin/paquetes/gestion"
                    onClick={handleNavClick}
                    className={cn(
                      'rounded-lg px-3 py-3 text-sm font-medium flex items-center gap-3 transition-colors',
                      pathname === '/admin/paquetes/gestion' || pathname.startsWith('/admin/paquetes/gestion')
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Package className="h-5 w-5" />
                    <span>Gestión de Paquetes</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
