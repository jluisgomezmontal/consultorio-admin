"use client";

import Link from "next/link";
import { 
  Github, 
  X, 
  Linkedin, 
  Facebook, 
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart
} from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center ">
                <span className="text-primary-foreground font-bold text-sm">Mi</span>
              </div>
              <span className="text-lg font-semibold">Consultorio</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Sistema de gestión integral para consultorios médicos, 
              diseñado para simplificar tu día a día.
            </p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>Hecho con</span>
              <Heart className="h-3 w-3 text-red-500 fill-current" />
              <span>en México</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/pacientes" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pacientes
                </Link>
              </li>
              <li>
                <Link 
                  href="/citas" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Citas
                </Link>
              </li>
              <li>
                <Link 
                  href="/consultorios" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Consultorios
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>joseluisgomezmontalvan@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+52 (744) 429-2283</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Acapulco, Gro</span>
              </li>
            </ul>
          </div>

          {/* Social Media & Developer */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Síguenos</h3>
            <div className="flex space-x-3">
              <a 
                href="https://x.com/jluisgm220690?s=21" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/50 hover:bg-muted hover:text-primary transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61584075058727" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/50 hover:bg-muted hover:text-primary transition-all duration-200"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://www.instagram.com/jluismontalvan/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/50 hover:bg-muted hover:text-primary transition-all duration-200"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://www.linkedin.com/in/jose-luis-gomez-montalvan-220690/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/50 hover:bg-muted hover:text-primary transition-all duration-200"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Desarrollo por:</p>
              <Link
                href="https://luminadigitalstudio.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <span>Luminá Digital Studio</span>
                <Github className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Consultorio. Todos los derechos reservados.
            </div>
            <div className="flex items-center space-x-6 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacidad
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Términos
              </Link>
              <Link href="/support" className="hover:text-primary transition-colors">
                Soporte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
