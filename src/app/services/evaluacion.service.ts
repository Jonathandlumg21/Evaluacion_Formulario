import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, shareReplay } from 'rxjs';
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
  
  // Cache para evitar llamadas duplicadas
  private catedraticosCache$?: Observable<any>;
  private preguntasCache$?: Observable<any>;
  private estadisticasCache$?: Observable<any>;

  constructor(private http: HttpClient) {
    console.log('EvaluacionService inicializado con API URL:', this.apiUrl);
  }

  getPreguntas(): Observable<any> {
    if (!this.preguntasCache$) {
      const url = `${this.apiUrl}api/evaluaciones/preguntas`;
      console.log('🔄 Llamando a getPreguntas (primera vez):', url);
      this.preguntasCache$ = this.http.get(url).pipe(
        tap(response => console.log('✅ Respuesta de getPreguntas:', response)),
        shareReplay(1), // Cache la respuesta para reutilizar
        catchError(error => {
          console.error('❌ Error en getPreguntas:', error);
          this.preguntasCache$ = undefined; // Limpia cache en error
          throw error;
        })
      );
    } else {
      console.log('📋 Usando preguntas desde cache');
    }
    return this.preguntasCache$;
  }

  getCatedraticos(): Observable<any> {
    if (!this.catedraticosCache$) {
      const url = `${this.apiUrl}api/evaluaciones/catedraticos`;
      console.log('🔄 Llamando a getCatedraticos (primera vez):', url);
      this.catedraticosCache$ = this.http.get(url).pipe(
        tap(response => console.log('✅ Respuesta de getCatedraticos:', response)),
        shareReplay(1), // Cache la respuesta para reutilizar
        catchError((error) => {
          console.error('❌ Error en getCatedraticos:', error);
          this.catedraticosCache$ = undefined; // Limpia cache en error
          throw error;
        })
      );
    } else {
      console.log('👥 Usando catedráticos desde cache');
    }
    return this.catedraticosCache$;
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
    // En producción, siempre obtener datos frescos para las estadísticas
    const isProduction = environment.production;
    
    if (!this.estadisticasCache$ || isProduction) {
      // Agregar timestamp para evitar caché del navegador en producción
      const timestamp = isProduction ? `?_t=${Date.now()}` : '';
      const url = `${this.apiUrl}api/evaluaciones/estadisticas${timestamp}`;
      console.log('🔄 Llamando a getEstadisticas:', { url, isProduction, useCache: !isProduction });
      
      this.estadisticasCache$ = this.http.get(url).pipe(
        tap(response => console.log('✅ Respuesta de getEstadisticas:', response)),
        shareReplay(isProduction ? 0 : 1), // No cache en producción, cache en desarrollo
        catchError((error) => {
          console.error('❌ Error en getEstadisticas:', error);
          this.estadisticasCache$ = undefined; // Limpia cache en error
          throw error;
        })
      );
    } else {
      console.log('📊 Usando estadísticas desde cache (desarrollo)');
    }
    return this.estadisticasCache$;
  }

  getComentariosPorCatedratico(catedraticoId: number): Observable<any> {
    // Añadir timestamp para evitar cache del navegador sin usar headers personalizados
    const timestamp = Date.now();
    const url = `${this.apiUrl}api/evaluaciones/catedraticos/${catedraticoId}/comentarios?_t=${timestamp}`;
    console.log('🔄 Llamando a getComentariosPorCatedratico:', { url, catedraticoId, timestamp });
    return this.http.get(url).pipe(
      tap(response => {
        console.log('✅ Respuesta de getComentariosPorCatedratico:', response);
        if (response && typeof response === 'object' && 'success' in response) {
          const responseData = response as any;
          console.log(`📝 Comentarios encontrados: ${responseData.data?.length || 0}`);
        }
      }),
      catchError((error) => {
        console.error('❌ Error en getComentariosPorCatedratico:', {
          catedraticoId,
          url,
          status: error.status,
          statusText: error.statusText,
          error: error.error
        });
        return this.handleError('getComentariosPorCatedratico')(error);
      })
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