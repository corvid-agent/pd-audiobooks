import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { LibraryService } from '../../core/services/library.service';
import { PlayerService } from '../../core/services/player.service';
import { NotificationService } from '../../core/services/notification.service';
import { RecentlyPlayedService } from '../../core/services/recently-played.service';
import { OfflineService } from '../../core/services/offline.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import type { AudiobookDetail } from '../../core/models/audiobook.model';

@Component({
  selector: 'app-audiobook',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoadingSpinnerComponent, DurationPipe],
  template: `
    @if (loading()) {
      <app-loading-spinner />
    } @else if (book(); as b) {
      <div class="detail container">
        <div class="detail__hero">
          <div class="detail__cover">
            @if (b.coverArtUrl && !coverFailed()) {
              <img [src]="b.coverArtUrl" [alt]="b.title + ' cover'" (error)="coverFailed.set(true)" />
            } @else {
              <div class="detail__cover-placeholder">
                <span>{{ b.title }}</span>
              </div>
            }
          </div>
          <div class="detail__info">
            <h1 class="detail__title">{{ b.title }}</h1>
            <p class="detail__authors">
              @for (author of b.authors; track author.id; let last = $last) {
                <a [routerLink]="['/author', author.id]">{{ author.firstName }} {{ author.lastName }}</a>@if (!last) {, }
              }
            </p>
            <div class="detail__meta">
              @if (b.language) {
                <span class="detail__meta-item">{{ b.language }}</span>
              }
              @if (b.copyrightYear) {
                <span class="detail__meta-item">{{ b.copyrightYear }}</span>
              }
              <span class="detail__meta-item">{{ b.numSections }} chapters</span>
              <span class="detail__meta-item">{{ b.totalTimeSecs | duration }}</span>
            </div>
            @if (b.genres.length > 0) {
              <div class="detail__genres">
                @for (g of b.genres; track g) {
                  <a class="detail__genre" [routerLink]="['/genre', g]">{{ g }}</a>
                }
              </div>
            }
            <div class="detail__actions">
              @if (hasProgress()) {
                <button class="btn-primary" (click)="resumeBook()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                  Resume
                </button>
              } @else {
                <button class="btn-primary" (click)="playBook()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                  Play
                </button>
              }
              <button class="btn-secondary" (click)="toggleBookmark()">
                @if (library.isBookmarked(b.id)) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  Bookmarked
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  Bookmark
                }
              </button>
              <button class="btn-secondary" (click)="toggleFavorite()">
                @if (library.isFavorite(b.id)) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#e53e3e" stroke="#e53e3e" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                }
              </button>
              @if (b.urlZipFile) {
                <a class="btn-secondary" [href]="b.urlZipFile" target="_blank" rel="noopener" aria-label="Download ZIP">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
              }
              @if (allChaptersDownloaded()) {
                <button class="btn-secondary btn-offline btn-offline--done" (click)="removeAllOffline()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Offline Ready
                </button>
              } @else {
                <button class="btn-secondary btn-offline" (click)="downloadAllOffline()" [disabled]="offlineService.activeDownload() !== null">
                  @if (offlineService.activeDownload(); as dl) {
                    <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    {{ dl.percent }}%
                  } @else {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download for Offline
                  }
                </button>
              }
            </div>
          </div>
        </div>

        @if (b.description) {
          <section class="detail__description">
            <h2>About This Audiobook</h2>
            <p>{{ b.description }}</p>
          </section>
        }

        @if (b.sections.length > 0) {
          <section class="detail__chapters">
            <h2>Chapters ({{ b.sections.length }})</h2>
            <div class="chapter-list" role="list">
              @for (chapter of b.sections; track chapter.id; let i = $index) {
                <div class="chapter-row" role="listitem">
                  <button class="chapter-item" (click)="playChapter(i)" [class.chapter-item--playing]="isChapterPlaying(chapter.id)">
                    <span class="chapter-item__number">{{ chapter.sectionNumber }}</span>
                    <div class="chapter-item__info">
                      <span class="chapter-item__title">{{ chapter.title }}</span>
                      @if (chapter.readers.length > 0) {
                        <span class="chapter-item__reader">Read by {{ chapter.readers[0] }}</span>
                      }
                    </div>
                    @if (offlineService.isChapterDownloaded(chapter.id)) {
                      <span class="chapter-item__offline" title="Available offline">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </span>
                    }
                    <span class="chapter-item__duration">{{ chapter.durationSecs | duration:'short' }}</span>
                    <svg class="chapter-item__play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                  </button>
                  <button
                    class="chapter-dl-btn"
                    [attr.aria-label]="offlineService.isChapterDownloaded(chapter.id) ? 'Remove offline copy of ' + chapter.title : 'Download ' + chapter.title + ' for offline'"
                    (click)="toggleChapterOffline(chapter.id, chapter.listenUrl, b.id, $event)"
                    [disabled]="isChapterDownloading(chapter.id)"
                  >
                    @if (isChapterDownloading(chapter.id)) {
                      <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      <span class="chapter-dl-pct">{{ offlineService.activeDownload()?.percent ?? 0 }}%</span>
                    } @else if (offlineService.isChapterDownloaded(chapter.id)) {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success, #38a169)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    }
                  </button>
                </div>
              }
            </div>
          </section>
        }

        <div class="detail__links">
          @if (b.urlLibrivox) {
            <a [href]="b.urlLibrivox" target="_blank" rel="noopener">View on LibriVox</a>
          }
          @if (b.urlProject) {
            <a [href]="b.urlProject" target="_blank" rel="noopener">Source Text</a>
          }
        </div>
      </div>
    } @else {
      <div class="container" style="padding: var(--space-3xl) 0; text-align: center;">
        <h2>Audiobook not found</h2>
        <p class="text-secondary">The audiobook you're looking for doesn't exist or couldn't be loaded.</p>
        <a routerLink="/browse" class="btn-primary" style="margin-top: var(--space-lg); display: inline-block;">Browse Audiobooks</a>
      </div>
    }
  `,
  styles: [`
    .detail { padding: var(--space-2xl) 0; }
    .detail__hero {
      display: flex;
      gap: var(--space-xl);
      margin-bottom: var(--space-2xl);
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
    }
    .detail__cover {
      flex-shrink: 0;
      width: 240px;
    }
    .detail__cover img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-cover);
    }
    .detail__cover-placeholder {
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(170deg, var(--bg-raised) 0%, var(--bg-surface) 100%);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-lg);
      text-align: center;
      font-family: var(--font-heading);
      color: var(--text-tertiary);
      font-size: 1.1rem;
    }
    .detail__info { flex: 1; min-width: 0; }
    .detail__title {
      font-size: 2rem;
      margin-bottom: var(--space-sm);
    }
    .detail__authors {
      font-size: 1.1rem;
      color: var(--accent-primary);
      margin: 0 0 var(--space-md);
    }
    .detail__authors a {
      color: var(--accent-primary);
      text-decoration: none;
    }
    .detail__authors a:hover { text-decoration: underline; }
    .detail__meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-bottom: var(--space-md);
    }
    .detail__meta-item {
      font-size: 0.85rem;
      color: var(--text-secondary);
      padding: 2px 10px;
      border: 1px solid var(--border);
      border-radius: 12px;
    }
    .detail__genres {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
      margin-bottom: var(--space-lg);
    }
    .detail__genre {
      font-size: 0.8rem;
      padding: 3px 12px;
      border: 1px solid var(--border-bright);
      border-radius: 12px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;
    }
    .detail__genre:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
    .detail__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }
    .detail__actions button,
    .detail__actions a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }
    .detail__description {
      margin-bottom: var(--space-2xl);
    }
    .detail__description p {
      color: var(--text-secondary);
      line-height: 1.8;
    }
    .detail__chapters { margin-bottom: var(--space-2xl); }
    .chapter-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: var(--space-md);
    }
    .chapter-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      width: 100%;
      color: var(--text-primary);
    }
    .chapter-item:hover {
      border-color: var(--accent-primary);
      background: var(--accent-dim);
    }
    .chapter-item--playing {
      border-color: var(--accent-primary);
      background: var(--accent-dim);
    }
    .chapter-item__number {
      font-family: var(--font-heading);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-tertiary);
      min-width: 28px;
      text-align: center;
    }
    .chapter-item__info {
      flex: 1;
      min-width: 0;
    }
    .chapter-item__title {
      display: block;
      font-weight: 600;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chapter-item__reader {
      display: block;
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    .chapter-item__duration {
      font-size: 0.85rem;
      color: var(--text-tertiary);
      flex-shrink: 0;
    }
    .chapter-item__offline {
      color: var(--color-success, #38a169);
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    .chapter-item__play {
      color: var(--accent-primary);
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .chapter-item:hover .chapter-item__play,
    .chapter-item--playing .chapter-item__play { opacity: 1; }
    .chapter-row {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .chapter-dl-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      width: 44px;
      min-height: 44px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      cursor: pointer;
      color: var(--text-tertiary);
      transition: all 0.2s;
      padding: 0;
    }
    .chapter-dl-btn:hover:not(:disabled) {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
    .chapter-dl-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .chapter-dl-pct {
      font-size: 0.6rem;
      font-weight: 700;
    }
    .btn-offline {
      position: relative;
    }
    .btn-offline--done {
      color: var(--color-success, #38a169);
      border-color: var(--color-success, #38a169);
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
    .detail__links {
      display: flex;
      gap: var(--space-lg);
      font-size: 0.9rem;
    }
    @media (max-width: 768px) {
      .detail__hero {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .detail__cover { width: 200px; }
      .detail__meta { justify-content: center; }
      .detail__genres { justify-content: center; }
      .detail__actions { justify-content: center; }
      .detail__links { justify-content: center; }
    }
    @media (max-width: 480px) {
      .detail__cover { width: 160px; }
      .detail__title { font-size: 1.5rem; }
      .detail__actions { flex-direction: column; }
      .detail__actions button,
      .detail__actions a { width: 100%; justify-content: center; }
    }
  `],
})
export class AudiobookComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  protected readonly library = inject(LibraryService);
  private readonly player = inject(PlayerService);
  private readonly notifications = inject(NotificationService);
  private readonly recentlyPlayed = inject(RecentlyPlayedService);
  protected readonly offlineService = inject(OfflineService);

  readonly book = signal<AudiobookDetail | null>(null);
  readonly loading = signal(true);
  readonly coverFailed = signal(false);

  readonly hasProgress = signal(false);

  readonly allChaptersDownloaded = computed(() => {
    const b = this.book();
    if (!b || b.sections.length === 0) return false;
    // Touch the signal so we recompute when downloads change
    const ids = this.offlineService.downloadedChapterIds();
    return b.sections.every((ch) => ids.has(ch.id));
  });

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadBook(id);
      }
    });
  }

  private async loadBook(id: string): Promise<void> {
    this.loading.set(true);
    this.coverFailed.set(false);
    const detail = await this.catalog.getDetailAsync(id);
    this.book.set(detail);
    this.loading.set(false);

    if (detail) {
      this.recentlyPlayed.add(detail.id);
      const historyItem = this.library.getHistoryItem(detail.id);
      this.hasProgress.set(!!historyItem && historyItem.lastPositionSecs > 0 && !historyItem.completed);
    }
  }

  playBook(): void {
    const b = this.book();
    if (b) this.player.play(b, 0);
  }

  resumeBook(): void {
    const b = this.book();
    if (b) this.player.resume(b);
  }

  playChapter(index: number): void {
    const b = this.book();
    if (b) this.player.play(b, index);
  }

  toggleBookmark(): void {
    const b = this.book();
    if (!b) return;
    if (this.library.isBookmarked(b.id)) {
      this.library.removeBookmark(b.id);
      this.notifications.show('Removed from bookmarks', 'info');
    } else {
      this.library.addBookmark(b.id);
      this.notifications.show(`Bookmarked "${b.title}"`, 'success');
    }
  }

  toggleFavorite(): void {
    const b = this.book();
    if (!b) return;
    this.library.toggleFavorite(b.id);
    if (this.library.isFavorite(b.id)) {
      this.notifications.show(`Added "${b.title}" to favorites`, 'success');
    } else {
      this.notifications.show('Removed from favorites', 'info');
    }
  }

  isChapterPlaying(chapterId: string): boolean {
    const s = this.player.state();
    return !!s && s.chapterId === chapterId && s.playing;
  }

  isChapterDownloading(chapterId: string): boolean {
    const dl = this.offlineService.activeDownload();
    return !!dl && dl.chapterId === chapterId;
  }

  async toggleChapterOffline(chapterId: string, url: string, bookId: string, event: Event): Promise<void> {
    event.stopPropagation();
    if (this.offlineService.isChapterDownloaded(chapterId)) {
      await this.offlineService.removeChapter(chapterId);
      this.notifications.show('Removed offline copy', 'info');
    } else {
      const ok = await this.offlineService.downloadChapter(bookId, chapterId, url);
      if (ok) {
        this.notifications.show('Chapter downloaded for offline', 'success');
      } else if (!this.offlineService.activeDownload()) {
        this.notifications.show('Download failed. Try again.', 'error');
      }
    }
  }

  async downloadAllOffline(): Promise<void> {
    const b = this.book();
    if (!b) return;
    this.notifications.show('Downloading all chapters...', 'info', 2000);
    const count = await this.offlineService.downloadAllChapters(b.id, b.sections);
    this.notifications.show(`${count} of ${b.sections.length} chapters available offline`, 'success');
  }

  async removeAllOffline(): Promise<void> {
    const b = this.book();
    if (!b) return;
    await this.offlineService.removeAllForBook(b.id);
    this.notifications.show('Removed all offline copies', 'info');
  }
}
