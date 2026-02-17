import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { PlayerService } from '../../core/services/player.service';
import type { PlaybackSpeed } from '../../core/models/player.model';

@Component({
  selector: 'app-playback-speed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ps-overlay" (click)="close.emit()">
      <div class="ps" (click)="$event.stopPropagation()" role="dialog" aria-label="Playback speed">
        <h3 class="ps__title">Playback Speed</h3>
        <div class="ps__options" role="radiogroup">
          @for (speed of speeds; track speed) {
            <button
              class="ps__option"
              [class.ps__option--active]="player.state()?.speed === speed"
              role="radio"
              [attr.aria-checked]="player.state()?.speed === speed"
              (click)="select(speed)"
            >
              {{ speed }}x
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ps-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 120;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-lg);
    }
    .ps {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      width: 100%;
      max-width: 320px;
      box-shadow: var(--shadow-lg);
    }
    .ps__title {
      font-size: 1.1rem;
      margin: 0 0 var(--space-lg);
      text-align: center;
    }
    .ps__options {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-xs);
    }
    .ps__option {
      background: none;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: var(--space-sm) var(--space-xs);
      border-radius: var(--radius);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      text-align: center;
      transition: all 0.15s;
      min-height: 44px;
    }
    .ps__option:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
    .ps__option--active {
      background-color: var(--accent-primary);
      border-color: var(--accent-primary);
      color: var(--bg-deep);
    }
    .ps__option--active:hover {
      color: var(--bg-deep);
    }
  `],
})
export class PlaybackSpeedComponent {
  protected readonly player = inject(PlayerService);
  readonly close = output();

  readonly speeds: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  select(speed: PlaybackSpeed): void {
    this.player.setSpeed(speed);
    this.close.emit();
  }
}
