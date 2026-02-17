import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner-wrapper" [class.spinner-inline]="inline" role="status">
      <div class="spinner" aria-hidden="true">
        <div class="spinner-ring"></div>
      </div>
      <span class="spinner-text" [class.sr-only]="!showLabel">{{ label }}</span>
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-md);
      padding: var(--space-2xl) 0;
    }
    .spinner-wrapper.spinner-inline {
      padding: var(--space-md) 0;
      flex-direction: row;
      gap: var(--space-sm);
    }
    .spinner {
      width: 40px;
      height: 40px;
      position: relative;
    }
    .spinner-inline .spinner {
      width: 24px;
      height: 24px;
    }
    .spinner-ring {
      width: 100%;
      height: 100%;
      border: 3px solid var(--border);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-inline .spinner-ring {
      border-width: 2px;
    }
    .spinner-text {
      color: var(--text-tertiary);
      font-size: 0.85rem;
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
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input() label = 'Loading...';
  @Input() showLabel = false;
  @Input() inline = false;
}
