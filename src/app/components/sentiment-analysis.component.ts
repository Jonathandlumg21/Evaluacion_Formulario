import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluacionService } from '../services/evaluacion.service';
import { SentimentAnalysisService, SentimentResult } from '../services/sentiment-analysis.service';

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="futuristic-container">
      <div class="futuristic-card sentiment-analysis-card">
        <div class="card-glow"></div>
        <div class="card-header">
          <div class="header-content">
            <button (click)="volverAEvaluacion()" class="futuristic-btn">
              <i class="bi bi-arrow-left me-2"></i>
              Regresar a Evaluación
            </button>
            <div class="title-section">
              <h2 class="futuristic-title">
                <i class="bi bi-graph-up-arrow me-2"></i>
                🧠 Análisis de Sentimientos
              </h2>
              <p class="subtitle">Analiza los comentarios de los catedráticos usando IA</p>
            </div>
          </div>
        </div>

        <div class="card-body">
          <!-- Selector de Catedráticos -->
          <div class="futuristic-input-group">
            <label class="futuristic-label">
              <i class="bi bi-person-badge me-2"></i>
              Seleccionar Catedrático:
            </label>
            <select 
              [(ngModel)]="selectedCatedraticoId"
              (ngModelChange)="onCatedraticoChange($event)"
              class="futuristic-select">
              <option value="">Elija un catedrático...</option>
              <option *ngFor="let catedratico of catedraticos" [value]="catedratico.catedraticoId">
                {{ catedratico.nombreCompleto }}
              </option>
            </select>
          </div>

          <!-- Información del Catedrático Seleccionado -->
          <div *ngIf="selectedCatedratico" class="mt-4">
            <div class="curso-info-card animated-element">
              <div class="curso-info-header">
                <h3>
                  <i class="bi bi-person-badge me-2"></i>
                  Información del Catedrático
                </h3>
              </div>
              <div class="curso-details">
                <div class="detail-item">
                  <span class="detail-label">
                    <i class="bi bi-person-fill me-2"></i>
                    Nombre:
                  </span>
                  <span class="detail-value">{{ selectedCatedratico.nombreCompleto }}</span>
                </div>
                <div *ngIf="selectedCatedratico.cursos && selectedCatedratico.cursos.length > 0">
                  <div class="detail-item">
                    <span class="detail-label">
                      <i class="bi bi-book me-2"></i>
                      Curso:
                    </span>
                    <span class="detail-value">{{ selectedCatedratico.cursos[0].nombreCurso }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">
                      <i class="bi bi-mortarboard me-2"></i>
                      Seminario:
                    </span>
                    <span class="seminario-badge-info">{{ selectedCatedratico.cursos[0].seminario }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón para Cargar y Analizar -->
          <div class="mt-4" *ngIf="selectedCatedraticoId">
            <button 
              (click)="cargarComentarios()"
              class="futuristic-btn"
              [disabled]="cargando">
              <span *ngIf="cargando" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!cargando" class="bi bi-cloud-download me-2"></i>
              {{ cargando ? 'Cargando y Analizando...' : 'Cargar y Analizar Comentarios' }}
            </button>
          </div>

          <!-- Mostrar errores -->
          <div *ngIf="error" class="futuristic-alert error mt-3">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> {{ error }}
          </div>

          <!-- Indicador de carga -->
          <div *ngIf="cargando" class="text-center py-4">
            <div class="loader"></div>
            <p class="mt-3 text-light">
              <i class="bi bi-cpu me-2"></i>
              Analizando sentimientos con IA...
            </p>
          </div>

          <!-- Resultados del análisis -->
          <div *ngIf="resultadosSentimientos.length > 0 && !cargando" class="mt-4">
            <div class="results-header">
              <h4><i class="bi bi-graph-up me-2"></i>Resultados del Análisis de Sentimientos</h4>
              <div class="analysis-info">
                <span class="badge-info">Total: {{ resultadosSentimientos.length }} comentarios</span>
                <span class="badge-info" *ngIf="analysisData?.respuestaCompleta?.modelVersion">
                  Modelo: {{ analysisData.respuestaCompleta.modelVersion }}
                </span>
              </div>
            </div>
            
            <!-- Resumen Estadístico Mejorado -->
            <div class="statistics-grid">
              <div class="stat-card positive">
                <div class="stat-icon">😊</div>
                <div class="stat-content">
                  <h3>{{ contarSentimientos('positive') }}</h3>
                  <p>Comentarios Positivos</p>
                  <div class="stat-percentage">{{ getPercentage('positive') }}%</div>
                </div>
              </div>
              <div class="stat-card neutral">
                <div class="stat-icon">😐</div>
                <div class="stat-content">
                  <h3>{{ contarSentimientos('neutral') }}</h3>
                  <p>Comentarios Neutrales</p>
                  <div class="stat-percentage">{{ getPercentage('neutral') }}%</div>
                </div>
              </div>
              <div class="stat-card negative">
                <div class="stat-icon">😞</div>
                <div class="stat-content">
                  <h3>{{ contarSentimientos('negative') }}</h3>
                  <p>Comentarios Negativos</p>
                  <div class="stat-percentage">{{ getPercentage('negative') }}%</div>
                </div>
              </div>
            </div>

            <!-- Análisis Detallado por Comentario -->
            <div class="detailed-analysis">
              <h5><i class="bi bi-list-check me-2"></i>Análisis Detallado por Comentario</h5>
              <div class="comments-analysis-grid">
                <div *ngFor="let resultado of resultadosSentimientos; let i = index" class="comment-analysis-card">
                  <div class="comment-header">
                    <div class="comment-number">#{{ i + 1 }}</div>
                    <div class="sentiment-badge" [ngClass]="'sentiment-' + resultado.sentimiento">
                      {{ getSentimentEmoji(resultado.sentimiento) }}
                      {{ resultado.sentimiento | titlecase }}
                    </div>
                  </div>
                  
                  <div class="comment-text">
                    <p>{{ resultado.texto }}</p>
                  </div>
                  
                  <div class="confidence-analysis">
                    <h6>Niveles de Confianza:</h6>
                    <div class="confidence-bars">
                      <div class="confidence-item">
                        <span class="confidence-label positive">Positivo</span>
                        <div class="confidence-bar-container">
                          <div class="confidence-bar positive" [style.width]="resultado.confianza.positivo"></div>
                          <span class="confidence-value">{{ resultado.confianza.positivo }}</span>
                        </div>
                      </div>
                      <div class="confidence-item">
                        <span class="confidence-label neutral">Neutral</span>
                        <div class="confidence-bar-container">
                          <div class="confidence-bar neutral" [style.width]="resultado.confianza.neutral"></div>
                          <span class="confidence-value">{{ resultado.confianza.neutral }}</span>
                        </div>
                      </div>
                      <div class="confidence-item">
                        <span class="confidence-label negative">Negativo</span>
                        <div class="confidence-bar-container">
                          <div class="confidence-bar negative" [style.width]="resultado.confianza.negativo"></div>
                          <span class="confidence-value">{{ resultado.confianza.negativo }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="analysis-metadata" *ngIf="analysisData?.respuestaCompleta?.documents[i]">
                    <small>
                      <i class="bi bi-info-circle me-1"></i>
                      Longitud del texto: {{ analysisData.respuestaCompleta.documents[i].sentences[0]?.length || resultado.texto.length }} caracteres
                    </small>
                  </div>
                </div>
              </div>
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

    /* Estilos para los resultados profesionales */
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e0e6ed;
    }

    .results-header h4 {
      color: #2d3748;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .analysis-info {
      display: flex;
      gap: 1rem;
    }

    .badge-info {
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      display: flex;
      align-items: center;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--accent-color);
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }

    .stat-card.positive::before {
      background: linear-gradient(45deg, #4CAF50, #8BC34A);
    }

    .stat-card.neutral::before {
      background: linear-gradient(45deg, #FF9800, #FFC107);
    }

    .stat-card.negative::before {
      background: linear-gradient(45deg, #F44336, #E91E63);
    }

    .stat-icon {
      font-size: 3rem;
      margin-right: 1.5rem;
    }

    .stat-content h3 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      color: #2d3748;
    }

    .stat-content p {
      color: #718096;
      font-weight: 600;
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }

    .stat-percentage {
      color: #4a5568;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .detailed-analysis {
      margin-top: 3rem;
    }

    .detailed-analysis h5 {
      color: #2d3748;
      font-weight: 700;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
    }

    .comments-analysis-grid {
      display: grid;
      gap: 2rem;
    }

    .comment-analysis-card {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }

    .comment-analysis-card:hover {
      transform: translateX(5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .comment-number {
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .sentiment-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .sentiment-badge.sentiment-positive {
      background: linear-gradient(45deg, #4CAF50, #8BC34A);
      color: white;
    }

    .sentiment-badge.sentiment-neutral {
      background: linear-gradient(45deg, #FF9800, #FFC107);
      color: white;
    }

    .sentiment-badge.sentiment-negative {
      background: linear-gradient(45deg, #F44336, #E91E63);
      color: white;
    }

    .comment-text {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      border-left: 4px solid #e2e8f0;
    }

    .comment-text p {
      margin: 0;
      color: #4a5568;
      line-height: 1.6;
      font-size: 1rem;
    }

    .confidence-analysis h6 {
      color: #2d3748;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .confidence-bars {
      display: grid;
      gap: 1rem;
    }

    .confidence-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .confidence-label {
      min-width: 80px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .confidence-label.positive { color: #4CAF50; }
    .confidence-label.neutral { color: #FF9800; }
    .confidence-label.negative { color: #F44336; }

    .confidence-bar-container {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .confidence-bar {
      height: 8px;
      border-radius: 4px;
      transition: all 0.3s ease;
      position: relative;
      min-width: 2px;
    }

    .confidence-bar.positive {
      background: linear-gradient(45deg, #4CAF50, #8BC34A);
    }

    .confidence-bar.neutral {
      background: linear-gradient(45deg, #FF9800, #FFC107);
    }

    .confidence-bar.negative {
      background: linear-gradient(45deg, #F44336, #E91E63);
    }

    .confidence-value {
      font-weight: 600;
      font-size: 0.9rem;
      color: #4a5568;
      min-width: 50px;
    }

    .analysis-metadata {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      color: #718096;
    }

    .analysis-metadata i {
      color: #667eea;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .statistics-grid {
        grid-template-columns: 1fr;
      }

      .confidence-item {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .confidence-bar-container {
        flex-direction: row;
        align-items: center;
      }
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
  analysisData: any = null;

  constructor(
    private evaluacionService: EvaluacionService,
    private sentimentService: SentimentAnalysisService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarCatedraticos();
  }

  cargarCatedraticos() {
    this.evaluacionService.getCatedraticos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.catedraticos = response.data;
          this.cdr.detectChanges(); // Forzar detección de cambios con OnPush
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar catedráticos en sentiment:', error);
      }
    });
  }

  onCatedraticoChange(catedraticoId: string) {
    this.selectedCatedratico = this.catedraticos.find(c => c.catedraticoId === Number(catedraticoId));
    
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
    
    this.evaluacionService.getComentariosPorCurso(cursoId).subscribe({
      next: (response) => {
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
    
    this.sentimentService.analizarSentimientos(textos).subscribe({
      next: (response) => {
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

  // Método para obtener el porcentaje de cada tipo de sentimiento
  getPercentage(tipo: string): number {
    if (this.resultadosSentimientos.length === 0) return 0;
    const count = this.contarSentimientos(tipo);
    return Math.round((count / this.resultadosSentimientos.length) * 100);
  }

  // Método para navegar de vuelta a la evaluación
  volverAEvaluacion(): void {
    this.router.navigate(['/']);
  }
}