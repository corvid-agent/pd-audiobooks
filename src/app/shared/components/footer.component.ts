import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer" role="contentinfo">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <a class="footer-logo" routerLink="/home" aria-label="PD Audiobooks home">
              <span class="footer-logo-icon" aria-hidden="true">&#9670;</span>
              <span class="footer-logo-text">PD Audiobooks</span>
            </a>
            <p class="footer-tagline">Free classic literature, read aloud</p>
          </div>

          <div class="footer-columns">
            <div class="footer-col">
              <h3 class="footer-col-title">Discover</h3>
              <nav aria-label="Discover">
                <a routerLink="/browse">Browse All</a>
                <a routerLink="/browse" [queryParams]="{ sort: 'genre' }">Genres</a>
              </nav>
            </div>

            <div class="footer-col">
              <h3 class="footer-col-title">Library</h3>
              <nav aria-label="Library">
                <a routerLink="/library">My Library</a>
                <a routerLink="/stats">Stats</a>
              </nav>
            </div>

            <div class="footer-col">
              <h3 class="footer-col-title">Info</h3>
              <nav aria-label="Info">
                <a routerLink="/about">About</a>
                <a href="https://github.com/corvid-agent/pd-audiobooks" target="_blank" rel="noopener noreferrer">GitHub</a>
              </nav>
            </div>

            <div class="footer-col">
              <h3 class="footer-col-title">Ecosystem</h3>
              <nav aria-label="Ecosystem">
                <a href="https://corvid-agent.github.io/" target="_blank" rel="noopener noreferrer">Home</a>
                <a href="https://corvid-agent.github.io/bw-cinema/" target="_blank" rel="noopener noreferrer">BW Cinema</a>
                <a href="https://corvid-agent.github.io/pd-gallery/" target="_blank" rel="noopener noreferrer">Art Gallery</a>
                <a href="https://corvid-agent.github.io/weather-dashboard/" target="_blank" rel="noopener noreferrer">Weather</a>
                <a href="https://corvid-agent.github.io/space-dashboard/" target="_blank" rel="noopener noreferrer">Space</a>
              </nav>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-credits">
            Audiobooks sourced from
            <a href="https://librivox.org" target="_blank" rel="noopener noreferrer">LibriVox</a>
            and the
            <a href="https://archive.org" target="_blank" rel="noopener noreferrer">Internet Archive</a>.
            All recordings are in the public domain.
          </p>
          <div class="footer-links">
            <a routerLink="/home">Home</a>
            <span class="footer-sep" aria-hidden="true">&middot;</span>
            <a routerLink="/browse">Browse</a>
            <span class="footer-sep" aria-hidden="true">&middot;</span>
            <a routerLink="/about">About</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--bg-surface);
      border-top: 1px solid var(--border);
      margin-top: var(--space-3xl);
      padding: var(--space-2xl) 0 var(--space-lg);
    }
    .footer-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--space-lg);
    }
    .footer-top {
      display: flex;
      justify-content: space-between;
      gap: var(--space-2xl);
      padding-bottom: var(--space-xl);
      border-bottom: 1px solid var(--border);
    }
    .footer-brand {
      flex-shrink: 0;
      max-width: 280px;
    }
    .footer-logo {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
      color: var(--text-primary);
      margin-bottom: var(--space-sm);
    }
    .footer-logo:hover { color: var(--accent-primary); }
    .footer-logo-icon {
      font-size: 1.2rem;
      color: var(--accent-primary);
      line-height: 1;
    }
    .footer-logo-text {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
    }
    .footer-tagline {
      color: var(--text-tertiary);
      font-size: 0.85rem;
      margin: 0;
      line-height: 1.5;
    }
    .footer-columns {
      display: flex;
      gap: var(--space-2xl);
    }
    .footer-col nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .footer-col-title {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-tertiary);
      margin: 0 0 var(--space-sm);
    }
    .footer-col a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      padding: 2px 0;
      transition: color 0.2s;
    }
    .footer-col a:hover {
      color: var(--accent-primary);
    }
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-lg);
      gap: var(--space-lg);
    }
    .footer-credits {
      color: var(--text-tertiary);
      font-size: 0.8rem;
      margin: 0;
      line-height: 1.5;
    }
    .footer-credits a {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-credits a:hover {
      color: var(--accent-primary);
    }
    .footer-links {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      flex-shrink: 0;
    }
    .footer-links a {
      color: var(--text-tertiary);
      text-decoration: none;
      font-size: 0.8rem;
      transition: color 0.2s;
    }
    .footer-links a:hover { color: var(--accent-primary); }
    .footer-sep {
      color: var(--text-tertiary);
      font-size: 0.8rem;
    }
    @media (max-width: 768px) {
      .footer { padding: var(--space-xl) 0 var(--space-lg); }
      .footer-inner { padding: 0 var(--space-md); }
      .footer-top {
        flex-direction: column;
        gap: var(--space-xl);
      }
      .footer-brand { max-width: none; }
      .footer-columns {
        gap: var(--space-xl);
      }
      .footer-bottom {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-sm);
      }
    }
    @media (max-width: 768px) {
      .footer { padding-bottom: 100px; }
    }
    @media (max-width: 480px) {
      .footer-columns {
        flex-direction: column;
        gap: var(--space-lg);
      }
    }
  `],
})
export class FooterComponent {}
