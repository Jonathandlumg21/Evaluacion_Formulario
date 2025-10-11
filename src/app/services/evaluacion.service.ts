import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface Pregunta {
  preguntaId: number;
  textoPregunta: string;
}

interface Curso {
  cursoId: number;
  nombreCurso: string;
  seminario: string;
}

interface Catedratico {
  catedraticoId: number;
  nombreCompleto: string;
  cursos: Curso[];
}

interface Evaluacion {
  catedraticoId: number;
  cursoId: number;
  comentarios: string;
  respuestas: number[];
}

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('EvaluacionService inicializado con API URL:', this.apiUrl);
  }

  getPreguntas(): Observable<any> {
    const url = `${this.apiUrl}api/evaluaciones/preguntas`;
    console.log('Llamando a getPreguntas:', url);
    return this.http.get(url).pipe(
      tap(response => console.log('Respuesta de getPreguntas:', response)),
      catchError(error => {
        console.error('Error en getPreguntas:', error);
        throw error;
      })
    );
  }

  getCatedraticos(): Observable<any> {
    const url = `${this.apiUrl}api/evaluaciones/catedraticos`;
    console.log('Llamando a getCatedraticos:', url);
    return this.http.get(url).pipe(
      tap(response => console.log('Respuesta de getCatedraticos:', response)),
      catchError(this.handleError('getCatedraticos'))
    );
  }

  enviarEvaluacion(evaluacion: Evaluacion): Observable<any> {
    const url = `${this.apiUrl}api/evaluaciones`;
    console.log('Enviando evaluación:', { url, evaluacion });
    return this.http.post(url, evaluacion).pipe(
      tap(response => console.log('Respuesta de enviarEvaluacion:', response)),
      catchError(this.handleError('enviarEvaluacion'))
    );
  }

  getEstadisticas(): Observable<any> {
    const url = `${this.apiUrl}api/evaluaciones/estadisticas`;
    console.log('Llamando a getEstadisticas:', url);
    return this.http.get(url).pipe(
      tap(response => console.log('Respuesta de getEstadisticas:', response)),
      catchError(this.handleError('getEstadisticas'))
    );
  }

  getComentariosPorCurso(cursoId: number): Observable<any> {
    const url = `${this.apiUrl}api/evaluaciones/cursos/${cursoId}/comentarios`;
    console.log('Llamando a getComentariosPorCurso:', { url, cursoId });
    return this.http.get(url).pipe(
      tap(response => console.log('Respuesta de getComentariosPorCurso:', response)),
      catchError(this.handleError('getComentariosPorCurso'))
    );
  }

  private handleError(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<any> => {
      console.error(`${operation} falló:`, error);
      
      // Log detalles específicos del error
      if (error.error instanceof ErrorEvent) {
        console.error('Error del cliente:', error.error.message);
      } else {
        console.error(
          `Error del backend (código ${error.status}):`,
          error.error
        );
      }

      throw error;
    };
  }
}