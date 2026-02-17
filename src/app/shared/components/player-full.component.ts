import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../core/services/player.service';
import { LibraryService } from '../../core/services/library.service';
import { DurationPipe } from '../pipes/duration.pipe';

@Component({
  selector: 'app-player-full',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DurationPipe],
  template: `
    @if (player.state(); as s) {
      <div class="pf" role="dialog" aria-label="Full screen player">
        <div class="pf__header">
          <button class="pf__collapse" (click)="close.emit()" aria-label="Collapse player">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <span class="pf__chapter-label">Chapter {{ s.chapterIndex + 1 }} of {{ s.totalChapters }}</span>
          <button class="pf__action" (click)="showChapters.emit()" aria-label="Chapter list">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>

        <div class="pf__cover-wrap">
          @if (s.coverArtUrl) {
            <img class="pf__cover" [src]="s.coverArtUrl" [alt]="s.bookTitle + ' cover'" />
          } @else {
            <div class="pf__cover-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
              </svg>
            </div>
          }
        </div>

        <div class="pf__info">
          <a class="pf__title" [routerLink]="['/audiobook', s.bookId]" (click)="close.emit()">{{ s.bookTitle }}</a>
          <p class="pf__author">{{ s.authorName }}</p>
          <p class="pf__chapter-title">{{ s.chapterTitle }}</p>
        </div>

        <div class="pf__seek">
          <span class="pf__time">{{ s.currentTimeSecs | duration:'short' }}</span>
          <input
            class="pf__slider"
            type="range"
            min="0"
            max="1000"
            [value]="player.progress() * 1000"
            (input)="onSeek($event)"
            aria-label="Seek"
          />
          <span class="pf__time">{{ s.durationSecs | duration:'short' }}</span>
        </div>

        <div class="pf__controls">
          <button class="pf__ctrl-btn" (click)="player.skipBack(15)" aria-label="Skip back 15 seconds">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            <span class="pf__skip-label">15</span>
          </button>
          <button class="pf__ctrl-btn" (click)="player.previousChapter()" aria-label="Previous chapter" [disabled]="s.chapterIndex === 0 && s.currentTimeSecs < 3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="pf__play-btn" (click)="player.togglePlayPause()" [attr.aria-label]="s.playing ? 'Pause' : 'Play'">
            @if (s.playing) {
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            } @else {
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
            }
          </button>
          <button class="pf__ctrl-btn" (click)="player.nextChapter()" aria-label="Next chapter" [disabled]="s.chapterIndex >= s.totalChapters - 1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-3.5 6L4 6v12z"/></svg>
          </button>
          <button class="pf__ctrl-btn" (click)="player.skipForward(30)" aria-label="Skip forward 30 seconds">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            <span class="pf__skip-label">30</span>
          </button>
        </div>

        <div class="pf__secondary">
          <button class="pf__sec-btn" (click)="showSpeed.emit()" aria-label="Playback speed">{{ s.speed }}x</button>
          <button class="pf__sec-btn" (click)="showSleepTimer.emit()" aria-label="Sleep timer">
            @if (player.sleepTimer().active) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <button class="pf__sec-btn" (click)="toggleBookmark(s.bookId)" [attr.aria-label]="library.isBookmarked(s.bookId) ? 'Remove bookmark' : 'Add bookmark'">
            @if (library.isBookmarked(s.bookId)) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            }
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .pf {
      position: fixed;
      inset: 0;
      z-index: 100;
      background-color: var(--bg-deep);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-lg);
      overflow-y: auto;
    }
    .pf__header {
      width: 100%;
      max-width: 480px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-xl);
    }
    .pf__collapse, .pf__action {
      background: none;
      border: none;
      color: var(--text-secondary);
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      border-radius: var(--radius);
    }
    .pf__collapse:hover, .pf__action:hover { color: var(--text-primary); }
    .pf__chapter-label {
      font-size: 0.85rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .pf__cover-wrap {
      width: 100%;
      max-width: 320px;
      margin-bottom: var(--space-xl);
    }
    .pf__cover {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-cover);
    }
    .pf__cover-placeholder {
      width: 100%;
      aspect-ratio: 1;
      background: var(--bg-surface);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
    }
    .pf__info {
      text-align: center;
      max-width: 480px;
      width: 100%;
      margin-bottom: var(--space-lg);
    }
    .pf__title {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-primary);
      text-decoration: none;
      display: block;
      margin-bottom: 4px;
    }
    .pf__title:hover { color: var(--accent-primary); }
    .pf__author {
      font-size: 0.95rem;
      color: var(--accent-primary);
      margin: 0 0 4px;
    }
    .pf__chapter-title {
      font-size: 0.85rem;
      color: var(--text-tertiary);
      margin: 0;
    }
    .pf__seek {
      width: 100%;
      max-width: 480px;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-lg);
    }
    .pf__time {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      min-width: 42px;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }
    .pf__slider {
      flex: 1;
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      background: var(--progress-track);
      border-radius: 2px;
      outline: none;
      cursor: pointer;
    }
    .pf__slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      background: var(--accent-primary);
      border-radius: 50%;
      cursor: pointer;
    }
    .pf__controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
    }
    .pf__ctrl-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      border-radius: 50%;
      position: relative;
    }
    .pf__ctrl-btn:hover { color: var(--text-primary); }
    .pf__ctrl-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .pf__skip-label {
      position: absolute;
      font-size: 0.55rem;
      font-weight: 700;
      color: inherit;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .pf__play-btn {
      background-color: var(--accent-primary);
      border: none;
      color: var(--bg-deep);
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: transform 0.15s;
    }
    .pf__play-btn:hover { transform: scale(1.05); }
    .pf__play-btn:active { transform: scale(0.95); }
    .pf__secondary {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
    }
    .pf__sec-btn {
      background: none;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      min-height: 40px;
      min-width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .pf__sec-btn:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
    @media (max-width: 480px) {
      .pf { padding: var(--space-md); }
      .pf__cover-wrap { max-width: 240px; }
      .pf__title { font-size: 1.2rem; }
      .pf__controls { gap: var(--space-md); }
      .pf__play-btn { width: 56px; height: 56px; }
    }
  `],
})
export class PlayerFullComponent {
  protected readonly player = inject(PlayerService);
  protected readonly library = inject(LibraryService);

  readonly close = output();
  readonly showChapters = output();
  readonly showSpeed = output();
  readonly showSleepTimer = output();

  onSeek(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.player.seek(Number(input.value) / 1000);
  }

  toggleBookmark(bookId: string): void {
    if (this.library.isBookmarked(bookId)) {
      this.library.removeBookmark(bookId);
    } else {
      this.library.addBookmark(bookId);
    }
  }
}
