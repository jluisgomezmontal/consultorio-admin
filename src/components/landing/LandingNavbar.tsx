'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/iconwhite.jpg" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="rounded-lg dark:hidden"
            />
            <Image 
              src="/icondark.jpg" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="rounded-lg hidden dark:block"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              MiConsultorio
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="#features" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            Características
          </Link>
          <Link 
            href="#pricing" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            Precios
          </Link>
          <Link 
            href="#testimonials" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            Testimonios
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Comenzar gratis</Link>
          </Button>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-down">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="#features"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Características
            </Link>
            <Link
              href="#pricing"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Precios
            </Link>
            <Link
              href="#testimonials"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonios
            </Link>
            <div className="pt-3 space-y-2">
              <Button asChild variant="outline" className="w-full transition-all duration-300 hover:scale-105">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild className="w-full transition-all duration-300 hover:scale-105">
                <Link href="/register">Comenzar gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
