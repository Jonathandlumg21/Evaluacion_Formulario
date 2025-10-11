import { Routes } from '@angular/router';
import { EvaluacionFormComponent } from './components/evaluacion-form.component';
import { EstadisticasComponent } from './components/estadisticas.component';
import { SentimentAnalysisComponent } from './components/sentiment-analysis.component';

export const routes: Routes = [
  { path: '', component: EvaluacionFormComponent },
  { path: 'estadisticas', component: EstadisticasComponent },
  { path: 'analisis-sentimientos', component: SentimentAnalysisComponent },
  { path: '**', redirectTo: '' }
];
