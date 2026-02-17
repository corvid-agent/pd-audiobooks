import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-sleep-timer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="st-overlay" (click)="close.emit()">
      <div class="st" (click)="$event.stopPropagation()" role="dialog" aria-label="Sleep timer">
        <h3 class="st__title">Sleep Timer</h3>

        @if (player.sleepTimer().active) {
          <div class="st__active">
            @if (player.sleepTimer().endChapter) {
              <p class="st__status">Stopping at end of chapter</p>
            } @else {
              <p class="st__status">{{ formatRemaining(player.sleepTimer().remainingSecs) }} remaining</p>
            }
            <button class="btn-secondary st__cancel" (click)="cancel()">Cancel Timer</button>
          </div>
        } @else {
          <div class="st__options" role="list">
            @for (option of presets; track option.minutes) {
              <button class="st__option" (click)="setTimer(option.minutes)" role="listitem">{{ option.label }}</button>
            }
            <button class="st__option" (click)="setEndOfChapter()" role="listitem">End of chapter</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .st-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 120;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-lg);
    }
    .st {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      width: 100%;
      max-width: 320px;
      box-shadow: var(--shadow-lg);
    }
    .st__title {
      font-size: 1.1rem;
      margin: 0 0 var(--space-lg);
      text-align: center;
    }
    .st__options {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .st__option {
      background: none;
      border: 1px solid var(--border);
      color: var(--text-primary);
      padding: var(--space-md);
      border-radius: var(--radius);
      cursor: pointer;
      font-size: 0.95rem;
      text-align: center;
      transition: border-color 0.2s, background-color 0.2s;
      min-height: 48px;
    }
    .st__option:hover {
      border-color: var(--accent-primary);
      background-color: var(--accent-dim);
      color: var(--accent-primary);
    }
    .st__active {
      text-align: center;
    }
    .st__status {
      font-size: 1.1rem;
      color: var(--accent-primary);
      font-weight: 600;
      margin: 0 0 var(--space-lg);
    }
    .st__cancel { width: 100%; }
  `],
})
export class SleepTimerComponent {
  protected readonly player = inject(PlayerService);
  readonly close = output();

  readonly presets = [
    { minutes: 5, label: '5 minutes' },
    { minutes: 10, label: '10 minutes' },
    { minutes: 15, label: '15 minutes' },
    { minutes: 30, label: '30 minutes' },
    { minutes: 45, label: '45 minutes' },
    { minutes: 60, label: '60 minutes' },
  ];

  setTimer(minutes: number): void {
    this.player.startSleepTimer(minutes);
    this.close.emit();
  }

  setEndOfChapter(): void {
    this.player.startEndOfChapterTimer();
    this.close.emit();
  }

  cancel(): void {
    this.player.cancelSleepTimer();
  }

  formatRemaining(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
