import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AudiobookSummary } from '../../core/models/audiobook.model';
import { AudiobookCardComponent } from './audiobook-card.component';

@Component({
  selector: 'app-audiobook-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AudiobookCardComponent],
  template: `
    <div class="audiobook-grid" role="list">
      @for (book of audiobooks; track book.id) {
        <app-audiobook-card [audiobook]="book" />
      }
    </div>
  `,
  styles: [`
    .audiobook-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-lg);
    }
    .audiobook-grid ::ng-deep app-audiobook-card {
      width: 100%;
    }
    @media (max-width: 768px) {
      .audiobook-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--space-md);
      }
    }
    @media (max-width: 480px) {
      .audiobook-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: var(--space-sm);
      }
    }
  `],
})
export class AudiobookGridComponent {
  @Input() audiobooks: AudiobookSummary[] = [];
}
