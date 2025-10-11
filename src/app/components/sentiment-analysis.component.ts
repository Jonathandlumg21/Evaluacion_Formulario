import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionService } from '../services/evaluacion.service';
import { SentimentAnalysisService, SentimentResult } from '../services/sentiment-analysis.service';

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4">
      <div class="sentiment-analysis-card">
        <div class="card-header">
          <h2 class="analysis-title">
            <i class="bi bi-graph-up-arrow me-2"></i>
            🧠 Análisis de Sentimientos - Comentarios de Evaluaciones
          </h2>
          <p class="analysis-subtitle">Analiza los comentarios de los catedráticos usando IA</p>
        </div>

        <div class="card-body">
          <!-- Selector de Catedráticos -->
          <div class="form-section">
            <label class="form-label">
              <i class="bi bi-person-badge me-2"></i>
              Seleccionar Catedrático:
            </label>
            <select 
              [(ngModel)]="selectedCatedraticoId"
              (ngModelChange)="onCatedraticoChange($event)"
              class="form-select">
              <option value="">Elija un catedrático...</option>
              <option *ngFor="let catedratico of catedraticos" [value]="catedratico.catedraticoId">
                {{ catedratico.nombreCompleto }}
              </option>
            </select>
          </div>

          <!-- Información del Catedrático Seleccionado -->
          <div *ngIf="selectedCatedratico" class="mt-4 selected-info">
            <div class="info-header">
              <h4>
                <i class="bi bi-info-circle me-2"></i>
                Información del Catedrático
              </h4>
            </div>
            <div class="info-content">
              <p><strong>Nombre:</strong> {{ selectedCatedratico.nombreCompleto }}</p>
              <div *ngIf="selectedCatedratico.cursos && selectedCatedratico.cursos.length > 0">
                <p><strong>Curso:</strong> {{ selectedCatedratico.cursos[0].nombreCurso }}</p>
                <p><strong>Seminario:</strong> {{ selectedCatedratico.cursos[0].seminario }}</p>
              </div>
            </div>
          </div>

          <!-- Botón para Cargar y Analizar -->
          <div class="mt-4" *ngIf="selectedCatedraticoId">
            <button 
              (click)="cargarComentarios()"
              class="btn-cargar"
              [disabled]="cargando">
              <span *ngIf="cargando" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!cargando" class="bi bi-cloud-download me-2"></i>
              {{ cargando ? 'Cargando y Analizando...' : 'Cargar y Analizar Comentarios' }}
            </button>
          </div>

          <!-- Mostrar errores -->
          <div *ngIf="error" class="alert alert-danger mt-3">
            <strong>Error:</strong> {{ error }}
          </div>

          <!-- Indicador de carga -->
          <div *ngIf="cargando" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Analizando sentimientos con IA...</p>
          </div>

          <!-- Resultados del análisis -->
          <div *ngIf="resultadosSentimientos.length > 0 && !cargando" class="mt-4">
            <h4>📊 Resultados del Análisis</h4>
            
            <!-- Resumen -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="card bg-success text-white">
                  <div class="card-body text-center">
                    <h5>😊 Positivos</h5>
                    <h3>{{ contarSentimientos('positive') }}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-warning text-white">
                  <div class="card-body text-center">
                    <h5>😐 Neutrales</h5>
                    <h3>{{ contarSentimientos('neutral') }}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-danger text-white">
                  <div class="card-body text-center">
                    <h5>😞 Negativos</h5>
                    <h3>{{ contarSentimientos('negative') }}</h3>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabla de resultados detallados -->
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Comentario</th>
                    <th>Sentimiento</th>
                    <th>Confianza Positiva</th>
                    <th>Confianza Neutral</th>
                    <th>Confianza Negativa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let resultado of resultadosSentimientos">
                    <td>{{ resultado.texto.length > 100 ? (resultado.texto | slice:0:100) + '...' : resultado.texto }}</td>
                    <td [class]="getSentimentClass(resultado.sentimiento)">
                      <strong>
                        {{ getSentimentEmoji(resultado.sentimiento) }}
                        {{ resultado.sentimiento | titlecase }}
                      </strong>
                    </td>
                    <td>
                      <div class="progress" style="height: 20px;">
                        <div 
                          class="progress-bar bg-success" 
                          [style.width]="resultado.confianza.positivo"
                          [title]="resultado.confianza.positivo">
                          {{ resultado.confianza.positivo }}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="progress" style="height: 20px;">
                        <div 
                          class="progress-bar bg-warning" 
                          [style.width]="resultado.confianza.neutral"
                          [title]="resultado.confianza.neutral">
                          {{ resultado.confianza.neutral }}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="progress" style="height: 20px;">
                        <div 
                          class="progress-bar bg-danger" 
                          [style.width]="resultado.confianza.negativo"
                          [title]="resultado.confianza.negativo">
                          {{ resultado.confianza.negativo }}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sentiment-analysis-card {
      background: linear-gradient(135deg, #1a1f3c, #2a284d);
      border-radius: 15px;
      padding: 2rem;
      color: #fff;
      box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .analysis-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      background: linear-gradient(45deg, #7928CA, #FF0080);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .analysis-subtitle {
      color: #a8b2d1;
      font-size: 1.1rem;
    }

    .form-section {
      background: rgba(255, 255, 255, 0.05);
      padding: 1.5rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
    }

    .form-label {
      color: #e6e9f0;
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
      display: block;
    }

    .form-select {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 0.75rem;
      border-radius: 8px;
      width: 100%;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-select:focus {
      outline: none;
      border-color: #7928CA;
      box-shadow: 0 0 0 2px rgba(121, 40, 202, 0.3);
    }

    .selected-info {
      background: rgba(255, 255, 255, 0.05);
      padding: 1.5rem;
      border-radius: 10px;
      border-left: 4px solid #7928CA;
    }

    .info-header h4 {
      color: #e6e9f0;
      margin-bottom: 1rem;
    }

    .info-content p {
      color: #a8b2d1;
      margin-bottom: 0.5rem;
    }

    .btn-cargar, .btn-analizar {
      background: linear-gradient(45deg, #7928CA, #FF0080);
      border: none;
      padding: 0.75rem 1.5rem;
      color: white;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-cargar:disabled, .btn-analizar:disabled {
      background: linear-gradient(45deg, #4a4a4a, #686868);
      cursor: not-allowed;
    }

    .btn-cargar:hover:not(:disabled), .btn-analizar:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(121, 40, 202, 0.4);
    }

    .comments-section {
      background: rgba(255, 255, 255, 0.05);
      padding: 1.5rem;
      border-radius: 10px;
      margin-top: 1.5rem;
    }

    .comments-container {
      max-height: 300px;
      overflow-y: auto;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      margin-top: 1rem;
    }

    .comment-item {
      background: rgba(255, 255, 255, 0.05);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .comment-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .comment-date {
      color: #a8b2d1;
      font-size: 0.9rem;
    }

    .comment-text {
      color: #e6e9f0;
      line-height: 1.5;
    }

    .analysis-results {
      background: rgba(255, 255, 255, 0.05);
      padding: 1.5rem;
      border-radius: 10px;
      margin-top: 1.5rem;
    }

    .result-item {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sentiment-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .sentiment-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 500;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sentiment-positive {
      background: linear-gradient(45deg, #00b09b, #96c93d);
      color: white;
    }

    .sentiment-negative {
      background: linear-gradient(45deg, #ff416c, #ff4b2b);
      color: white;
    }

    .sentiment-neutral {
      background: linear-gradient(45deg, #4b6cb7, #182848);
      color: white;
    }

    .comment-text-preview {
      color: #e6e9f0;
      font-size: 1rem;
      line-height: 1.6;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      white-space: pre-line;
    }

    .confidence-scores {
      margin-top: 1.5rem;
    }

    .score-bar {
      margin-bottom: 1rem;
    }

    .bar-label {
      display: block;
      color: #a8b2d1;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .progress {
      height: 1.25rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: width 0.6s ease;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .model-info {
      color: #a8b2d1;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.9rem;
    }
  `]
})
export class SentimentAnalysisComponent implements OnInit {
  catedraticos: any[] = [];
  selectedCatedraticoId: string = '';
  selectedCatedratico: any = null;
  comentarios: any[] = [];
  resultadosSentimientos: SentimentResult[] = [];
  cargando = false;
  error = '';
  cursoSeleccionado = 1;

  constructor(
    private evaluacionService: EvaluacionService,
    private sentimentService: SentimentAnalysisService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarCatedraticos();
  }

  cargarCatedraticos() {
    console.log('🔄 Cargando catedráticos para sentiment analysis...');
    this.evaluacionService.getCatedraticos().subscribe({
      next: (response) => {
        console.log('📋 Respuesta getCatedraticos en sentiment:', response);
        if (response.success && response.data) {
          this.catedraticos = response.data;
          console.log('✅ Catedráticos cargados en sentiment:', this.catedraticos.length);
          this.cdr.detectChanges(); // Forzar detección de cambios con OnPush
        } else {
          console.warn('⚠️ No se encontraron catedráticos o respuesta inválida');
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar catedráticos en sentiment:', error);
      }
    });
  }

  onCatedraticoChange(catedraticoId: string) {
    console.log('🔄 ID de catedrático seleccionado:', catedraticoId);
    console.log('📋 Lista de catedráticos:', this.catedraticos);
    
    this.selectedCatedratico = this.catedraticos.find(c => c.catedraticoId === Number(catedraticoId));
    console.log('👤 Catedrático encontrado:', this.selectedCatedratico);
    
    // Limpiar datos previos
    this.comentarios = [];
    this.resultadosSentimientos = [];
    this.error = '';
    this.cdr.detectChanges(); // Actualizar vista
  }

  // Cargar comentarios de un curso específico y analizar automáticamente
  cargarComentarios() {
    if (!this.selectedCatedratico) {
      this.error = 'Por favor selecciona un catedrático primero';
      return;
    }

    // Obtener ID del curso
    let cursoId = this.selectedCatedratico.cursoId;
    if (!cursoId && this.selectedCatedratico.cursos && this.selectedCatedratico.cursos.length > 0) {
      cursoId = this.selectedCatedratico.cursos[0].cursoId;
    }
    
    if (!cursoId) {
      this.error = 'No se pudo encontrar el curso para este catedrático';
      return;
    }

    this.cargando = true;
    this.error = '';
    
    console.log('🔍 Cargando comentarios del curso:', cursoId);
    
    this.evaluacionService.getComentariosPorCurso(cursoId).subscribe({
      next: (response) => {
        console.log('✅ Comentarios cargados:', response);
        this.comentarios = response.data || [];
        this.cargando = false;
        
        if (this.comentarios.length > 0) {
          // Automáticamente analizar sentimientos de los comentarios
          this.analizarSentimientosAutomatico();
        } else {
          this.error = 'No hay comentarios disponibles para este catedrático';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al cargar comentarios:', error);
        this.error = 'Error al cargar comentarios del curso';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Analizar sentimientos automáticamente
  analizarSentimientosAutomatico() {
    if (this.comentarios.length === 0) {
      this.error = 'No hay comentarios para analizar';
      return;
    }

    // Extraer solo los textos de comentarios
    const textos = this.comentarios.map(comentario => comentario.comentarios);
    this.analizarSentimientos(textos);
  }

  // Analizar sentimientos de textos específicos
  analizarSentimientos(textos: string[]) {
    if (!textos || textos.length === 0) {
      this.error = 'No hay textos para analizar';
      return;
    }

    this.cargando = true;
    this.error = '';
    
    console.log('🧠 Enviando análisis de sentimientos:', { textos });

    this.sentimentService.analizarSentimientos(textos).subscribe({
      next: (response) => {
        console.log('✅ Análisis completado:', response);
        this.resultadosSentimientos = response.data.resultados;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error en análisis:', error);
        
        let mensajeError = 'Error desconocido';
        if (error.error?.message) {
          mensajeError = error.error.message;
        } else if (error.message) {
          mensajeError = error.message;
        }
        
        // Mensajes específicos según el tipo de error
        if (error.status === 500 && error.error?.message?.includes('Configuración del servicio')) {
          mensajeError = 'El servicio de análisis de sentimientos no está configurado correctamente en el servidor. Contacta al administrador.';
        } else if (error.status === 0) {
          mensajeError = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }
        
        this.error = `Error en el análisis de sentimientos: ${mensajeError}`;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Obtener clase CSS según el sentimiento
  getSentimentClass(sentimiento: string): string {
    switch (sentimiento) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-danger';
      case 'neutral': return 'text-warning';
      default: return 'text-muted';
    }
  }

  // Obtener emoji según el sentimiento
  getSentimentEmoji(sentimiento: string): string {
    switch (sentimiento) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '❓';
    }
  }

  // Contar sentimientos por tipo
  contarSentimientos(tipo: string): number {
    return this.resultadosSentimientos.filter(r => r.sentimiento === tipo).length;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getSentimentLabel(sentiment: string): string {
    const labels: { [key: string]: string } = {
      'positive': 'Positivo',
      'neutral': 'Neutral',
      'negative': 'Negativo'
    };
    return labels[sentiment] || sentiment;
  }
}