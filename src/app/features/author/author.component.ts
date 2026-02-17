import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { AudiobookGridComponent } from '../../shared/components/audiobook-grid.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';

@Component({
  selector: 'app-author',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AudiobookGridComponent, SkeletonGridComponent],
  template: `
    <div class="author container">
      <h1 class="author__name">{{ authorName() }}</h1>

      @if (catalog.loading()) {
        <app-skeleton-grid />
      } @else if (catalog.error(); as err) {
        <div class="catalog-error" role="alert">
          <p>{{ err }}</p>
        </div>
      } @else if (catalog.results().length > 0) {
        <p class="author__count">{{ catalog.results().length }} audiobook{{ catalog.results().length !== 1 ? 's' : '' }}</p>
        <app-audiobook-grid [audiobooks]="catalog.results()" />
      } @else {
        <p class="text-secondary">No audiobooks found for this author.</p>
      }
    </div>
  `,
  styles: [`
    .author { padding: var(--space-2xl) 0; }
    .author__name { margin-bottom: var(--space-sm); }
    .author__count {
      color: var(--text-tertiary);
      font-size: 0.9rem;
      margin: 0 0 var(--space-xl);
    }
  `],
})
export class AuthorComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);

  readonly authorName = signal('Author');

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.authorName.set(`Author ${id}`);
        this.catalog.searchByAuthor(id);
      }
    });
  }
}
