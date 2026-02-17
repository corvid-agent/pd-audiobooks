import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  AudiobookSummary,
  AudiobookDetail,
  LibrivoxBookRaw,
  LibrivoxSectionRaw,
  Author,
  Chapter,
} from '../models/audiobook.model';

const API_BASE = 'https://librivox.org/api/feed';

export interface SearchParams {
  title?: string;
  author?: string;
  genre?: string;
  language?: string;
  offset?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  readonly results = signal<AudiobookSummary[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly featured = signal<AudiobookSummary[]>([]);
  readonly recentlyAdded = signal<AudiobookSummary[]>([]);

  readonly hasResults = computed(() => this.results().length > 0);

  search(params: SearchParams): void {
    this.loading.set(true);
    this.error.set(null);

    const url = new URL(`${API_BASE}/audiobooks`);
    if (params.title) url.searchParams.set('title', `^${params.title}`);
    if (params.author) url.searchParams.set('author', params.author);
    url.searchParams.set('format', 'json');
    url.searchParams.set('extended', '1');
    url.searchParams.set('coverart', '1');
    url.searchParams.set('limit', String(params.limit ?? 24));
    url.searchParams.set('offset', String(params.offset ?? 0));

    this.http.get<{ books: LibrivoxBookRaw[] }>(url.toString()).subscribe({
      next: (res) => {
        const books = (res.books ?? []).map((b) => this.mapSummary(b));
        if ((params.offset ?? 0) > 0) {
          this.results.update((prev) => [...prev, ...books]);
        } else {
          this.results.set(books);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load audiobooks. Please try again.');
        this.loading.set(false);
        console.error('CatalogService search error:', err);
      },
    });
  }

  getDetail(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    const url = `${API_BASE}/audiobooks?id=${id}&format=json&extended=1&coverart=1`;
    this.http.get<{ books: LibrivoxBookRaw[] }>(url).subscribe({
      next: (res) => {
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load audiobook details.');
        this.loading.set(false);
        console.error('CatalogService getDetail error:', err);
      },
    });
  }

  getDetailAsync(id: string): Promise<AudiobookDetail | null> {
    const url = `${API_BASE}/audiobooks?id=${id}&format=json&extended=1&coverart=1`;
    return new Promise((resolve) => {
      this.http.get<{ books: LibrivoxBookRaw[] }>(url).subscribe({
        next: (res) => {
          const raw = res.books?.[0];
          if (raw) {
            resolve(this.mapDetail(raw));
          } else {
            resolve(null);
          }
        },
        error: () => resolve(null),
      });
    });
  }

  loadFeatured(): void {
    this.loading.set(true);
    this.error.set(null);
    const url = `${API_BASE}/audiobooks?format=json&extended=1&coverart=1&limit=12&offset=0`;
    this.http.get<{ books: LibrivoxBookRaw[] }>(url).subscribe({
      next: (res) => {
        this.featured.set((res.books ?? []).map((b) => this.mapSummary(b)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load audiobooks. Please try again.');
        this.loading.set(false);
      },
    });
  }

  loadRecentlyAdded(): void {
    const url = `${API_BASE}/audiobooks?format=json&extended=1&coverart=1&limit=12&offset=12`;
    this.http.get<{ books: LibrivoxBookRaw[] }>(url).subscribe({
      next: (res) => {
        this.recentlyAdded.set((res.books ?? []).map((b) => this.mapSummary(b)));
      },
      error: () => { /* non-critical, silently fail */ },
    });
  }

  searchByAuthor(authorId: string, limit = 24): void {
    this.loading.set(true);
    this.error.set(null);
    const url = `${API_BASE}/audiobooks?author=${authorId}&format=json&extended=1&coverart=1&limit=${limit}`;
    this.http.get<{ books: LibrivoxBookRaw[] }>(url).subscribe({
      next: (res) => {
        this.results.set((res.books ?? []).map((b) => this.mapSummary(b)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load author audiobooks.');
        this.loading.set(false);
      },
    });
  }

  searchByGenre(genre: string, limit = 24, offset = 0): void {
    this.loading.set(true);
    this.error.set(null);
    const url = `${API_BASE}/audiobooks?genre=${encodeURIComponent(genre)}&format=json&extended=1&coverart=1&limit=${limit}&offset=${offset}`;
    this.http.get<{ books: LibrivoxBookRaw[] }>(url).subscribe({
      next: (res) => {
        const books = (res.books ?? []).map((b) => this.mapSummary(b));
        if (offset > 0) {
          this.results.update((prev) => [...prev, ...books]);
        } else {
          this.results.set(books);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load genre audiobooks.');
        this.loading.set(false);
      },
    });
  }

  clearResults(): void {
    this.results.set([]);
    this.error.set(null);
  }

  private mapSummary(raw: LibrivoxBookRaw): AudiobookSummary {
    return {
      id: raw.id,
      title: this.cleanHtml(raw.title),
      description: this.cleanHtml(raw.description ?? ''),
      language: raw.language ?? 'English',
      copyrightYear: raw.copyright_year ?? '',
      numSections: parseInt(raw.num_sections, 10) || 0,
      totalTime: raw.totaltime ?? '',
      totalTimeSecs: raw.totaltimesecs ?? 0,
      authors: (raw.authors ?? []).map((a) => this.mapAuthor(a)),
      genres: this.parseGenres(raw.genres),
      coverArtUrl: this.buildCoverUrl(raw),
      urlRss: raw.url_rss || null,
      urlZipFile: raw.url_zip_file || null,
    };
  }

  private mapDetail(raw: LibrivoxBookRaw): AudiobookDetail {
    return {
      ...this.mapSummary(raw),
      sections: (raw.sections ?? []).map((s) => this.mapChapter(s)),
      urlLibrivox: raw.url_librivox || null,
      urlProject: raw.url_project || null,
      translators: (raw.translators ?? []).map((t) => `${t.first_name} ${t.last_name}`.trim()),
    };
  }

  private mapAuthor(raw: { id: string; first_name: string; last_name: string; dob?: string; dod?: string }): Author {
    return {
      id: raw.id,
      firstName: raw.first_name ?? '',
      lastName: raw.last_name ?? '',
      dob: raw.dob || null,
      dod: raw.dod || null,
    };
  }

  private mapChapter(raw: LibrivoxSectionRaw): Chapter {
    // playtime can be plain seconds ("1179") or "HH:MM:SS" format
    const pt = raw.playtime ?? '0';
    let secs: number;
    if (pt.includes(':')) {
      const parts = pt.split(':').map(Number);
      secs = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    } else {
      secs = parseInt(pt, 10) || 0;
    }
    return {
      id: raw.id,
      sectionNumber: parseInt(raw.section_number, 10) || 0,
      title: this.cleanHtml(raw.title),
      listenUrl: raw.listen_url ?? '',
      duration: raw.playtime ?? '',
      durationSecs: secs,
      readers: (raw.readers ?? []).map((r) => r.display_name),
    };
  }

  private parseGenres(genres: { id: string; name: string }[] | string | undefined): string[] {
    if (!genres) return [];
    if (typeof genres === 'string') {
      return genres.split(',').map((g) => g.trim()).filter(Boolean);
    }
    if (Array.isArray(genres)) {
      return genres.map((g) => g.name).filter(Boolean);
    }
    return [];
  }

  private buildCoverUrl(raw: LibrivoxBookRaw): string | null {
    if (raw.coverart_jpg) return raw.coverart_jpg;
    if (raw.coverart_thumbnail) return raw.coverart_thumbnail;
    return null;
  }

  private cleanHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
}
