import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-grid" aria-hidden="true" role="presentation">
      @for (item of items; track $index) {
        <div class="skeleton-card">
          <div class="skeleton-cover skeleton-shimmer"></div>
          <div class="skeleton-body">
            <div class="skeleton-title skeleton-shimmer"></div>
            <div class="skeleton-author skeleton-shimmer"></div>
            <div class="skeleton-duration skeleton-shimmer"></div>
          </div>
        </div>
      }
    </div>
    <span class="sr-only" role="status">Loading audiobooks...</span>
  `,
  styles: [`
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-lg);
    }
    .skeleton-card {
      display: flex;
      flex-direction: column;
    }
    .skeleton-cover {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: var(--radius-lg);
      background-color: var(--bg-raised);
    }
    .skeleton-body {
      padding: var(--space-sm) 0 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .skeleton-title {
      height: 14px;
      width: 85%;
      border-radius: var(--radius-sm);
      background-color: var(--bg-raised);
    }
    .skeleton-author {
      height: 11px;
      width: 60%;
      border-radius: var(--radius-sm);
      background-color: var(--bg-raised);
    }
    .skeleton-duration {
      height: 10px;
      width: 40%;
      border-radius: var(--radius-sm);
      background-color: var(--bg-raised);
    }
    .skeleton-shimmer {
      background-image: linear-gradient(
        90deg,
        var(--bg-raised) 0%,
        var(--bg-hover) 40%,
        var(--bg-raised) 80%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    @media (max-width: 768px) {
      .skeleton-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--space-md);
      }
    }
    @media (max-width: 480px) {
      .skeleton-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: var(--space-sm);
      }
    }
  `],
})
export class SkeletonGridComponent {
  @Input() count = 12;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
