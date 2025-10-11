import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  imports: [NgFor],
  standalone: true,
  selector: 'app-star-rating',
  template: `
    <div class="futuristic-star-rating">
      <span
        *ngFor="let star of stars; let i = index"
        (click)="rate(i + 1)"
        (mouseenter)="hover(i + 1)"
        (mouseleave)="hover(0)"
        [class.filled]="star <= (hoverRating || rating)"
        [class.hover]="star <= hoverRating && hoverRating > 0"
        class="futuristic-star"
      >
        <i class="bi bi-star-fill"></i>
        <div class="star-glow"></div>
      </span>
    </div>
  `,
  styles: [`
    .futuristic-star-rating {
      display: inline-flex;
      gap: 0.3rem;
      align-items: center;
    }

    .futuristic-star {
      cursor: pointer;
      font-size: 1.8rem;
      position: relative;
      transition: all 0.3s ease;
      color: rgba(255, 255, 255, 0.2);
      filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1));
    }

    .futuristic-star:hover {
      transform: scale(1.2);
    }

    .futuristic-star.filled {
      color: #ffd700;
      filter: drop-shadow(0 0 8px #ffd700);
      animation: starGlow 0.3s ease-out;
    }

    .futuristic-star.hover {
      color: #ffed4e;
      filter: drop-shadow(0 0 6px #ffed4e);
      transform: scale(1.1);
    }

    .star-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .futuristic-star.filled .star-glow {
      opacity: 1;
      animation: pulse 2s ease-in-out infinite;
    }

    .futuristic-star.hover .star-glow {
      opacity: 0.7;
    }

    @keyframes starGlow {
      0% {
        transform: scale(1);
        filter: drop-shadow(0 0 2px #ffd700);
      }
      50% {
        transform: scale(1.3);
        filter: drop-shadow(0 0 15px #ffd700);
      }
      100% {
        transform: scale(1);
        filter: drop-shadow(0 0 8px #ffd700);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .futuristic-star {
        font-size: 1.5rem;
      }
    }
  `]
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Output() ratingChange = new EventEmitter<number>();
  
  stars: number[] = [1, 2, 3, 4, 5];
  hoverRating: number = 0;

  rate(rating: number): void {
    this.rating = rating;
    this.ratingChange.emit(rating);
  }

  hover(rating: number): void {
    this.hoverRating = rating;
  }
}