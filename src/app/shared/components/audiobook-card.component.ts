import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudiobookSummary } from '../../core/models/audiobook.model';
import { LibraryService } from '../../core/services/library.service';

@Component({
  selector: 'app-audiobook-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (audiobook) {
      <article class="card" role="listitem">
        <a class="card-link" [routerLink]="['/audiobook', audiobook.id]" [attr.aria-label]="audiobook.title + ' by ' + authorDisplay">
          <div class="card-cover">
            @if (audiobook.coverArtUrl) {
              <img
                [src]="audiobook.coverArtUrl"
                [alt]="audiobook.title + ' cover art'"
                class="card-img"
                loading="lazy"
                width="180"
                height="180"
              />
            } @else {
              <div class="card-img-placeholder" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
            }
            @if (audiobook.genres.length > 0) {
              <span class="card-genre">{{ audiobook.genres[0] }}</span>
            }
          </div>

          <div class="card-body">
            <h3 class="card-title">{{ audiobook.title }}</h3>
            <p class="card-author">{{ authorDisplay }}</p>
            <p class="card-duration">{{ audiobook.totalTime }}</p>
          </div>
        </a>

        <button
          class="card-bookmark"
          (click)="toggleBookmark($event)"
          [attr.aria-label]="library.isBookmarked(audiobook.id) ? 'Remove ' + audiobook.title + ' from library' : 'Add ' + audiobook.title + ' to library'"
          [class.bookmarked]="library.isBookmarked(audiobook.id)"
        >
          @if (library.isBookmarked(audiobook.id)) {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          } @else {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          }
        </button>
      </article>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
      flex-shrink: 0;
    }
    .card {
      position: relative;
    }
    .card-link {
      display: block;
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius-lg);
      transition: transform 0.2s;
    }
    .card-link:hover {
      transform: translateY(-2px);
    }
    .card-link:hover .card-img {
      box-shadow: var(--shadow-cover);
    }
    .card-link:hover .card-title {
      color: var(--accent-primary);
    }
    .card-cover {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background-color: var(--bg-raised);
    }
    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: box-shadow 0.2s;
    }
    .card-img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-raised);
      color: var(--text-tertiary);
    }
    .card-genre {
      position: absolute;
      bottom: var(--space-xs);
      left: var(--space-xs);
      background-color: rgba(0, 0, 0, 0.7);
      color: var(--accent-primary);
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      line-height: 1.4;
    }
    .card-body {
      padding: var(--space-sm) 0 0;
    }
    .card-title {
      font-family: var(--font-heading);
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.3;
      margin: 0;
      color: var(--text-primary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.2s;
    }
    .card-author {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin: 2px 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-duration {
      font-size: 0.7rem;
      color: var(--text-tertiary);
      margin: 2px 0 0;
    }
    .card-bookmark {
      position: absolute;
      top: var(--space-xs);
      right: var(--space-xs);
      z-index: 2;
      background-color: rgba(0, 0, 0, 0.6);
      border: none;
      color: var(--text-secondary);
      width: 32px;
      height: 32px;
      min-height: 32px;
      min-width: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      opacity: 0;
      transition: opacity 0.2s, color 0.2s, background-color 0.2s;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    .card:hover .card-bookmark,
    .card-bookmark:focus-visible,
    .card-bookmark.bookmarked {
      opacity: 1;
    }
    .card-bookmark.bookmarked {
      color: var(--accent-primary);
    }
    .card-bookmark:hover {
      color: var(--accent-primary);
      background-color: rgba(0, 0, 0, 0.8);
    }
    @media (max-width: 480px) {
      :host { width: 140px; }
      .card-bookmark { opacity: 1; }
    }
  `],
})
export class AudiobookCardComponent {
  @Input() audiobook!: AudiobookSummary;
  protected readonly library = inject(LibraryService);

  get authorDisplay(): string {
    if (!this.audiobook?.authors?.length) return 'Unknown Author';
    return this.audiobook.authors
      .map((a) => `${a.firstName} ${a.lastName}`.trim())
      .join(', ');
  }

  toggleBookmark(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.audiobook) return;
    if (this.library.isBookmarked(this.audiobook.id)) {
      this.library.removeBookmark(this.audiobook.id);
    } else {
      this.library.addBookmark(this.audiobook.id);
    }
  }
}
