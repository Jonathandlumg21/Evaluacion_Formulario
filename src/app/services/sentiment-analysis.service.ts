import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SentimentResult {
  id: string;
  texto: string;
  sentimiento: 'positive' | 'negative' | 'neutral';
  confianza: {
    positivo: string;
    neutral: string;
    negativo: string;
  };
  puntuaciones: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface SentimentResponse {
  success: boolean;
  message: string;
  data: {
    totalTextos: number;
    resultados: SentimentResult[];
    respuestaCompleta?: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SentimentAnalysisService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  analizarSentimientos(textos: string[]): Observable<SentimentResponse> {
    const body = { textos };
    console.log('🧠 Enviando análisis de sentimientos:', { url: `${this.apiUrl}api/evaluaciones/sentimientos`, textos });
    return this.http.post<SentimentResponse>(`${this.apiUrl}api/evaluaciones/sentimientos`, body);
  }

  obtenerComentariosPorCurso(cursoId: number): Observable<any> {
    console.log('📝 Obteniendo comentarios del curso:', cursoId);
    return this.http.get(`${this.apiUrl}/cursos/${cursoId}/comentarios`);
  }
}