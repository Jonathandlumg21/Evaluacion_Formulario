import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface SentimentAnalysisRequest {
  documents: Array<{
    id: string;
    text: string;
    language: string;
  }>;
}

interface LocalSentimentRequest {
  textos: string[];
}

interface SentimentConfidence {
  positivo: string;
  neutral: string;
  negativo: string;
}

interface SentimentResult {
  id: string;
  texto: string;
  sentimiento: 'positive' | 'neutral' | 'negative';
  confianza: SentimentConfidence;
}

interface LocalSentimentResponse {
  success: boolean;
  data: {
    totalTextos: number;
    resultados: SentimentResult[];
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SentimentAnalysisService {
  private endpoint: string;
  private subscriptionKey: string;

  constructor(private http: HttpClient) {
    this.endpoint = environment.azureTextAnalytics.endpoint;
    const subscriptionKey = environment.azureTextAnalytics.subscriptionKey;
    console.log('Inicializando SentimentAnalysisService:', {
      endpoint: this.endpoint,
      hasSubscriptionKey: !!subscriptionKey
    });
    
    if (!subscriptionKey) {
      console.error('Azure Text Analytics subscription key no está definida en el ambiente');
      throw new Error('Azure Text Analytics subscription key is not defined in environment');
    }
    this.subscriptionKey = subscriptionKey;
  }

  analyzeLocalSentiment(texts: string[]): Observable<LocalSentimentResponse> {
    const url = 'https://evaluacion-api.vercel.app/api/evaluaciones/sentimientos';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Limpiamos y preparamos los textos
    const cleanTexts = texts.map(text => text.replace(/\\n/g, ' ').trim());
    const requestBody: LocalSentimentRequest = { textos: cleanTexts };

    console.log('Enviando análisis de sentimientos local:', {
      url,
      textos: cleanTexts
    });

    return this.http.post<LocalSentimentResponse>(url, requestBody, { headers }).pipe(
      tap(response => console.log('Respuesta del análisis de sentimientos local:', response)),
      catchError(error => {
        console.error('Error en el análisis de sentimientos local:', error);
        throw error;
      })
    );
  }

  // Método original de Azure (mantenido por compatibilidad)
  analyzeSentiment(text: string): Observable<any> {
    const url = `${this.endpoint}text/analytics/v3.1/sentiment`;
    const headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': this.subscriptionKey,
      'Content-Type': 'application/json'
    });

    // Limpiamos y preparamos el texto
    const cleanText = text.replace(/\\n/g, ' ').trim();
    
    const documents = [{
      id: "1",
      text: cleanText,
      language: "es"
    }];

    const requestBody: SentimentAnalysisRequest = { documents };

    return this.http.post(url, requestBody, { headers });
  }
}