import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionService } from '../services/evaluacion.service';
import { SentimentAnalysisService } from '../services/sentiment-analysis.service';

@Component({
  selector: 'app-sentiment-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="sentiment-analysis-card">
        <div class="card-header">
          <h2 class="analysis-title">
            <i class="bi bi-graph-up-arrow me-2"></i>
            Análisis de Sentimientos
          </h2>
          <p class="analysis-subtitle">Analiza los comentarios de los catedráticos usando IA</p>
        </div>

        <div class="card-body">
          <!-- Selector de Catedráticos -->
          <div class="form-section">
            <label class="form-label">
              <i class="bi bi-person-badge me-2"></i>
              Seleccione un Catedrático
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

          <!-- Botón para Cargar Comentarios -->
          <div class="mt-4">
            <button 
              (click)="cargarComentarios()"
              class="btn-cargar"
              [disabled]="!selectedCatedraticoId">
              <i class="bi bi-cloud-download me-2"></i>
              Cargar Comentarios
            </button>
          </div>

          <!-- Área de Comentarios -->
          <div *ngIf="comentarios.length > 0" class="mt-4">
            <div class="comments-section">
              <h4>
                <i class="bi bi-chat-text me-2"></i>
                Comentarios Cargados
              </h4>
              <div class="comments-container">
                <div *ngFor="let comentario of comentarios" class="comment-item">
                  <div class="comment-header">
                    <span class="comment-date">{{ formatearFecha(comentario.fechaEvaluacion) }}</span>
                  </div>
                  <div class="comment-text">{{ comentario.comentarios }}</div>
                </div>
              </div>
            </div>

            <!-- Botón de Análisis -->
            <button 
              (click)="analizarSentimientos()"
              class="btn-analizar mt-4"
              [disabled]="!comentarios.length">
              <i class="bi bi-robot me-2"></i>
              Analizar Sentimientos
            </button>
          </div>

          <!-- Resultados del Análisis -->
          <div *ngIf="resultadoAnalisis" class="mt-4 analysis-results">
            <h4>
              <i class="bi bi-graph-up me-2"></i>
              Resultados del Análisis
            </h4>

            <!-- Resultados por Comentario -->
            <div *ngFor="let doc of resultadoAnalisis.documents" class="result-item mb-4">
              <div class="sentiment-header">
                <div class="sentiment-badge" [ngClass]="'sentiment-' + doc.sentiment">
                  {{ getSentimentLabel(doc.sentiment) }}
                </div>
              </div>

              <!-- Texto del Comentario -->
              <div class="comment-text-preview mt-3 mb-3">
                {{ doc.sentences[0]?.text }}
              </div>

              <!-- Barras de Confianza -->
              <div class="confidence-scores">
                <div class="score-bar">
                  <span class="bar-label">Positivo</span>
                  <div class="progress">
                    <div class="progress-bar bg-success" 
                         [style.width]="(doc.confidenceScores.positive * 100) + '%'">
                      {{ (doc.confidenceScores.positive * 100).toFixed(1) }}%
                    </div>
                  </div>
                </div>

                <div class="score-bar">
                  <span class="bar-label">Neutral</span>
                  <div class="progress">
                    <div class="progress-bar bg-info" 
                         [style.width]="(doc.confidenceScores.neutral * 100) + '%'">
                      {{ (doc.confidenceScores.neutral * 100).toFixed(1) }}%
                    </div>
                  </div>
                </div>

                <div class="score-bar">
                  <span class="bar-label">Negativo</span>
                  <div class="progress">
                    <div class="progress-bar bg-danger" 
                         [style.width]="(doc.confidenceScores.negative * 100) + '%'">
                      {{ (doc.confidenceScores.negative * 100).toFixed(1) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información del Modelo -->
            <div class="model-info mt-4">
              <small class="text-muted">
                <i class="bi bi-info-circle me-2"></i>
                Análisis realizado con el modelo {{ resultadoAnalisis.modelVersion }}
              </small>
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
  resultadoAnalisis: any = null;

  constructor(
    private evaluacionService: EvaluacionService,
    private sentimentService: SentimentAnalysisService
  ) {}

  ngOnInit() {
    this.cargarCatedraticos();
  }

  cargarCatedraticos() {
    this.evaluacionService.getCatedraticos().subscribe({
      next: (response) => {
        if (response.success) {
          this.catedraticos = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar catedráticos:', error);
      }
    });
  }

  onCatedraticoChange(catedraticoId: string) {
    console.log('ID de catedrático seleccionado:', catedraticoId);
    console.log('Lista de catedráticos:', this.catedraticos);
    
    this.selectedCatedratico = this.catedraticos.find(c => c.catedraticoId === Number(catedraticoId));
    console.log('Catedrático encontrado:', this.selectedCatedratico);
    
    this.comentarios = [];
    this.resultadoAnalisis = null;

    // No cargaremos los comentarios automáticamente, esperaremos al botón
  }

  cargarComentarios() {
    console.log('Catedrático seleccionado:', this.selectedCatedratico);
    
    if (this.selectedCatedratico) {
      // Intentar obtener el ID del curso desde diferentes ubicaciones
      let cursoId = this.selectedCatedratico.cursoId;
      
      // Si no está directamente en el catedrático, buscar en cursos[0]
      if (!cursoId && this.selectedCatedratico.cursos && this.selectedCatedratico.cursos.length > 0) {
        cursoId = this.selectedCatedratico.cursos[0].cursoId;
      }
      
      console.log('ID del curso encontrado:', cursoId);
      
      if (!cursoId) {
        console.error('No se encontró el ID del curso para el catedrático');
        return;
      }

      console.log('Realizando llamada a la API para el curso:', cursoId);
      
      this.evaluacionService.getComentariosPorCurso(cursoId).subscribe({
        next: (response) => {
          console.log('Respuesta de la API:', response);
          if (response.success) {
            this.comentarios = response.data;
            console.log('Comentarios cargados:', this.comentarios);
          } else {
            console.error('Error al cargar comentarios:', response);
          }
        },
        error: (error) => {
          console.error('Error al cargar comentarios:', error);
        }
      });
    } else {
      console.error('No hay catedrático seleccionado');
    }
  }

  analizarSentimientos() {
    if (this.comentarios.length > 0) {
      console.log('Iniciando análisis de sentimientos...');
      
      // Extraer solo los textos de los comentarios
      const textos = this.comentarios.map(c => c.comentarios);
      console.log('Textos a analizar:', textos);

      this.sentimentService.analyzeLocalSentiment(textos).subscribe({
        next: (response) => {
          console.log('Respuesta del análisis:', response);
          if (response.success) {
            this.resultadoAnalisis = {
              documents: response.data.resultados.map((resultado: any) => ({
                sentiment: resultado.sentimiento,
                sentences: [{ text: resultado.texto }],
                confidenceScores: {
                  positive: parseFloat(resultado.confianza.positivo) / 100,
                  neutral: parseFloat(resultado.confianza.neutral) / 100,
                  negative: parseFloat(resultado.confianza.negativo) / 100
                }
              })),
              modelVersion: 'Local Sentiment Analysis v1.0'
            };
          } else {
            console.error('El análisis no fue exitoso:', response);
          }
        },
        error: (error) => {
          console.error('Error al analizar sentimientos:', error);
        }
      });
    } else {
      console.warn('No hay comentarios para analizar');
    }
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