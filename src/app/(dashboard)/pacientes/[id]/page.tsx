'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Edit, Calendar, FileText, Download, Activity, Heart, Syringe, Baby, X, Check, User, Phone, Mail, MapPin, Cake, Users, Droplet, Shield, AlertCircle, ClipboardList } from 'lucide-react';
import { pacienteService } from '@/services/paciente.service';
import { documentoService } from '@/services/documento.service';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { DocumentList } from '@/components/DocumentList';

export default function PacienteDetailPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const { data: pacienteData, isLoading } = useQuery({
    queryKey: ['paciente', id],
    queryFn: () => pacienteService.getPacienteById(id),
    enabled: !!user && !!id,
  });

  const { data: historyData } = useQuery({
    queryKey: ['paciente-history', id],
    queryFn: () => pacienteService.getPacienteHistory(id),
    enabled: !!user && !!id,
  });

  const { data: documentosData, refetch: refetchDocumentos } = useQuery({
    queryKey: ['documentos-paciente', id],
    queryFn: () => documentoService.getDocumentosByPaciente(id, 1, 50),
    enabled: !!user && !!id,
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !pacienteData) {
    return null;
  }

  const paciente = pacienteData.data;
  const citas = historyData?.data?.citas || [];
  const clinicalHistory = paciente.clinicalHistory;

  const handleExportExpediente = () => {
    if (!historyData?.data) {
      alert('No hay datos para exportar');
      return;
    }

    const expedienteData = historyData.data;

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Expediente Clínico - ${expedienteData.fullName}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }
          
          .header {
            text-align: center;
            padding-bottom: 15px;
            border-bottom: 3px solid #2563eb;
            margin-bottom: 20px;
          }
          
          .header h1 {
            font-size: 22pt;
            color: #1e40af;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 10pt;
            color: #666;
          }
          
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          
          .info-item {
            padding: 5px 0;
          }
          
          .info-label {
            font-weight: bold;
            color: #374151;
            font-size: 10pt;
          }
          
          .info-value {
            color: #000;
            margin-top: 2px;
          }
          
          .checkbox-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin: 10px 0;
          }
          
          .checkbox-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .checkbox {
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            display: inline-block;
            text-align: center;
            line-height: 10px;
            font-size: 9pt;
          }
          
          .checkbox.checked {
            background: #000;
            color: #fff;
          }
          
          .cita-card {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background: #f9fafb;
            page-break-inside: avoid;
          }
          
          .cita-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #d1d5db;
          }
          
          .cita-date {
            font-weight: bold;
            font-size: 12pt;
            color: #1e40af;
          }
          
          .cita-estado {
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 9pt;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .estado-completada { background: #d1fae5; color: #065f46; }
          .estado-confirmada { background: #dbeafe; color: #1e40af; }
          .estado-pendiente { background: #fef3c7; color: #92400e; }
          .estado-cancelada { background: #fee2e2; color: #991b1b; }
          
          .medicamento-item {
            padding: 8px;
            background: #fff;
            border-left: 3px solid #2563eb;
            margin-bottom: 8px;
          }
          
          .pago-item {
            padding: 8px;
            background: #f0fdf4;
            border-left: 3px solid #22c55e;
            margin-bottom: 8px;
            border-radius: 4px;
          }
          
          .pago-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
          }
          
          .pago-monto {
            font-weight: bold;
            color: #16a34a;
            font-size: 12pt;
          }
          
          .pago-metodo {
            font-size: 10pt;
            color: #666;
            margin-left: 10px;
          }
          
          .pago-fecha {
            font-size: 9pt;
            color: #666;
          }
          
          .pago-notas {
            font-size: 9pt;
            color: #555;
            margin-top: 5px;
            font-style: italic;
          }
          
          .pago-total {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #d1d5db;
            font-weight: bold;
            font-size: 11pt;
            text-align: right;
          }
          
          .subsection-title {
            font-size: 11pt;
            font-weight: bold;
            color: #4b5563;
            margin-top: 15px;
            margin-bottom: 8px;
            padding-bottom: 3px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .badge-success {
            background: #d1fae5;
            color: #065f46;
          }
          
          .badge-info {
            background: #dbeafe;
            color: #1e40af;
          }
          
          .badge-warning {
            background: #fef3c7;
            color: #92400e;
          }
          
          .badge-danger {
            background: #fee2e2;
            color: #991b1b;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #d1d5db;
            text-align: center;
            font-size: 9pt;
            color: #666;
          }
          
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            .section {
              page-break-inside: avoid;
            }
            
            .cita-card {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>EXPEDIENTE CLÍNICO</h1>
          <p>Documento generado el ${new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
        </div>

        <!-- Información del Paciente -->
        <div class="section">
          <div class="section-title">INFORMACIÓN DEL PACIENTE</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nombre Completo:</div>
              <div class="info-value">${expedienteData.fullName}</div>
            </div>
            ${expedienteData.birthDate ? `
            <div class="info-item">
              <div class="info-label">Fecha de Nacimiento:</div>
              <div class="info-value">${new Date(expedienteData.birthDate).toLocaleDateString('es-ES')}</div>
            </div>
            ` : ''}
            <div class="info-item">
              <div class="info-label">Edad:</div>
              <div class="info-value">${expedienteData.age || 'No especificada'} años</div>
            </div>
            <div class="info-item">
              <div class="info-label">Género:</div>
              <div class="info-value">${expedienteData.gender ? expedienteData.gender.charAt(0).toUpperCase() + expedienteData.gender.slice(1) : 'No especificado'}</div>
            </div>
            ${expedienteData.bloodType ? `
            <div class="info-item">
              <div class="info-label">Tipo de Sangre:</div>
              <div class="info-value">${expedienteData.bloodType}</div>
            </div>
            ` : ''}
            <div class="info-item">
              <div class="info-label">Teléfono:</div>
              <div class="info-value">${expedienteData.phone || 'No especificado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email:</div>
              <div class="info-value">${expedienteData.email || 'No especificado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha de Registro:</div>
              <div class="info-value">${new Date(expedienteData.createdAt).toLocaleDateString('es-ES')}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">Dirección:</div>
            <div class="info-value">${expedienteData.address || 'No registrada'}</div>
          </div>
        </div>

        <!-- Seguro Médico -->
        ${expedienteData.medicalInsurance && (expedienteData.medicalInsurance.insurer || expedienteData.medicalInsurance.policyNumber) ? `
        <div class="section">
          <div class="section-title">SEGURO MÉDICO</div>
          <div class="info-grid">
            ${expedienteData.medicalInsurance.insurer ? `
            <div class="info-item">
              <div class="info-label">Aseguradora:</div>
              <div class="info-value">${expedienteData.medicalInsurance.insurer}</div>
            </div>
            ` : ''}
            ${expedienteData.medicalInsurance.policyNumber ? `
            <div class="info-item">
              <div class="info-label">Número de Póliza:</div>
              <div class="info-value">${expedienteData.medicalInsurance.policyNumber}</div>
            </div>
            ` : ''}
            ${expedienteData.medicalInsurance.holderName ? `
            <div class="info-item">
              <div class="info-label">Titular:</div>
              <div class="info-value">${expedienteData.medicalInsurance.holderName}</div>
            </div>
            ` : ''}
            ${expedienteData.medicalInsurance.relationship ? `
            <div class="info-item">
              <div class="info-label">Parentesco:</div>
              <div class="info-value">${expedienteData.medicalInsurance.relationship}</div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Contacto de Emergencia -->
        ${expedienteData.emergencyContact && (expedienteData.emergencyContact.name || expedienteData.emergencyContact.phone) ? `
        <div class="section">
          <div class="section-title">CONTACTO DE EMERGENCIA</div>
          <div class="info-grid">
            ${expedienteData.emergencyContact.name ? `
            <div class="info-item">
              <div class="info-label">Nombre:</div>
              <div class="info-value">${expedienteData.emergencyContact.name}</div>
            </div>
            ` : ''}
            ${expedienteData.emergencyContact.relationship ? `
            <div class="info-item">
              <div class="info-label">Parentesco:</div>
              <div class="info-value">${expedienteData.emergencyContact.relationship}</div>
            </div>
            ` : ''}
            ${expedienteData.emergencyContact.phone ? `
            <div class="info-item">
              <div class="info-label">Teléfono:</div>
              <div class="info-value">${expedienteData.emergencyContact.phone}</div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Información Médica Básica -->
        <div class="section">
          <div class="section-title">INFORMACIÓN MÉDICA BÁSICA</div>
          <div class="info-item">
            <div class="info-label">Historial Médico:</div>
            <div class="info-value">${expedienteData.medicalHistory || 'Sin historial médico registrado'}</div>
          </div>
          <div class="info-item" style="margin-top: 10px;">
            <div class="info-label">Alergias:</div>
            <div class="info-value">${expedienteData.allergies || 'Sin alergias registradas'}</div>
          </div>
          <div class="info-item" style="margin-top: 10px;">
            <div class="info-label">Notas:</div>
            <div class="info-value">${expedienteData.notes || 'Sin notas adicionales'}</div>
          </div>
        </div>

        ${expedienteData.clinicalHistory ? `
        <!-- Antecedentes Heredofamiliares -->
        ${expedienteData.clinicalHistory.antecedentesHeredofamiliares ? `
        <div class="section">
          <div class="section-title">ANTECEDENTES HEREDOFAMILIARES</div>
          <div class="checkbox-list">
            <div class="checkbox-item">
              <span class="checkbox ${expedienteData.clinicalHistory.antecedentesHeredofamiliares.diabetes ? 'checked' : ''}">
                ${expedienteData.clinicalHistory.antecedentesHeredofamiliares.diabetes ? '✓' : ''}
              </span>
              <span>Diabetes</span>
            </div>
            <div class="checkbox-item">
              <span class="checkbox ${expedienteData.clinicalHistory.antecedentesHeredofamiliares.hipertension ? 'checked' : ''}">
                ${expedienteData.clinicalHistory.antecedentesHeredofamiliares.hipertension ? '✓' : ''}
              </span>
              <span>Hipertensión</span>
            </div>
            <div class="checkbox-item">
              <span class="checkbox ${expedienteData.clinicalHistory.antecedentesHeredofamiliares.cancer ? 'checked' : ''}">
                ${expedienteData.clinicalHistory.antecedentesHeredofamiliares.cancer ? '✓' : ''}
              </span>
              <span>Cáncer</span>
            </div>
            <div class="checkbox-item">
              <span class="checkbox ${expedienteData.clinicalHistory.antecedentesHeredofamiliares.cardiopatias ? 'checked' : ''}">
                ${expedienteData.clinicalHistory.antecedentesHeredofamiliares.cardiopatias ? '✓' : ''}
              </span>
              <span>Cardiopatías</span>
            </div>
          </div>
          ${expedienteData.clinicalHistory.antecedentesHeredofamiliares.otros ? `
          <div class="info-item" style="margin-top: 10px;">
            <div class="info-label">Otros:</div>
            <div class="info-value">${expedienteData.clinicalHistory.antecedentesHeredofamiliares.otros}</div>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Antecedentes Personales Patológicos -->
        ${expedienteData.clinicalHistory.antecedentesPersonalesPatologicos ? `
        <div class="section">
          <div class="section-title">ANTECEDENTES PERSONALES PATOLÓGICOS</div>
          <div class="info-item">
            <div class="info-label">Cirugías:</div>
            <div class="info-value">${expedienteData.clinicalHistory.antecedentesPersonalesPatologicos.cirugias || 'Sin cirugías previas'}</div>
          </div>
          <div class="info-item" style="margin-top: 10px;">
            <div class="info-label">Hospitalizaciones:</div>
            <div class="info-value">${expedienteData.clinicalHistory.antecedentesPersonalesPatologicos.hospitalizaciones || 'Sin hospitalizaciones previas'}</div>
          </div>
        </div>
        ` : ''}

        <!-- Antecedentes Personales No Patológicos -->
        ${expedienteData.clinicalHistory.antecedentesPersonalesNoPatologicos ? `
        <div class="section">
          <div class="section-title">ANTECEDENTES PERSONALES NO PATOLÓGICOS</div>
          <div class="checkbox-list">
            <div class="checkbox-item">
              <span class="checkbox ${expedienteData.clinicalHistory.antecedentesPersonalesNoPatologicos.tabaquismo ? 'checked' : ''}">
                ${expedienteData.clinicalHistory.antecedentesPersonalesNoPatologicos.tabaquismo ? '✓' : ''}
              </span>
              <span>Tabaquismo</span>
            </div>
            <div class="checkbox-item">
              <span class="checkbox ${expedienteData.clinicalHistory.antecedentesPersonalesNoPatologicos.alcoholismo ? 'checked' : ''}">
                ${expedienteData.clinicalHistory.antecedentesPersonalesNoPatologicos.alcoholismo ? '✓' : ''}
              </span>
              <span>Alcoholismo</span>
            </div>
          </div>
          <div class="info-item" style="margin-top: 10px;">
            <div class="info-label">Actividad Física:</div>
            <div class="info-value">${expedienteData.clinicalHistory.antecedentesPersonalesNoPatologicos.actividadFisica || 'No especificado'}</div>
          </div>
          <div class="info-item" style="margin-top: 10px;">
            <div class="info-label">Vacunas:</div>
            <div class="info-value">${expedienteData.clinicalHistory.antecedentesPersonalesNoPatologicos.vacunas || 'Esquema de vacunación no registrado'}</div>
          </div>
        </div>
        ` : ''}

        <!-- Antecedentes Gineco-Obstétricos -->
        ${expedienteData.gender === 'femenino' && expedienteData.clinicalHistory.ginecoObstetricos ? `
        <div class="section">
          <div class="section-title">ANTECEDENTES GINECO-OBSTÉTRICOS</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Embarazos:</div>
              <div class="info-value">${expedienteData.clinicalHistory.ginecoObstetricos.embarazos ?? 0}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Partos:</div>
              <div class="info-value">${expedienteData.clinicalHistory.ginecoObstetricos.partos ?? 0}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Cesáreas:</div>
              <div class="info-value">${expedienteData.clinicalHistory.ginecoObstetricos.cesareas ?? 0}</div>
            </div>
          </div>
        </div>
        ` : ''}
        ` : ''}

        <!-- Resumen Estadístico -->
        ${expedienteData.citas && expedienteData.citas.length > 0 ? `
        <div class="section">
          <div class="section-title">RESUMEN ESTADÍSTICO</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Total de Consultas:</div>
              <div class="info-value">${expedienteData.citas.length}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Consultas Completadas:</div>
              <div class="info-value">${expedienteData.citas.filter((c: any) => c.estado === 'completada').length}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Última Consulta:</div>
              <div class="info-value">${new Date(expedienteData.citas[0].date).toLocaleDateString('es-ES')}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Historial de Citas -->
        <div class="section">
          <div class="section-title">HISTORIAL DE CITAS (${expedienteData.citas?.length || 0} consultas)</div>
          ${expedienteData.citas && expedienteData.citas.length > 0 ?
        expedienteData.citas.map((cita: any) => `
              <div class="cita-card">
                <div class="cita-header">
                  <div class="cita-date">
                    ${new Date(cita.date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })} - ${cita.time}
                  </div>
                  <span class="cita-estado estado-${cita.estado}">${cita.estado}</span>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Doctor:</div>
                  <div class="info-value">${cita.doctor?.name || 'No especificado'}</div>
                </div>
                
                <div class="info-item" style="margin-top: 8px;">
                  <div class="info-label">Motivo de Consulta:</div>
                  <div class="info-value">${cita.motivo || 'No especificado'}</div>
                </div>
                
                ${cita.diagnostico ? `
                <div class="info-item" style="margin-top: 8px;">
                  <div class="info-label">Diagnóstico:</div>
                  <div class="info-value">${cita.diagnostico}</div>
                </div>
                ` : ''}
                
                ${cita.tratamiento ? `
                <div class="info-item" style="margin-top: 8px;">
                  <div class="info-label">Tratamiento:</div>
                  <div class="info-value">${cita.tratamiento}</div>
                </div>
                ` : ''}
                
                ${cita.notas ? `
                <div class="info-item" style="margin-top: 8px;">
                  <div class="info-label">Notas:</div>
                  <div class="info-value">${cita.notas}</div>
                </div>
                ` : ''}
                
                ${cita.medicamentos && cita.medicamentos.length > 0 ? `
                <div class="info-item" style="margin-top: 12px;">
                  <div class="info-label">Medicamentos Recetados:</div>
                  <div style="margin-top: 8px;">
                    ${cita.medicamentos.map((med: any) => `
                      <div class="medicamento-item">
                        <strong>${med.nombre}</strong><br>
                        <span style="font-size: 10pt;">
                          Dosis: ${med.dosis} | Frecuencia: ${med.frecuencia} | Duración: ${med.duracion}
                        </span>
                        ${med.indicaciones ? `<br><span style="font-size: 9pt; color: #666;">Indicaciones: ${med.indicaciones}</span>` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
                ` : ''}
                
                ${cita.pagos && cita.pagos.length > 0 ? `
                <div class="info-item" style="margin-top: 12px;">
                  <div class="info-label">Pagos Registrados:</div>
                  <div style="margin-top: 8px;">
                    ${cita.pagos.map((pago: any) => `
                      <div class="pago-item">
                        <div class="pago-header">
                          <div>
                            <span class="pago-monto">$${pago.monto?.toFixed(2) || '0.00'}</span>
                            ${pago.metodoPago ? `<span class="pago-metodo">Método: ${pago.metodoPago}</span>` : ''}
                          </div>
                          ${pago.fecha ? `<span class="pago-fecha">${new Date(pago.fecha).toLocaleDateString('es-ES')}</span>` : ''}
                        </div>
                        ${pago.notas ? `<div class="pago-notas">${pago.notas}</div>` : ''}
                      </div>
                    `).join('')}
                    <div class="pago-total">
                      Total Pagado: $${cita.pagos.reduce((sum: number, p: any) => sum + (p.monto || 0), 0).toFixed(2)}
                    </div>
                  </div>
                </div>
                ` : ''}
              </div>
            `).join('')
        : '<p style="text-align: center; color: #666; padding: 20px;">No hay citas registradas</p>'}
        </div>

        <div class="footer">
          <p style="margin-bottom: 8px;"><strong>CONFIDENCIALIDAD</strong></p>
          <p style="margin-bottom: 5px;">Este documento es confidencial y contiene información médica protegida bajo las leyes de privacidad aplicables.</p>
          <p style="margin-bottom: 5px;">El uso no autorizado, divulgación o reproducción de este documento está estrictamente prohibido.</p>
          <p style="margin-top: 15px; font-size: 8pt; color: #999;">
            Expediente generado automáticamente el ${new Date().toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}
          </p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } else {
      alert('Por favor, permite las ventanas emergentes para exportar el expediente');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              router.back();
              setTimeout(() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }, 80)
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pacientes
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExpediente} className="print:hidden">
              <Download className="mr-2 h-4 w-4" />
              Exportar Expediente
            </Button>
            <Button onClick={() => router.push(`/pacientes/${id}/editar`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  {paciente.fullName}
                </CardTitle>
                <CardDescription>
                  Paciente registrado el {new Date(paciente.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paciente.birthDate && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Cake className="h-5 w-5 text-pink-600 dark:text-pink-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</p>
                        <p className="text-base font-medium">{new Date(paciente.birthDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  {paciente.age && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Edad</p>
                        <p className="text-base font-medium">{paciente.age} años</p>
                      </div>
                    </div>
                  )}
                  {paciente.gender && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Género</p>
                        <p className="text-base font-medium capitalize">{paciente.gender}</p>
                      </div>
                    </div>
                  )}
                  {paciente.bloodType && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Droplet className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tipo de Sangre</p>
                        <p className="text-base font-medium">{paciente.bloodType}</p>
                      </div>
                    </div>
                  )}
                  {paciente.phone && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                        <p className="text-base font-medium">{paciente.phone}</p>
                      </div>
                    </div>
                  )}
                  {paciente.email && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-base font-medium">{paciente.email}</p>
                      </div>
                    </div>
                  )}
                </div>
                {paciente.address && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 mt-4">
                    <MapPin className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                      <p className="text-base font-medium">{paciente.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {paciente.medicalInsurance && (paciente.medicalInsurance.insurer || paciente.medicalInsurance.policyNumber) && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Seguro Médico
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paciente.medicalInsurance.insurer && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Aseguradora</p>
                          <p className="text-base font-medium">{paciente.medicalInsurance.insurer}</p>
                        </div>
                      </div>
                    )}
                    {paciente.medicalInsurance.policyNumber && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Número de Póliza</p>
                          <p className="text-base font-medium">{paciente.medicalInsurance.policyNumber}</p>
                        </div>
                      </div>
                    )}
                    {paciente.medicalInsurance.holderName && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Titular</p>
                          <p className="text-base font-medium">{paciente.medicalInsurance.holderName}</p>
                        </div>
                      </div>
                    )}
                    {paciente.medicalInsurance.relationship && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Parentesco</p>
                          <p className="text-base font-medium">{paciente.medicalInsurance.relationship}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {paciente.emergencyContact && (paciente.emergencyContact.name || paciente.emergencyContact.phone) && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Contacto de Emergencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paciente.emergencyContact.name && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <User className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                          <p className="text-base font-medium">{paciente.emergencyContact.name}</p>
                        </div>
                      </div>
                    )}
                    {paciente.emergencyContact.relationship && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Users className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Parentesco</p>
                          <p className="text-base font-medium">{paciente.emergencyContact.relationship}</p>
                        </div>
                      </div>
                    )}
                    {paciente.emergencyContact.phone && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Phone className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                          <p className="text-base font-medium">{paciente.emergencyContact.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Información Médica
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {paciente.medicalHistory && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border-l-4 border-violet-500">
                    <Heart className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Historial Médico</p>
                      <p className="text-base whitespace-pre-wrap">{paciente.medicalHistory}</p>
                    </div>
                  </div>
                )}
                {paciente.allergies && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border-l-4 border-red-500">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Alergias</p>
                      <p className="text-base whitespace-pre-wrap">{paciente.allergies}</p>
                    </div>
                  </div>
                )}
                {paciente.notes && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border-l-4 border-blue-500">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Notas</p>
                      <p className="text-base whitespace-pre-wrap">{paciente.notes}</p>
                    </div>
                  </div>
                )}
                {!paciente.medicalHistory && !paciente.allergies && !paciente.notes && (
                  <p className="text-sm text-muted-foreground text-center py-4">Sin información médica registrada</p>
                )}
              </CardContent>
            </Card>

            {clinicalHistory && (
              <>
                <Card>
                  <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                      Antecedentes Heredofamiliares
                    </CardTitle>
                    <CardDescription>Historia familiar de enfermedades</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {clinicalHistory.antecedentesHeredofamiliares ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            {clinicalHistory.antecedentesHeredofamiliares.diabetes ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">Diabetes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {clinicalHistory.antecedentesHeredofamiliares.hipertension ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">Hipertensión</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {clinicalHistory.antecedentesHeredofamiliares.cancer ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">Cáncer</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {clinicalHistory.antecedentesHeredofamiliares.cardiopatias ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">Cardiopatías</span>
                          </div>
                        </div>
                        {clinicalHistory.antecedentesHeredofamiliares.otros && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Otros</p>
                            <p className="text-sm">{clinicalHistory.antecedentesHeredofamiliares.otros}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin antecedentes heredofamiliares registrados</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Antecedentes Personales Patológicos
                    </CardTitle>
                    <CardDescription>Historia médica personal del paciente</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {clinicalHistory.antecedentesPersonalesPatologicos ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Cirugías</p>
                          <p className="text-sm">
                            {clinicalHistory.antecedentesPersonalesPatologicos.cirugias || 'Sin cirugías previas'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Hospitalizaciones</p>
                          <p className="text-sm">
                            {clinicalHistory.antecedentesPersonalesPatologicos.hospitalizaciones || 'Sin hospitalizaciones previas'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin antecedentes personales patológicos registrados</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardTitle className="flex items-center gap-2">
                      <Syringe className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Antecedentes Personales No Patológicos
                    </CardTitle>
                    <CardDescription>Hábitos y estilo de vida</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {clinicalHistory.antecedentesPersonalesNoPatologicos ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            {clinicalHistory.antecedentesPersonalesNoPatologicos.tabaquismo ? (
                              <Check className="h-4 w-4 text-amber-600" />
                            ) : (
                              <X className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm">Tabaquismo</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {clinicalHistory.antecedentesPersonalesNoPatologicos.alcoholismo ? (
                              <Check className="h-4 w-4 text-amber-600" />
                            ) : (
                              <X className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm">Alcoholismo</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Actividad Física</p>
                          <p className="text-sm">
                            {clinicalHistory.antecedentesPersonalesNoPatologicos.actividadFisica || 'No especificado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Vacunas</p>
                          <p className="text-sm">
                            {clinicalHistory.antecedentesPersonalesNoPatologicos.vacunas || 'Esquema de vacunación no registrado'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin antecedentes personales no patológicos registrados</p>
                    )}
                  </CardContent>
                </Card>

                {paciente.gender === 'femenino' && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
                      <CardTitle className="flex items-center gap-2">
                        <Baby className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        Antecedentes Gineco-Obstétricos
                      </CardTitle>
                      <CardDescription>Historia ginecológica y obstétrica</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {clinicalHistory.ginecoObstetricos &&
                        (clinicalHistory.ginecoObstetricos.embarazos !== undefined ||
                          clinicalHistory.ginecoObstetricos.partos !== undefined ||
                          clinicalHistory.ginecoObstetricos.cesareas !== undefined) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Embarazos</p>
                            <p className="text-2xl font-semibold">{clinicalHistory.ginecoObstetricos.embarazos ?? 0}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Partos</p>
                            <p className="text-2xl font-semibold">{clinicalHistory.ginecoObstetricos.partos ?? 0}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Cesáreas</p>
                            <p className="text-2xl font-semibold">{clinicalHistory.ginecoObstetricos.cesareas ?? 0}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin antecedentes gineco-obstétricos registrados</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Historial de Citas
                </CardTitle>
                <CardDescription>
                  {citas.length} cita{citas.length !== 1 ? 's' : ''} registrada{citas.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {citas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay citas registradas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {citas.slice(0, 5).map((cita: any) => (
                      <div key={cita.id} className="border-l-2 border-primary pl-3 py-2">
                        <p className="text-sm font-medium">
                          {new Date(cita.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{cita.time}</p>
                        <p className="text-xs text-muted-foreground capitalize">{cita.estado}</p>
                      </div>
                    ))}
                    {citas.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        Y {citas.length - 5} más...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>

            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/citas/nueva?pacienteId=${id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Nueva Cita
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/pacientes/${id}/historial`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Historial Completo
                  </Link>
                </Button>
              </CardContent>
            </Card>
            {/* Sección de Documentos del Paciente */}
            {documentosData?.documentos && documentosData.documentos.length > 0 && (
              <div className="mt-6">
                <DocumentList
                  documentos={documentosData.documentos}
                  onDelete={() => {
                    refetchDocumentos();
                  }}
                  showCitaInfo={true}
                  context="paciente"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
