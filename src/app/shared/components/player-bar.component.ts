import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-player-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (player.state(); as s) {
      <div class="player-bar" role="complementary" aria-label="Mini player">
        <div class="progress-track" aria-hidden="true">
          <div class="progress-fill" [style.width.%]="player.progress() * 100"></div>
        </div>

        <div class="player-bar-inner">
          <button
            class="player-bar-info"
            (click)="navigateToBook(s.bookId)"
            aria-label="Go to {{ s.bookTitle }}"
          >
            @if (s.coverArtUrl) {
              <img
                class="player-bar-cover"
                [src]="s.coverArtUrl"
                [alt]="s.bookTitle + ' cover'"
                width="40"
                height="40"
                loading="lazy"
              />
            } @else {
              <div class="player-bar-cover-placeholder" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                </svg>
              </div>
            }
            <div class="player-bar-text">
              <span class="player-bar-title">{{ s.bookTitle }}</span>
              <span class="player-bar-author">{{ s.authorName }}</span>
            </div>
          </button>

          <div class="player-bar-controls">
            <button
              class="player-bar-play"
              (click)="player.togglePlayPause()"
              [attr.aria-label]="s.playing ? 'Pause' : 'Play'"
            >
              @if (s.playing) {
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              } @else {
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              }
            </button>

            <button
              class="player-bar-close"
              (click)="player.stop()"
              aria-label="Close player"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .player-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 90;
      background-color: var(--player-bg);
      border-top: 1px solid var(--border);
      box-shadow: var(--shadow-md);
    }
    @media (max-width: 768px) {
      .player-bar {
        bottom: 56px;
      }
    }
    .progress-track {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background-color: var(--progress-track);
    }
    .progress-fill {
      height: 100%;
      background-color: var(--accent-primary);
      transition: width 0.3s linear;
      border-radius: 0 1px 1px 0;
    }
    .player-bar-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-sm) var(--space-lg);
      gap: var(--space-md);
    }
    .player-bar-info {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      flex: 1;
      min-width: 0;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: inherit;
      text-align: left;
      min-height: 44px;
    }
    .player-bar-info:hover .player-bar-title {
      color: var(--accent-primary);
    }
    .player-bar-cover {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      flex-shrink: 0;
      background-color: var(--bg-raised);
    }
    .player-bar-cover-placeholder {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      background-color: var(--bg-raised);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      flex-shrink: 0;
    }
    .player-bar-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .player-bar-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s;
    }
    .player-bar-author {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .player-bar-controls {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      flex-shrink: 0;
    }
    .player-bar-play {
      background: none;
      border: none;
      color: var(--accent-primary);
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      cursor: pointer;
      padding: 0;
      transition: background-color 0.2s, color 0.2s;
    }
    .player-bar-play:hover {
      background-color: var(--accent-dim);
      color: var(--accent-bright);
    }
    .player-bar-close {
      background: none;
      border: none;
      color: var(--text-tertiary);
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
      cursor: pointer;
      padding: 0;
      transition: color 0.2s, background-color 0.2s;
    }
    .player-bar-close:hover {
      color: var(--text-primary);
      background-color: var(--bg-hover);
    }
    @media (max-width: 768px) {
      .player-bar-inner {
        padding: var(--space-xs) var(--space-md);
      }
    }
  `],
})
export class PlayerBarComponent {
  protected readonly player = inject(PlayerService);
  private readonly router = inject(Router);

  navigateToBook(bookId: string): void {
    this.router.navigate(['/audiobook', bookId]);
  }
}
