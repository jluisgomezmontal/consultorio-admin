'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer } from 'lucide-react';
import type { Pago } from '@/services/pago.service';

interface GenerarComprobanteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago: Pago;
}

export function GenerarComprobanteDialog({
  open,
  onOpenChange,
  pago,
}: GenerarComprobanteDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const metodoLabels: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
  };

  const estatusLabels: Record<string, string> = {
    pagado: 'Pagado',
    pendiente: 'Pendiente',
  };

  const handleGenerate = () => {
    setIsGenerating(true);

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comprobante de Pago - ${pago.cita?.paciente?.fullName || 'Sin paciente'}</title>
        <style>
          @page {
            size: A4;
            margin: 1.5cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 10pt;
            line-height: 1.3;
            color: #000;
            background: #fff;
          }
          
          .header {
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 2px solid #10b981;
            margin-bottom: 15px;
          }
          
          .header h1 {
            font-size: 18pt;
            color: #059669;
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          
          .header p {
            font-size: 8pt;
            color: #666;
          }
          
          .comprobante-numero {
            text-align: right;
            font-size: 8pt;
            color: #666;
            margin-bottom: 10px;
          }
          
          .monto-principal {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin-bottom: 15px;
          }
          
          .monto-label {
            font-size: 9pt;
            color: #065f46;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          
          .monto-valor {
            font-size: 24pt;
            color: #059669;
            font-weight: bold;
            margin-bottom: 3px;
          }
          
          .monto-texto {
            font-size: 8pt;
            color: #047857;
            font-style: italic;
          }
          
          .section {
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 10pt;
            font-weight: bold;
            color: #059669;
            border-bottom: 1px solid #d1fae5;
            padding-bottom: 4px;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 8px;
          }
          
          .info-item {
            padding: 6px;
            background: #f9fafb;
            border-left: 2px solid #10b981;
            border-radius: 3px;
          }
          
          .info-label {
            font-weight: bold;
            color: #374151;
            font-size: 8pt;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          
          .info-value {
            color: #000;
            font-size: 9pt;
          }
          
          .estatus-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .estatus-pagado {
            background: #d1fae5;
            color: #065f46;
          }
          
          .estatus-pendiente {
            background: #fef3c7;
            color: #92400e;
          }
          
          .firma-section {
            margin-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .firma-box {
            text-align: center;
          }
          
          .firma-linea {
            border-top: 1px solid #000;
            margin-bottom: 5px;
            margin-top: 30px;
          }
          
          .firma-label {
            font-size: 8pt;
            color: #666;
            font-weight: bold;
          }
          
          .footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 7pt;
            color: #666;
          }
          
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Comprobante de Pago</h1>
          <p>Documento generado el ${new Date().toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="comprobante-numero">
          <strong>No. de Comprobante:</strong> ${pago.id.substring(0, 8).toUpperCase()}
        </div>

        <div class="monto-principal">
          <div class="monto-label">Monto Total Pagado</div>
          <div class="monto-valor">$${pago.monto.toFixed(2)} MXN</div>
          <div class="monto-texto">${numeroALetras(pago.monto)} pesos ${((pago.monto % 1) * 100).toFixed(0)}/100 M.N.</div>
        </div>

        <div class="section">
          <div class="section-title">Información del Pago</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Método de Pago</div>
              <div class="info-value">${metodoLabels[pago.metodo] || pago.metodo}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha de Pago</div>
              <div class="info-value">${new Date(pago.fechaPago).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estado</div>
              <div class="info-value">
                <span class="estatus-badge estatus-${pago.estatus}">${estatusLabels[pago.estatus] || pago.estatus}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha de Registro</div>
              <div class="info-value">${new Date(pago.createdAt).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}</div>
            </div>
          </div>
          ${pago.comentarios ? `
          <div class="info-item" style="grid-column: 1 / -1;">
            <div class="info-label">Comentarios</div>
            <div class="info-value">${pago.comentarios}</div>
          </div>
          ` : ''}
        </div>

        ${pago.cita ? `
        <div class="section">
          <div class="section-title">Información de la Consulta</div>
          <div class="info-grid">
            ${pago.cita.paciente?.fullName ? `
            <div class="info-item">
              <div class="info-label">Paciente</div>
              <div class="info-value">${pago.cita.paciente.fullName}</div>
            </div>
            ` : ''}
            ${pago.cita.doctor?.name ? `
            <div class="info-item">
              <div class="info-label">Doctor</div>
              <div class="info-value">${pago.cita.doctor.name}</div>
            </div>
            ` : ''}
            ${pago.cita.consultorio?.name ? `
            <div class="info-item">
              <div class="info-label">Consultorio</div>
              <div class="info-value">${pago.cita.consultorio.name}</div>
            </div>
            ` : ''}
            <div class="info-item">
              <div class="info-label">Fecha de Consulta</div>
              <div class="info-value">${new Date(pago.cita.date).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })} - ${pago.cita.time}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="firma-section">
          <div class="firma-box">
            <div class="firma-linea"></div>
            <div class="firma-label">Firma del Paciente</div>
          </div>
          <div class="firma-box">
            <div class="firma-linea"></div>
            <div class="firma-label">Sello del Consultorio</div>
          </div>
        </div>

        <div class="footer">
          Este documento fue generado electrónicamente.
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setIsGenerating(false);
          onOpenChange(false);
        }, 250);
      };
    } else {
      alert('Por favor, permite las ventanas emergentes para generar el comprobante.');
      setIsGenerating(false);
    }
  };

  const numeroALetras = (num: number): string => {
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    const numero = Math.floor(num);
    if (numero === 0) return 'cero';
    if (numero === 100) return 'cien';

    let resultado = '';

    if (numero >= 1000) {
      const miles = Math.floor(numero / 1000);
      if (miles === 1) {
        resultado += 'mil ';
      } else {
        resultado += numeroALetras(miles) + ' mil ';
      }
    }

    const resto = numero % 1000;
    if (resto >= 100) {
      resultado += centenas[Math.floor(resto / 100)] + ' ';
    }

    const decena = resto % 100;
    if (decena >= 10 && decena < 20) {
      resultado += especiales[decena - 10];
    } else {
      if (decena >= 20) {
        resultado += decenas[Math.floor(decena / 10)];
        if (decena % 10 > 0) {
          resultado += ' y ' + unidades[decena % 10];
        }
      } else if (decena > 0) {
        resultado += unidades[decena];
      }
    }

    return resultado.trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Comprobante de Pago
          </DialogTitle>
          <DialogDescription>
            Paciente: <strong>{pago.cita?.paciente?.fullName || 'Sin paciente'}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center py-6 space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-2 border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-muted-foreground mb-1">Monto del pago</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${pago.monto.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{metodoLabels[pago.metodo]}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Se abrirá una ventana de impresión con el comprobante de pago.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating} className="bg-emerald-600 hover:bg-emerald-700">
              <Printer className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generando...' : 'Generar Comprobante'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
