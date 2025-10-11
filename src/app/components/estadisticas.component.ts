import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EvaluacionService } from '../services/evaluacion.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="futuristic-container py-4">
      <div class="row">
        <div class="col-12 mb-4 animated-element">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="futuristic-title">
              <i class="bi bi-graph-up-arrow me-2"></i>
              Análisis en Tiempo Real
            </h1>
            <a routerLink="/" class="futuristic-btn">
              <i class="bi bi-arrow-left me-2"></i>Volver a Evaluación
            </a>
          </div>
        </div>

              <!-- Calificación General del Seminario -->
        <div class="col-12 mb-4 animated-element" style="animation-delay: 0.1s">
          <div class="futuristic-hero-card">
            <div class="hero-glow"></div>
            <div class="card-body text-center p-4">
              <h2 class="hero-title">
                <i class="bi bi-star-fill me-2"></i>
                Calificación General del Seminario
              </h2>
              <div class="hero-stats">
                <div class="main-score">
                  {{ estadisticas?.calificacion_general_seminario || 0 | number:'1.1-1' }}
                  <span class="score-percentage">{{ (estadisticas?.calificacion_general_seminario * 20) || 0 | number:'1.0-0' }}%</span>
                </div>
                <div class="score-visual">
                  <div class="circular-progress-large">
                    <svg viewBox="0 0 36 36" class="circular-chart-large">
                      <path class="circle-bg-large"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path class="circle-large"
                        [attr.stroke-dasharray]="(estadisticas?.calificacion_general_seminario * 20 || 0) + ', 100'"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>        <!-- Rendimiento por Catedrático -->
        <div class="col-12 mb-4">
          <h2 class="stats-title animated-element" style="animation-delay: 0.2s">
            <i class="bi bi-people-fill me-2"></i>
            Rendimiento por Catedrático
          </h2>
          <div class="row g-3">
            <div class="col-md-6 col-lg-4 animated-element" 
                 *ngFor="let catedratico of estadisticas?.catedraticos; let i = index"
                 [style.animation-delay]="(0.3 + i * 0.1) + 's'">
              <div class="card h-100 stats-card interactive-element">
                <div class="card-body">
                  <div class="d-flex align-items-center mb-3">
                    <div class="rounded-circle bg-primary text-white p-2 me-2">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <h3 class="card-title h5 mb-0">{{ catedratico.nombreCompleto }}</h3>
                  </div>
                  <div class="list-group list-group-flush">
                    <div class="catedratico-stat">
                      <div class="stat-row">
                        <span class="stat-label">
                          <i class="bi bi-clipboard-data me-2"></i>
                          Evaluaciones:
                        </span>
                        <span class="stat-value primary">
                          {{ catedratico.cantidad_respuestas }}
                        </span>
                      </div>
                    </div>
                    <div class="catedratico-stat">
                      <div class="stat-row">
                        <span class="stat-label">
                          <i class="bi bi-mortarboard me-2"></i>
                          Seminario:
                        </span>
                        <span class="seminario-badge">
                          {{ catedratico.seminario }}
                        </span>
                      </div>
                    </div>
                    <div class="catedratico-stat">
                      <div class="stat-row">
                        <span class="stat-label">
                          <i class="bi bi-star-half me-2"></i>
                          Promedio:
                        </span>
                        <span class="stat-value success">
                          {{ catedratico.calificacion_promedio_catedratico | number:'1.1-1' }}
                          <small class="percentage">{{ (catedratico.calificacion_promedio_catedratico * 20) | number:'1.0-0' }}%</small>
                        </span>
                      </div>
                      <div class="futuristic-progress-stats mt-2">
                        <div class="progress-bar-fill-stats" 
                             [style.width]="(catedratico.calificacion_promedio_catedratico * 20) + '%'"></div>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer bg-transparent border-0 pt-0">
                    <button 
                      class="futuristic-btn-small w-100"
                      (click)="verComentarios(catedratico)">
                      <i class="bi bi-chat-dots me-2"></i>
                      Comentarios
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Análisis por Seminario -->
        <div class="col-12 animated-element" style="animation-delay: 0.8s">
          <div class="futuristic-card">
            <div class="card-glow"></div>
            <div class="card-body">
              <h2 class="stats-title mb-3">
                <i class="bi bi-bookmark-fill me-2"></i>
                Análisis por Seminario
              </h2>
              <div class="list-group">
                <div class="seminario-card interactive-element mb-3" 
                     *ngFor="let seminario of estadisticas?.promedios_por_seminario">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                      <h6 class="seminario-name mb-0">
                        {{ seminario.seminario }}
                      </h6>
                      <div class="seminario-score">
                        {{ seminario.promedio_general | number:'1.1-1' }}
                        <span class="seminario-percentage">{{ (seminario.promedio_general * 20) | number:'1.0-0' }}%</span>
                      </div>
                    </div>
                    <div class="futuristic-progress mt-2">
                      <div class="progress-bar-fill" 
                           [style.width]="(seminario.promedio_general * 20) + '%'"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Comentarios -->
      <div *ngIf="showModal" class="futuristic-modal-overlay" (click)="cerrarModal()">
        <div class="futuristic-modal-content" (click)="$event.stopPropagation()">
          <div class="futuristic-modal-header">
            <h3 class="modal-title">
              <i class="bi bi-chat-text-fill me-2"></i>
              Comentarios de Evaluación
            </h3>
            <button class="futuristic-close-btn" (click)="cerrarModal()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="futuristic-modal-body" *ngIf="comentariosData">
            <!-- Información del Curso y Catedrático -->
            <div class="curso-info-modal mb-4">
              <div class="info-header">
                <h4 class="info-title">
                  <i class="bi bi-person-badge me-2"></i>
                  {{ comentariosData.meta.curso.catedratico.nombreCompleto }}
                </h4>
                <div class="info-subtitle">
                  <i class="bi bi-book me-2"></i>
                  {{ comentariosData.meta.curso.nombreCurso }}
                  <span class="seminario-tag ms-2">{{ comentariosData.meta.curso.seminario }}</span>
                </div>
              </div>
              <div class="comentarios-count">
                <i class="bi bi-chat-square-text me-2"></i>
                Total de comentarios: <strong>{{ comentariosData.meta.totalComentarios }}</strong>
              </div>
            </div>

            <!-- Lista de Comentarios -->
            <div class="comentarios-list">
              <div class="comentario-item" 
                   *ngFor="let comentario of comentariosData.data; let i = index">
                <div class="comentario-header">
                  <div class="comentario-numero">
                    <i class="bi bi-chat-dots"></i>
                    Evaluación #{{ comentario.evaluacionId }}
                  </div>
                  <div class="comentario-fecha">
                    <i class="bi bi-calendar3 me-1"></i>
                    {{ formatearFecha(comentario.fechaEvaluacion) }}
                  </div>
                </div>
                <div class="comentario-contenido">
                  <p>{{ comentario.comentarios }}</p>
                </div>
              </div>

              <div *ngIf="comentariosData.data.length === 0" class="sin-comentarios">
                <i class="bi bi-inbox me-2"></i>
                No hay comentarios disponibles para este catedrático.
              </div>
            </div>
          </div>

          <div class="futuristic-modal-footer">
            <button class="futuristic-btn" (click)="cerrarModal()">
              <i class="bi bi-check-lg me-2"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class EstadisticasComponent implements OnInit {
  estadisticas: any = null;
  comentariosData: any = null;
  showModal: boolean = false;
  catedraticosCompletos: any[] = [];

  constructor(private evaluacionService: EvaluacionService) {}

  ngOnInit() {
    this.cargarEstadisticas();
    this.cargarCatedraticos();
  }

  cargarEstadisticas() {
    this.evaluacionService.getEstadisticas().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticas = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  cargarCatedraticos() {
    this.evaluacionService.getCatedraticos().subscribe({
      next: (response) => {
        if (response.success) {
          this.catedraticosCompletos = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar catedráticos completos:', error);
      }
    });
  }

  obtenerCursoIdPorCatedratico(nombreCatedratico: string): number {
    const catedratico = this.catedraticosCompletos.find(c => 
      c.nombreCompleto === nombreCatedratico
    );
    return catedratico && catedratico.cursos && catedratico.cursos.length > 0 
      ? catedratico.cursos[0].cursoId 
      : 0;
  }

  verComentarios(catedratico: any) {
    const cursoId = this.obtenerCursoIdPorCatedratico(catedratico.nombreCompleto);
    
    if (cursoId > 0) {
      this.evaluacionService.getComentariosPorCurso(cursoId).subscribe({
        next: (response) => {
          if (response.success) {
            this.comentariosData = response;
            this.showModal = true;
          }
        },
        error: (error) => {
          console.error('Error al cargar comentarios:', error);
        }
      });
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.comentariosData = null;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}