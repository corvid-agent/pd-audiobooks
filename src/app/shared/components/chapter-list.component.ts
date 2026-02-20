import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { PlayerService } from '../../core/services/player.service';
import { OfflineService } from '../../core/services/offline.service';
import { DurationPipe } from '../pipes/duration.pipe';
import type { Chapter } from '../../core/models/audiobook.model';

@Component({
  selector: 'app-chapter-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DurationPipe],
  template: `
    <div class="cl-overlay" (click)="close.emit()">
      <aside class="cl" (click)="$event.stopPropagation()" role="dialog" aria-label="Chapter list">
        <div class="cl__header">
          <h2 class="cl__title">Chapters</h2>
          <button class="cl__close" (click)="close.emit()" aria-label="Close chapter list">&times;</button>
        </div>
        <div class="cl__list" role="list">
          @for (ch of chapters(); track ch.id; let i = $index) {
            <button
              class="cl__item"
              [class.cl__item--active]="i === currentIndex()"
              role="listitem"
              (click)="onSelect(i)"
            >
              <span class="cl__num">{{ ch.sectionNumber }}</span>
              <div class="cl__info">
                <span class="cl__ch-title">{{ ch.title }}</span>
                @if (ch.readers.length > 0) {
                  <span class="cl__reader">{{ ch.readers[0] }}</span>
                }
              </div>
              @if (offline.isChapterDownloaded(ch.id)) {
                <span class="cl__offline" title="Available offline">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </span>
              }
              <span class="cl__dur">{{ ch.durationSecs | duration:'short' }}</span>
              @if (i === currentIndex()) {
                <span class="cl__playing" aria-label="Currently playing">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                </span>
              }
            </button>
          }
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .cl-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 110;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .cl {
      background-color: var(--bg-surface);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      width: 100%;
      max-width: 560px;
      max-height: 70vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lg);
    }
    .cl__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-lg) var(--space-xl);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .cl__title { font-size: 1.1rem; margin: 0; }
    .cl__close {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 4px 8px;
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .cl__close:hover { color: var(--text-primary); }
    .cl__list {
      overflow-y: auto;
      padding: var(--space-sm) 0;
    }
    .cl__item {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-xl);
      width: 100%;
      background: none;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      text-align: left;
      transition: background-color 0.15s;
      min-height: 48px;
    }
    .cl__item:hover { background-color: var(--bg-hover); }
    .cl__item--active {
      background-color: var(--accent-dim);
    }
    .cl__num {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      min-width: 24px;
      text-align: center;
      flex-shrink: 0;
    }
    .cl__info { flex: 1; min-width: 0; }
    .cl__ch-title {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cl__reader {
      display: block;
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }
    .cl__dur {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      flex-shrink: 0;
    }
    .cl__offline {
      color: var(--color-success, #38a169);
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    .cl__playing {
      color: var(--accent-primary);
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
  `],
})
export class ChapterListComponent {
  private readonly player = inject(PlayerService);
  protected readonly offline = inject(OfflineService);

  readonly chapters = input.required<Chapter[]>();
  readonly currentIndex = input<number>(0);
  readonly close = output();

  onSelect(index: number): void {
    this.player.playChapter(index);
  }
}
