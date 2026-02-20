import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="about container">
      <h1>About PD Audiobooks</h1>

      <section class="about__section" aria-label="What is PD Audiobooks">
        <h2>What is PD Audiobooks?</h2>
        <p>
          PD Audiobooks is a free, open-source progressive web app for discovering and listening to
          public domain audiobooks. All audiobooks are sourced from
          <a href="https://librivox.org" target="_blank" rel="noopener">LibriVox</a>,
          a volunteer-driven project that produces free recordings of books in the public domain.
        </p>
      </section>

      <section class="about__section" aria-label="Features">
        <h2>Features</h2>
        <ul class="about__features">
          <li>Browse thousands of free audiobooks by title, author, or genre</li>
          <li>Stream chapters directly in your browser</li>
          <li>Track your listening progress across books</li>
          <li>Bookmark and favorite audiobooks for later</li>
          <li>Sleep timer and playback speed controls</li>
          <li>Works offline as a Progressive Web App (cached pages)</li>
          <li>Dark, sepia, and light themes</li>
          <li>Keyboard shortcuts for quick navigation</li>
          <li>Accessibility features: font scaling, high contrast, reduced motion</li>
        </ul>
      </section>

      <section class="about__section" aria-label="Credits">
        <h2>Credits</h2>
        <p>
          Audiobook recordings from <a href="https://librivox.org" target="_blank" rel="noopener">LibriVox</a>,
          hosted by the <a href="https://archive.org" target="_blank" rel="noopener">Internet Archive</a>.
          Built with <a href="https://angular.dev" target="_blank" rel="noopener">Angular</a>.
        </p>
      </section>

      <section class="about__section" aria-label="Open source">
        <h2>Open Source</h2>
        <p>
          PD Audiobooks is open source. View the code on
          <a href="https://github.com/corvid-agent/pd-audiobooks" target="_blank" rel="noopener">GitHub</a>.
        </p>
      </section>

      <div class="about__cta">
        <a routerLink="/browse" class="btn-primary">Start Browsing</a>
      </div>
    </div>
  `,
  styles: [`
    .about { padding: var(--space-2xl) 0; max-width: 720px; }
    .about__section {
      margin-bottom: var(--space-2xl);
    }
    .about__section p {
      color: var(--text-secondary);
      line-height: 1.8;
    }
    .about__features {
      padding-left: var(--space-lg);
      color: var(--text-secondary);
      line-height: 2;
    }
    .about__features li::marker {
      color: var(--accent-primary);
    }
    .about__cta {
      text-align: center;
      margin-top: var(--space-2xl);
    }
    .about__cta a { text-decoration: none; display: inline-block; }
  `],
})
export class AboutComponent {}
