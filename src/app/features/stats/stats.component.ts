import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { LibraryService } from '../../core/services/library.service';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DurationPipe],
  template: `
    <div class="stats container">
      <h1>Listening Stats</h1>

      <div class="stats__cards">
        <div class="stats__card">
          <span class="stats__value">{{ library.totalListenedSecs() | duration }}</span>
          <span class="stats__label">Total Listened</span>
        </div>
        <div class="stats__card">
          <span class="stats__value">{{ library.completedCount() }}</span>
          <span class="stats__label">Books Completed</span>
        </div>
        <div class="stats__card">
          <span class="stats__value">{{ library.inProgressCount() }}</span>
          <span class="stats__label">In Progress</span>
        </div>
        <div class="stats__card">
          <span class="stats__value">{{ library.bookmarks().length }}</span>
          <span class="stats__label">Bookmarked</span>
        </div>
        <div class="stats__card">
          <span class="stats__value">{{ library.favorites().length }}</span>
          <span class="stats__label">Favorites</span>
        </div>
        <div class="stats__card">
          <span class="stats__value">{{ library.history().length }}</span>
          <span class="stats__label">Books Started</span>
        </div>
      </div>

      @if (library.history().length > 0) {
        <section class="stats__section">
          <h2>Listening Activity</h2>
          <div class="stats__chart">
            @for (item of topListened(); track item.bookId) {
              <div class="stats__bar-row">
                <span class="stats__bar-label">Book {{ item.bookId }}</span>
                <div class="stats__bar-track">
                  <div class="stats__bar-fill" [style.width.%]="item.pct"></div>
                </div>
                <span class="stats__bar-value">{{ item.totalListenedSecs | duration }}</span>
              </div>
            }
          </div>
        </section>
      }

      @if (library.history().length === 0) {
        <div class="stats__empty">
          <p>Start listening to audiobooks to see your stats here!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats { padding: var(--space-2xl) 0; }
    .stats__cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }
    .stats__card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .stats__value {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent-primary);
    }
    .stats__label {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .stats__section {
      margin-bottom: var(--space-2xl);
    }
    .stats__chart {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .stats__bar-row {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }
    .stats__bar-label {
      font-size: 0.85rem;
      width: 100px;
      flex-shrink: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .stats__bar-track {
      flex: 1;
      height: 24px;
      background: var(--bg-raised);
      border-radius: 12px;
      overflow: hidden;
    }
    .stats__bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-dim), var(--accent-primary));
      border-radius: 12px;
      transition: width 0.6s ease;
      min-width: 4px;
    }
    .stats__bar-value {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      width: 60px;
      flex-shrink: 0;
      text-align: right;
    }
    .stats__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
    @media (max-width: 480px) {
      .stats__cards { grid-template-columns: repeat(2, 1fr); }
      .stats__value { font-size: 1.5rem; }
      .stats__bar-label { width: 70px; font-size: 0.75rem; }
    }
  `],
})
export class StatsComponent {
  protected readonly library = inject(LibraryService);

  readonly topListened = computed(() => {
    const history = this.library.history();
    if (history.length === 0) return [];
    const sorted = [...history].sort((a, b) => b.totalListenedSecs - a.totalListenedSecs).slice(0, 10);
    const maxSecs = sorted[0]?.totalListenedSecs ?? 1;
    return sorted.map((h) => ({
      ...h,
      pct: Math.round((h.totalListenedSecs / maxSecs) * 100),
    }));
  });
}
