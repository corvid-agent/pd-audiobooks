import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { AudiobookGridComponent } from '../../shared/components/audiobook-grid.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-browse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AudiobookGridComponent, SkeletonGridComponent, LoadingSpinnerComponent, FormsModule],
  template: `
    <div class="browse container">
      <h1 class="browse__title">Browse Audiobooks</h1>

      <div class="browse__controls">
        <form class="browse__search" (ngSubmit)="onSearch()" role="search">
          <svg class="browse__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            class="browse__search-input"
            type="search"
            placeholder="Search by title or author..."
            [(ngModel)]="searchQuery"
            name="q"
            id="search-input"
            aria-label="Search audiobooks"
          />
          <button class="browse__search-btn btn-primary" type="submit">Search</button>
        </form>

        <div class="browse__filters">
          <select class="browse__select" [(ngModel)]="selectedLanguage" (ngModelChange)="onFilterChange()" name="language" aria-label="Filter by language">
            <option value="">All Languages</option>
            @for (lang of languages; track lang) {
              <option [value]="lang">{{ lang }}</option>
            }
          </select>

          <select class="browse__select" [(ngModel)]="sortBy" (ngModelChange)="onFilterChange()" name="sort" aria-label="Sort by">
            <option value="title">Sort: Title</option>
            <option value="recent">Sort: Recent</option>
            <option value="duration">Sort: Duration</option>
          </select>
        </div>
      </div>

      @if (catalog.error(); as err) {
        <div class="catalog-error" role="alert">
          <p>{{ err }}</p>
          <button (click)="onSearch()">Try Again</button>
        </div>
      } @else if (catalog.loading() && catalog.results().length === 0) {
        <app-skeleton-grid />
      } @else if (catalog.results().length > 0) {
        <app-audiobook-grid [audiobooks]="catalog.results()" />
        @if (catalog.results().length >= currentLimit()) {
          <div class="browse__load-more">
            @if (catalog.loading()) {
              <app-loading-spinner />
            } @else {
              <button class="btn-secondary" (click)="loadMore()">Load More</button>
            }
          </div>
        }
      } @else if (!catalog.loading()) {
        <div class="browse__empty">
          <p>No audiobooks found. Try a different search term.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .browse {
      padding: var(--space-2xl) 0;
    }
    .browse__title {
      margin-bottom: var(--space-xl);
    }
    .browse__controls {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .browse__search {
      display: flex;
      gap: var(--space-sm);
      position: relative;
    }
    .browse__search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary);
      pointer-events: none;
    }
    .browse__search-input {
      flex: 1;
      padding-left: 42px;
      border-radius: var(--radius-lg);
    }
    .browse__search-btn {
      border-radius: var(--radius-lg);
      white-space: nowrap;
    }
    .browse__filters {
      display: flex;
      gap: var(--space-sm);
    }
    .browse__select {
      flex: 1;
      max-width: 200px;
      border-radius: var(--radius);
    }
    .browse__load-more {
      text-align: center;
      margin-top: var(--space-xl);
    }
    .browse__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
    @media (max-width: 480px) {
      .browse__search { flex-direction: column; }
      .browse__filters { flex-direction: column; }
      .browse__select { max-width: none; }
    }
  `],
})
export class BrowseComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);

  searchQuery = signal('');
  selectedLanguage = signal('');
  sortBy = signal('title');
  readonly currentLimit = signal(24);

  readonly languages = ['English', 'German', 'French', 'Spanish', 'Italian', 'Russian', 'Portuguese', 'Dutch', 'Chinese', 'Japanese'];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.searchQuery.set(params['q']);
      }
      this.onSearch();
    });
  }

  onSearch(): void {
    this.currentLimit.set(24);
    this.catalog.search({
      title: this.searchQuery() || undefined,
      language: this.selectedLanguage() || undefined,
      limit: 24,
      offset: 0,
    });
  }

  onFilterChange(): void {
    this.onSearch();
  }

  loadMore(): void {
    const newLimit = this.currentLimit() + 24;
    this.currentLimit.set(newLimit);
    this.catalog.search({
      title: this.searchQuery() || undefined,
      language: this.selectedLanguage() || undefined,
      limit: 24,
      offset: this.catalog.results().length,
    });
  }
}
