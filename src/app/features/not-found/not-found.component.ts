import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="not-found container">
      <div class="not-found__icon">404</div>
      <h1>Page Not Found</h1>
      <p class="not-found__text">The page you're looking for doesn't exist or has been moved.</p>
      <div class="not-found__actions">
        <a routerLink="/home" class="btn-primary">Go Home</a>
        <a routerLink="/browse" class="btn-secondary">Browse Audiobooks</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      text-align: center;
      padding: var(--space-3xl) 0;
      min-height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .not-found__icon {
      font-family: var(--font-heading);
      font-size: 5rem;
      font-weight: 900;
      color: var(--accent-primary);
      opacity: 0.3;
      margin-bottom: var(--space-lg);
    }
    .not-found__text {
      color: var(--text-secondary);
      font-size: 1.1rem;
      margin-bottom: var(--space-xl);
    }
    .not-found__actions {
      display: flex;
      gap: var(--space-md);
    }
    .not-found__actions a { text-decoration: none; }
    @media (max-width: 480px) {
      .not-found__icon { font-size: 3.5rem; }
      .not-found__actions { flex-direction: column; }
    }
  `],
})
export class NotFoundComponent {}
