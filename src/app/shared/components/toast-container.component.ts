import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NotificationService, Toast } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" aria-live="polite" aria-relevant="additions">
      @for (toast of notifications.toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast-success]="toast.type === 'success'"
          [class.toast-error]="toast.type === 'error'"
          [class.toast-info]="toast.type === 'info'"
          role="status"
        >
          <span class="toast-icon" aria-hidden="true">
            @switch (toast.type) {
              @case ('success') { &#10003; }
              @case ('error') { &#10007; }
              @case ('info') { &#8505; }
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-dismiss"
            (click)="notifications.dismiss(toast.id)"
            aria-label="Dismiss notification"
          >&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 72px;
      right: var(--space-lg);
      z-index: 150;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      max-width: 380px;
      width: 100%;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      background-color: var(--bg-raised);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      color: var(--text-primary);
      font-size: 0.9rem;
      pointer-events: auto;
      animation: toast-slide-in 0.25s ease-out;
    }
    .toast-success {
      border-left: 3px solid var(--color-success);
    }
    .toast-error {
      border-left: 3px solid var(--color-error);
    }
    .toast-info {
      border-left: 3px solid var(--accent-primary);
    }
    .toast-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      border-radius: 50%;
    }
    .toast-success .toast-icon {
      color: var(--color-success);
      background-color: rgba(76, 175, 80, 0.12);
    }
    .toast-error .toast-icon {
      color: var(--color-error);
      background-color: rgba(231, 76, 60, 0.12);
    }
    .toast-info .toast-icon {
      color: var(--accent-primary);
      background-color: var(--accent-dim);
    }
    .toast-message {
      flex: 1;
      line-height: 1.4;
    }
    .toast-dismiss {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0;
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      line-height: 1;
      flex-shrink: 0;
    }
    .toast-dismiss:hover {
      color: var(--text-primary);
      background-color: var(--bg-hover);
    }
    @keyframes toast-slide-in {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @media (max-width: 480px) {
      .toast-container {
        top: 64px;
        right: var(--space-sm);
        left: var(--space-sm);
        max-width: none;
      }
    }
  `],
})
export class ToastContainerComponent {
  protected readonly notifications = inject(NotificationService);
}
