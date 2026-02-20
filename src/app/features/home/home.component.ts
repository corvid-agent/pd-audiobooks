import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { LibraryService } from '../../core/services/library.service';
import { PlayerService } from '../../core/services/player.service';
import { AudiobookGridComponent } from '../../shared/components/audiobook-grid.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AudiobookGridComponent, SkeletonGridComponent, RouterLink, RevealDirective],
  template: `
    <section class="hero">
      <div class="hero__bg"></div>
      <div class="hero__content container">
        <p class="hero__eyebrow">Discover &amp; Listen</p>
        <h1 class="hero__title">Listen to Classic Literature</h1>
        <p class="hero__subtitle">
          Thousands of free public domain audiobooks from LibriVox, read by volunteers worldwide.
          Browse, listen, and build your library.
        </p>
        <div class="hero__actions">
          <a class="btn-primary hero__btn" routerLink="/browse">Browse Audiobooks</a>
          <button class="btn-secondary hero__btn" (click)="surpriseMe()" aria-label="Surprise me with a random audiobook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            Surprise Me
          </button>
        </div>
        @if (library.completedCount() > 0 || library.inProgressCount() > 0) {
          <div class="hero__stats">
            <div class="hero__stat">
              <span class="hero__stat-value">{{ library.completedCount() }}</span>
              <span class="hero__stat-label">Completed</span>
            </div>
            <div class="hero__stat">
              <span class="hero__stat-value">{{ library.inProgressCount() }}</span>
              <span class="hero__stat-label">In Progress</span>
            </div>
            <div class="hero__stat">
              <span class="hero__stat-value">{{ totalListened() }}</span>
              <span class="hero__stat-label">Listened</span>
            </div>
          </div>
        }
      </div>
    </section>

    @if (catalog.error(); as err) {
      <section class="section container">
        <div class="catalog-error" role="alert">
          <p>{{ err }}</p>
          <button (click)="loadData()">Try Again</button>
        </div>
      </section>
    } @else if (catalog.loading()) {
      <section class="section container">
        <h2>Featured Audiobooks</h2>
        <app-skeleton-grid />
      </section>
    } @else {
      @if (catalog.featured().length > 0) {
        <section class="section container" aria-label="Featured audiobooks">
          <div class="section__header">
            <h2>Featured Audiobooks</h2>
            <a class="section__link" routerLink="/browse">View all &rarr;</a>
          </div>
          <app-audiobook-grid [audiobooks]="catalog.featured()" />
        </section>
      }

      @if (catalog.recentlyAdded().length > 0) {
        <section appReveal class="section container" aria-label="Recently added">
          <div class="section__header">
            <h2>Recently Added</h2>
            <a class="section__link" routerLink="/browse">View all &rarr;</a>
          </div>
          <app-audiobook-grid [audiobooks]="catalog.recentlyAdded()" />
        </section>
      }

      @if (continueListening().length > 0) {
        <section class="section container" aria-label="Continue listening">
          <div class="section__header">
            <h2>Continue Listening</h2>
            <a class="section__link" routerLink="/library">View all &rarr;</a>
          </div>
          <app-audiobook-grid [audiobooks]="continueListening()" />
        </section>
      }

      @if (bookmarkBooks().length > 0) {
        <section appReveal class="section container" aria-label="Your bookmarks">
          <div class="section__header">
            <h2>Your Bookmarks</h2>
            <a class="section__link" routerLink="/library">View all &rarr;</a>
          </div>
          <app-audiobook-grid [audiobooks]="bookmarkBooks()" />
        </section>
      }

      <section appReveal class="section container" aria-label="Browse by genre">
        <h2>Browse by Genre</h2>
        <div class="genres">
          @for (genre of genres; track genre) {
            <a class="genre-tag" [routerLink]="['/genre', genre]">{{ genre }}</a>
          }
        </div>
      </section>

      <section appReveal class="section container" aria-label="Curated collections">
        <h2>Curated Collections</h2>
        <div class="collections">
          @for (coll of collections; track coll.name) {
            <a class="collection-card" [routerLink]="['/browse']" [queryParams]="{ q: coll.query }">
              <span class="collection-card__icon">{{ coll.icon }}</span>
              <div>
                <h3 class="collection-card__title">{{ coll.name }}</h3>
                <p class="collection-card__desc">{{ coll.desc }}</p>
              </div>
              <span class="collection-card__arrow">&rarr;</span>
            </a>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    :host { display: block; overflow-x: hidden; }
    .hero {
      position: relative;
      padding: var(--space-3xl) 0 var(--space-2xl);
      text-align: center;
      overflow: hidden;
    }
    .hero__bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(200, 117, 51, 0.08) 0%, transparent 70%);
    }
    .hero__content { position: relative; }
    .hero__eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--accent-primary);
      margin: 0 0 var(--space-md);
    }
    .hero__title {
      font-size: 3.2rem;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: var(--space-lg);
      background: linear-gradient(180deg, var(--text-primary) 40%, var(--text-secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero__subtitle {
      color: var(--text-secondary);
      font-size: 1.15rem;
      margin: 0 auto var(--space-xl);
      max-width: 560px;
      line-height: 1.7;
    }
    .hero__actions {
      display: flex;
      gap: var(--space-md);
      justify-content: center;
      margin-bottom: var(--space-xl);
    }
    .hero__btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 24px;
      padding: 12px 28px;
      font-size: 0.95rem;
      text-decoration: none;
    }
    .hero__stats {
      display: flex;
      justify-content: center;
      gap: var(--space-2xl);
    }
    .hero__stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hero__stat-value {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--accent-primary);
    }
    .hero__stat-label {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 2px;
    }
    .section {
      padding: var(--space-2xl) 0;
    }
    .section__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: var(--space-sm);
    }
    .section__header h2 { margin-bottom: 0; }
    .section__link {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .genres {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .genre-tag {
      background-color: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-bright);
      border-radius: 20px;
      padding: 6px 18px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .genre-tag:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      background-color: var(--accent-dim);
    }
    .collections {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-md);
      margin-top: var(--space-md);
    }
    .collection-card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .collection-card:hover {
      border-color: var(--accent-primary);
      box-shadow: var(--shadow-md);
      color: inherit;
    }
    .collection-card__icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--accent-dim);
      color: var(--accent-primary);
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .collection-card__title {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 2px;
    }
    .collection-card__desc {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      margin: 0;
    }
    .collection-card__arrow {
      margin-left: auto;
      color: var(--text-tertiary);
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .collection-card:hover .collection-card__arrow {
      color: var(--accent-primary);
    }
    @media (max-width: 768px) {
      .hero { padding: var(--space-2xl) 0 var(--space-xl); }
      .hero__title { font-size: 2.2rem; }
      .hero__stats { gap: var(--space-xl); }
      .hero__stat-value { font-size: 1.4rem; }
      .hero__actions { flex-direction: column; align-items: center; }
      .collections { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .hero__title { font-size: 1.8rem; }
      .hero__subtitle { font-size: 1rem; }
      .hero__stats { flex-wrap: wrap; gap: var(--space-sm) var(--space-lg); }
      .hero__stat-value { font-size: 1.2rem; }
      .genre-tag { padding: 5px 14px; font-size: 0.875rem; }
    }
  `],
})
export class HomeComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  protected readonly library = inject(LibraryService);
  private readonly player = inject(PlayerService);
  private readonly router = inject(Router);
  private readonly durationPipe = new DurationPipe();

  readonly genres = [
    'Fiction', 'Poetry', 'Non-fiction', 'Drama', 'Short Stories',
    'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Philosophy',
    'History', 'Biography', 'Children', 'Humor', 'Religion',
  ];

  readonly collections = [
    { name: 'Victorian Novels', query: 'victorian', icon: '\u{1F3DB}', desc: 'Dickens, Bront\u00eb, Hardy and more' },
    { name: 'Shakespeare', query: 'shakespeare', icon: '\u{1F3AD}', desc: 'Plays and sonnets from the Bard' },
    { name: 'Philosophy', query: 'philosophy', icon: '\u{1F4DC}', desc: 'Plato, Aristotle, Nietzsche' },
    { name: 'Sci-Fi Pioneers', query: 'science fiction', icon: '\u{1F680}', desc: 'Verne, Wells, Shelley' },
    { name: "Children's Classics", query: 'children', icon: '\u{1F4D6}', desc: 'Fairy tales and adventures' },
    { name: 'World Literature', query: 'translated', icon: '\u{1F30D}', desc: 'Classics from around the globe' },
  ];

  readonly totalListened = computed(() => {
    const secs = this.library.totalListenedSecs();
    return this.durationPipe.transform(secs, 'long');
  });

  readonly continueListening = computed(() => {
    const history = this.library.history()
      .filter((h) => !h.completed && h.lastPositionSecs > 0)
      .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
      .slice(0, 6);
    // Return minimal summary objects for display
    return history.map((h) => ({
      id: h.bookId,
      title: `Book ${h.bookId}`,
      description: '',
      language: '',
      copyrightYear: '',
      numSections: 0,
      totalTime: '',
      totalTimeSecs: 0,
      authors: [],
      genres: [],
      coverArtUrl: null,
      urlRss: null,
      urlZipFile: null,
    }));
  });

  readonly bookmarkBooks = computed(() => {
    const bookmarks = this.library.bookmarks()
      .sort((a, b) => b.addedAt - a.addedAt)
      .slice(0, 6);
    return bookmarks.map((b) => ({
      id: b.bookId,
      title: `Book ${b.bookId}`,
      description: '',
      language: '',
      copyrightYear: '',
      numSections: 0,
      totalTime: '',
      totalTimeSecs: 0,
      authors: [],
      genres: [],
      coverArtUrl: null,
      urlRss: null,
      urlZipFile: null,
    }));
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.catalog.loadFeatured();
    this.catalog.loadRecentlyAdded();
  }

  surpriseMe(): void {
    const books = this.catalog.featured();
    if (books.length === 0) {
      this.router.navigate(['/browse']);
      return;
    }
    const pick = books[Math.floor(Math.random() * books.length)];
    this.router.navigate(['/audiobook', pick.id]);
  }
}
