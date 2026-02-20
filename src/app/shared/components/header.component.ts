import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { AccessibilityService } from '../../core/services/accessibility.service';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="header" role="banner">
      <div class="header-inner">
        <a class="logo" routerLink="/home" aria-label="PD Audiobooks home">
          <span class="logo-icon" aria-hidden="true">&#9670;</span>
          <span class="logo-text">PD Audiobooks</span>
        </a>

        <nav class="nav-desktop" aria-label="Main navigation">
          <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/browse" routerLinkActive="active">Browse</a>
          <a routerLink="/library" routerLinkActive="active">Library</a>
          <a routerLink="/stats" routerLinkActive="active">Stats</a>
          <a routerLink="/about" routerLinkActive="active">About</a>
        </nav>

        <div class="header-actions">
          <form class="search-form" (ngSubmit)="onSearch()" role="search">
            <label for="header-search" class="sr-only">Search audiobooks</label>
            <input
              id="header-search"
              type="search"
              class="search-input"
              placeholder="Search audiobooks..."
              [(ngModel)]="searchQuery"
              name="q"
              autocomplete="off"
            />
            <button type="submit" class="search-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>

          <button class="icon-btn" (click)="theme.toggle()" [attr.aria-label]="'Theme: ' + theme.theme() + '. Click to change.'">
            @switch (theme.theme()) {
              @case ('dark') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
              @case ('sepia') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12h4m12 0h4M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>
              }
              @case ('light') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              }
            }
          </button>

          <button class="icon-btn" (click)="a11y.panelOpen.set(true)" aria-label="Accessibility settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="4.5" r="2.5"/>
              <path d="M12 7v6m0 0l-3 7m3-7l3 7M6 10h12"/>
            </svg>
          </button>

          <button
            class="hamburger"
            (click)="menuOpen.set(!menuOpen())"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <span class="hamburger-line" [class.open]="menuOpen()"></span>
            <span class="hamburger-line" [class.open]="menuOpen()"></span>
            <span class="hamburger-line" [class.open]="menuOpen()"></span>
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <nav id="mobile-menu" class="nav-mobile" aria-label="Mobile navigation">
          <a routerLink="/home" routerLinkActive="active" (click)="menuOpen.set(false)">Home</a>
          <a routerLink="/browse" routerLinkActive="active" (click)="menuOpen.set(false)">Browse</a>
          <a routerLink="/library" routerLinkActive="active" (click)="menuOpen.set(false)">Library</a>
          <a routerLink="/stats" routerLinkActive="active" (click)="menuOpen.set(false)">Stats</a>
          <a routerLink="/about" routerLinkActive="active" (click)="menuOpen.set(false)">About</a>
          <form class="search-form-mobile" (ngSubmit)="onSearch(); menuOpen.set(false)" role="search">
            <label for="mobile-search" class="sr-only">Search audiobooks</label>
            <input
              id="mobile-search"
              type="search"
              class="search-input"
              placeholder="Search audiobooks..."
              [(ngModel)]="searchQuery"
              name="q"
              autocomplete="off"
            />
            <button type="submit" class="search-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>
        </nav>
      }
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: var(--space-lg);
      padding: 0 var(--space-lg);
      height: 60px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
      color: var(--text-primary);
      flex-shrink: 0;
    }
    .logo:hover { color: var(--accent-primary); }
    .logo-icon {
      font-size: 1.4rem;
      color: var(--accent-primary);
      line-height: 1;
    }
    .logo-text {
      font-family: var(--font-heading);
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .nav-desktop {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      flex: 1;
    }
    .nav-desktop a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius);
      transition: color 0.2s, background-color 0.2s;
    }
    .nav-desktop a:hover {
      color: var(--text-primary);
      background-color: var(--bg-hover);
    }
    .nav-desktop a.active {
      color: var(--accent-primary);
      background-color: var(--accent-dim);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      flex-shrink: 0;
    }
    .search-form {
      display: flex;
      align-items: center;
      position: relative;
    }
    .search-input {
      width: 200px;
      height: 44px;
      min-height: 44px;
      padding: 0 44px 0 var(--space-sm);
      font-size: 0.875rem;
      background-color: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text-primary);
      transition: border-color 0.2s, width 0.2s;
    }
    .search-input:focus {
      width: 260px;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-dim);
      outline: none;
    }
    .search-btn {
      position: absolute;
      right: 2px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-tertiary);
      padding: 4px;
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .search-btn:hover { color: var(--accent-primary); }
    .icon-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      padding: 0;
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
      cursor: pointer;
      transition: color 0.2s, background-color 0.2s;
    }
    .icon-btn:hover {
      color: var(--accent-primary);
      background-color: var(--bg-hover);
    }
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      background: none;
      border: none;
      padding: 0;
      min-height: 44px;
      min-width: 44px;
      align-items: center;
      cursor: pointer;
    }
    .hamburger-line {
      display: block;
      width: 22px;
      height: 2px;
      background-color: var(--text-secondary);
      border-radius: 1px;
      transition: transform 0.2s, opacity 0.2s;
    }
    .hamburger-line.open:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .hamburger-line.open:nth-child(2) {
      opacity: 0;
    }
    .hamburger-line.open:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
    .nav-mobile {
      display: none;
      flex-direction: column;
      padding: var(--space-sm) var(--space-lg) var(--space-lg);
      border-top: 1px solid var(--border);
      background-color: var(--bg-surface);
    }
    .nav-mobile a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 1rem;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius);
      transition: color 0.2s, background-color 0.2s;
    }
    .nav-mobile a:hover {
      color: var(--text-primary);
      background-color: var(--bg-hover);
    }
    .nav-mobile a.active {
      color: var(--accent-primary);
      background-color: var(--accent-dim);
    }
    .search-form-mobile {
      display: flex;
      align-items: center;
      position: relative;
      margin-top: var(--space-sm);
    }
    .search-form-mobile .search-input {
      width: 100%;
    }
    .search-form-mobile .search-input:focus {
      width: 100%;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    @media (max-width: 768px) {
      .nav-desktop { display: none; }
      .search-form { display: none; }
      .hamburger { display: flex; }
      .nav-mobile { display: flex; }
      .header-inner {
        padding: 0 var(--space-md);
      }
    }
  `],
})
export class HeaderComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly a11y = inject(AccessibilityService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  searchQuery = '';

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/browse'], { queryParams: { q } });
      this.searchQuery = '';
    }
  }
}
