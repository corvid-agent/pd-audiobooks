import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'pd-audiobooks-recently-played';
const MAX_ITEMS = 20;

@Injectable({ providedIn: 'root' })
export class RecentlyPlayedService {
  readonly ids = signal<string[]>(this.load());

  add(bookId: string): void {
    this.ids.update((list) => {
      const filtered = list.filter((id) => id !== bookId);
      return [bookId, ...filtered].slice(0, MAX_ITEMS);
    });
    this.save();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids()));
    } catch { /* noop */ }
  }

  private load(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}
