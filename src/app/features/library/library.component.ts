import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../core/services/library.service';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-library',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DurationPipe],
  template: `
    <div class="library container">
      <h1>My Library</h1>

      <div class="library__tabs" role="tablist">
        <button class="library__tab" [class.active]="activeTab() === 'bookmarks'" (click)="activeTab.set('bookmarks')" role="tab">
          Bookmarks ({{ library.bookmarks().length }})
        </button>
        <button class="library__tab" [class.active]="activeTab() === 'history'" (click)="activeTab.set('history')" role="tab">
          History ({{ library.history().length }})
        </button>
        <button class="library__tab" [class.active]="activeTab() === 'favorites'" (click)="activeTab.set('favorites')" role="tab">
          Favorites ({{ library.favorites().length }})
        </button>
      </div>

      @switch (activeTab()) {
        @case ('bookmarks') {
          @if (library.bookmarks().length === 0) {
            <div class="library__empty">
              <p>No bookmarks yet. Browse audiobooks and bookmark your favorites!</p>
              <a routerLink="/browse" class="btn-primary">Browse Audiobooks</a>
            </div>
          } @else {
            <div class="library__grid" role="list">
              @for (bm of library.bookmarks(); track bm.bookId) {
                <a class="library__card" [routerLink]="['/audiobook', bm.bookId]" role="listitem">
                  <div class="library__card-cover">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div class="library__card-info">
                    <span class="library__card-title">Audiobook {{ bm.bookId }}</span>
                    <span class="library__card-meta">Bookmarked {{ formatDate(bm.addedAt) }}</span>
                  </div>
                </a>
              }
            </div>
          }
        }
        @case ('history') {
          @if (library.history().length === 0) {
            <div class="library__empty">
              <p>No listening history yet. Start playing an audiobook!</p>
              <a routerLink="/browse" class="btn-primary">Browse Audiobooks</a>
            </div>
          } @else {
            <div class="library__list" role="list">
              @for (h of sortedHistory(); track h.bookId) {
                <a class="library__history-item" [routerLink]="['/audiobook', h.bookId]" role="listitem">
                  <div class="library__history-icon">
                    @if (h.completed) {
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    } @else {
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                    }
                  </div>
                  <div class="library__history-info">
                    <span class="library__history-title">Audiobook {{ h.bookId }}</span>
                    <span class="library__history-meta">
                      {{ h.totalListenedSecs | duration }} listened
                      @if (h.completed) { &middot; Completed } @else { &middot; In progress }
                    </span>
                  </div>
                  <span class="library__history-date">{{ formatDate(h.lastPlayedAt) }}</span>
                </a>
              }
            </div>
          }
        }
        @case ('favorites') {
          @if (library.favorites().length === 0) {
            <div class="library__empty">
              <p>No favorites yet. Heart the audiobooks you love!</p>
              <a routerLink="/browse" class="btn-primary">Browse Audiobooks</a>
            </div>
          } @else {
            <div class="library__grid" role="list">
              @for (fav of library.favorites(); track fav) {
                <a class="library__card" [routerLink]="['/audiobook', fav]" role="listitem">
                  <div class="library__card-cover library__card-cover--fav">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#e53e3e"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <div class="library__card-info">
                    <span class="library__card-title">Audiobook {{ fav }}</span>
                  </div>
                </a>
              }
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .library { padding: var(--space-2xl) 0; }
    .library__tabs {
      display: flex;
      gap: 2px;
      margin-bottom: var(--space-xl);
      border-bottom: 2px solid var(--border);
    }
    .library__tab {
      background: none;
      border: none;
      padding: var(--space-md) var(--space-lg);
      color: var(--text-tertiary);
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: color 0.2s, border-color 0.2s;
      min-height: auto;
    }
    .library__tab:hover { color: var(--text-primary); }
    .library__tab.active {
      color: var(--accent-primary);
      border-bottom-color: var(--accent-primary);
    }
    .library__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
    .library__empty a {
      margin-top: var(--space-lg);
      display: inline-block;
      text-decoration: none;
    }
    .library__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-md);
    }
    .library__card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s;
      text-align: center;
    }
    .library__card:hover {
      border-color: var(--accent-primary);
      color: inherit;
    }
    .library__card-cover {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
      background: var(--accent-dim);
      color: var(--accent-primary);
    }
    .library__card-cover--fav { background: rgba(229, 62, 62, 0.1); }
    .library__card-title {
      font-weight: 600;
      font-size: 0.9rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .library__card-meta {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }
    .library__list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .library__history-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s;
    }
    .library__history-item:hover {
      border-color: var(--accent-primary);
      color: inherit;
    }
    .library__history-icon {
      color: var(--accent-primary);
      flex-shrink: 0;
    }
    .library__history-info { flex: 1; min-width: 0; }
    .library__history-title {
      display: block;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .library__history-meta {
      display: block;
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    .library__history-date {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      flex-shrink: 0;
    }
    @media (max-width: 480px) {
      .library__tabs { overflow-x: auto; }
      .library__tab { white-space: nowrap; padding: var(--space-sm) var(--space-md); font-size: 0.85rem; }
      .library__grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class LibraryComponent {
  protected readonly library = inject(LibraryService);
  readonly activeTab = signal<'bookmarks' | 'history' | 'favorites'>('bookmarks');

  readonly sortedHistory = computed(() =>
    [...this.library.history()].sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
  );

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
