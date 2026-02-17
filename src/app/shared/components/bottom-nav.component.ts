import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" aria-label="Bottom navigation">
      <a
        class="bottom-nav-item"
        routerLink="/home"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        aria-label="Home"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span class="bottom-nav-label">Home</span>
      </a>

      <a
        class="bottom-nav-item"
        routerLink="/browse"
        routerLinkActive="active"
        aria-label="Browse"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span class="bottom-nav-label">Browse</span>
      </a>

      <a
        class="bottom-nav-item"
        routerLink="/library"
        routerLinkActive="active"
        aria-label="Library"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="bottom-nav-label">Library</span>
      </a>

      @if (player.isActive()) {
        <a
          class="bottom-nav-item"
          [routerLink]="['/audiobook', player.state()?.bookId]"
          aria-label="Now Playing"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
          </svg>
          <span class="bottom-nav-label">Playing</span>
        </a>
      }
    </nav>
  `,
  styles: [`
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 80;
      background-color: var(--bg-surface);
      border-top: 1px solid var(--border);
      padding: var(--space-xs) 0;
      padding-bottom: max(var(--space-xs), env(safe-area-inset-bottom));
    }
    @media (max-width: 768px) {
      .bottom-nav {
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
    }
    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      text-decoration: none;
      color: var(--text-tertiary);
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius);
      transition: color 0.2s;
      min-width: 56px;
      min-height: 48px;
      justify-content: center;
    }
    .bottom-nav-item:hover {
      color: var(--text-secondary);
    }
    .bottom-nav-item.active {
      color: var(--accent-primary);
    }
    .bottom-nav-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: 1;
    }
  `],
})
export class BottomNavComponent {
  protected readonly player = inject(PlayerService);
}
