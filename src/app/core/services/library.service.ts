import { Injectable, signal, computed } from '@angular/core';
import type { BookmarkItem, ListeningHistoryItem, UserLibrary } from '../models/library.model';

const STORAGE_KEY = 'pd-audiobooks-library';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  readonly bookmarks = signal<BookmarkItem[]>([]);
  readonly history = signal<ListeningHistoryItem[]>([]);
  readonly favorites = signal<string[]>([]);

  readonly bookmarkIds = computed(() => new Set(this.bookmarks().map((b) => b.bookId)));
  readonly favoriteIds = computed(() => new Set(this.favorites()));

  readonly totalListenedSecs = computed(() =>
    this.history().reduce((sum, h) => sum + h.totalListenedSecs, 0)
  );
  readonly completedCount = computed(() =>
    this.history().filter((h) => h.completed).length
  );
  readonly inProgressCount = computed(() =>
    this.history().filter((h) => !h.completed && h.lastPositionSecs > 0).length
  );

  constructor() {
    this.loadFromStorage();
  }

  // Bookmarks
  addBookmark(bookId: string): void {
    if (this.bookmarkIds().has(bookId)) return;
    this.bookmarks.update((list) => [...list, { bookId, addedAt: Date.now() }]);
    this.save();
  }

  removeBookmark(bookId: string): void {
    this.bookmarks.update((list) => list.filter((b) => b.bookId !== bookId));
    this.save();
  }

  isBookmarked(bookId: string): boolean {
    return this.bookmarkIds().has(bookId);
  }

  // Favorites
  toggleFavorite(bookId: string): void {
    if (this.favoriteIds().has(bookId)) {
      this.favorites.update((list) => list.filter((id) => id !== bookId));
    } else {
      this.favorites.update((list) => [...list, bookId]);
    }
    this.save();
  }

  isFavorite(bookId: string): boolean {
    return this.favoriteIds().has(bookId);
  }

  // History
  updateHistory(
    bookId: string,
    chapterId: string,
    positionSecs: number,
    listenedDelta: number
  ): void {
    this.history.update((list) => {
      const existing = list.find((h) => h.bookId === bookId);
      if (existing) {
        return list.map((h) =>
          h.bookId === bookId
            ? {
                ...h,
                lastPlayedAt: Date.now(),
                lastChapterId: chapterId,
                lastPositionSecs: positionSecs,
                totalListenedSecs: h.totalListenedSecs + listenedDelta,
              }
            : h
        );
      }
      return [
        ...list,
        {
          bookId,
          lastPlayedAt: Date.now(),
          lastChapterId: chapterId,
          lastPositionSecs: positionSecs,
          totalListenedSecs: listenedDelta,
          completed: false,
        },
      ];
    });
    this.save();
  }

  markCompleted(bookId: string): void {
    this.history.update((list) =>
      list.map((h) => (h.bookId === bookId ? { ...h, completed: true } : h))
    );
    this.save();
  }

  getHistoryItem(bookId: string): ListeningHistoryItem | undefined {
    return this.history().find((h) => h.bookId === bookId);
  }

  private save(): void {
    const library: UserLibrary = {
      bookmarks: this.bookmarks(),
      history: this.history(),
      favorites: this.favorites(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    } catch { /* Storage full or unavailable */ }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const library: UserLibrary = JSON.parse(raw);
        this.bookmarks.set(library.bookmarks ?? []);
        this.history.set(library.history ?? []);
        this.favorites.set(library.favorites ?? []);
      }
    } catch { /* Invalid stored data, start fresh */ }
  }
}
