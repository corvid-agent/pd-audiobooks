import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { AudiobookGridComponent } from '../../shared/components/audiobook-grid.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-genre',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AudiobookGridComponent, SkeletonGridComponent, LoadingSpinnerComponent],
  template: `
    <div class="genre container">
      <h1>{{ genreName() }}</h1>

      @if (catalog.loading() && catalog.results().length === 0) {
        <app-skeleton-grid />
      } @else if (catalog.error(); as err) {
        <div class="catalog-error" role="alert">
          <p>{{ err }}</p>
          <button (click)="loadGenre()">Try Again</button>
        </div>
      } @else if (catalog.results().length > 0) {
        <app-audiobook-grid [audiobooks]="catalog.results()" />
        @if (catalog.results().length >= currentOffset()) {
          <div class="genre__load-more">
            @if (catalog.loading()) {
              <app-loading-spinner />
            } @else {
              <button class="btn-secondary" (click)="loadMore()">Load More</button>
            }
          </div>
        }
      } @else {
        <p class="text-secondary">No audiobooks found in this genre.</p>
      }
    </div>
  `,
  styles: [`
    .genre { padding: var(--space-2xl) 0; }
    .genre__load-more {
      text-align: center;
      margin-top: var(--space-xl);
    }
  `],
})
export class GenreComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);

  readonly genreName = signal('');
  readonly currentOffset = signal(24);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const name = params['name'];
      if (name) {
        this.genreName.set(name);
        this.loadGenre();
      }
    });
  }

  loadGenre(): void {
    this.currentOffset.set(24);
    this.catalog.searchByGenre(this.genreName(), 24, 0);
  }

  loadMore(): void {
    const offset = this.catalog.results().length;
    this.currentOffset.set(offset + 24);
    this.catalog.searchByGenre(this.genreName(), 24, offset);
  }
}
