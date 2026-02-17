import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LibraryService } from './library.service';

describe('LibraryService', () => {
  let service: LibraryService;
  let mockStore: Record<string, string>;

  beforeEach(() => {
    mockStore = {};
    const mockStorage: Storage = {
      length: 0,
      clear: () => { mockStore = {}; },
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, value: string) => { mockStore[key] = value; },
      removeItem: (key: string) => { delete mockStore[key]; },
      key: () => null,
    };
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true, configurable: true });

    TestBed.configureTestingModule({});
    service = TestBed.inject(LibraryService);

    service['bookmarks'].set([]);
    service['history'].set([]);
    service['favorites'].set([]);
  });

  // Bookmarks
  it('addBookmark() adds a bookmark', () => {
    service.addBookmark('book-1');
    expect(service.bookmarks().length).toBe(1);
    expect(service.bookmarks()[0].bookId).toBe('book-1');
  });

  it("doesn't duplicate bookmarks", () => {
    service.addBookmark('book-1');
    service.addBookmark('book-1');
    expect(service.bookmarks().length).toBe(1);
  });

  it('removeBookmark() removes', () => {
    service.addBookmark('book-1');
    service.addBookmark('book-2');
    service.removeBookmark('book-1');
    expect(service.bookmarks().length).toBe(1);
    expect(service.bookmarks()[0].bookId).toBe('book-2');
  });

  it('isBookmarked() returns correct boolean', () => {
    expect(service.isBookmarked('book-1')).toBe(false);
    service.addBookmark('book-1');
    expect(service.isBookmarked('book-1')).toBe(true);
    expect(service.isBookmarked('book-2')).toBe(false);
  });

  // Favorites
  it('toggleFavorite() toggles on/off', () => {
    service.toggleFavorite('book-1');
    expect(service.favorites()).toContain('book-1');

    service.toggleFavorite('book-1');
    expect(service.favorites()).not.toContain('book-1');
  });

  it('isFavorite() returns correct boolean', () => {
    expect(service.isFavorite('book-1')).toBe(false);
    service.toggleFavorite('book-1');
    expect(service.isFavorite('book-1')).toBe(true);
  });

  // History
  it('updateHistory() creates new entry', () => {
    service.updateHistory('book-1', 'ch-1', 30, 30);
    const item = service.getHistoryItem('book-1');
    expect(item).toBeDefined();
    expect(item!.bookId).toBe('book-1');
    expect(item!.lastChapterId).toBe('ch-1');
    expect(item!.lastPositionSecs).toBe(30);
    expect(item!.totalListenedSecs).toBe(30);
    expect(item!.completed).toBe(false);
  });

  it('updateHistory() updates existing entry', () => {
    service.updateHistory('book-1', 'ch-1', 30, 30);
    service.updateHistory('book-1', 'ch-2', 60, 25);

    const item = service.getHistoryItem('book-1');
    expect(item!.lastChapterId).toBe('ch-2');
    expect(item!.lastPositionSecs).toBe(60);
    expect(item!.totalListenedSecs).toBe(55);
  });

  it('markCompleted() sets completed flag', () => {
    service.updateHistory('book-1', 'ch-1', 100, 100);
    service.markCompleted('book-1');
    expect(service.getHistoryItem('book-1')!.completed).toBe(true);
  });

  it('getHistoryItem() returns correct item', () => {
    service.updateHistory('book-1', 'ch-1', 10, 10);
    service.updateHistory('book-2', 'ch-1', 20, 20);
    const item = service.getHistoryItem('book-2');
    expect(item!.bookId).toBe('book-2');
    expect(item!.lastPositionSecs).toBe(20);
  });

  it('getHistoryItem() returns undefined for unknown', () => {
    expect(service.getHistoryItem('nonexistent')).toBeUndefined();
  });

  // Computed
  it('totalListenedSecs computed', () => {
    service.updateHistory('book-1', 'ch-1', 10, 100);
    service.updateHistory('book-2', 'ch-1', 20, 200);
    expect(service.totalListenedSecs()).toBe(300);
  });

  it('completedCount computed', () => {
    service.updateHistory('book-1', 'ch-1', 10, 10);
    service.updateHistory('book-2', 'ch-1', 20, 20);
    service.markCompleted('book-1');
    expect(service.completedCount()).toBe(1);
  });

  it('inProgressCount computed', () => {
    service.updateHistory('book-1', 'ch-1', 10, 10);
    service.updateHistory('book-2', 'ch-1', 20, 20);
    service.markCompleted('book-1');
    expect(service.inProgressCount()).toBe(1);
  });

  // Persistence
  it('persists to localStorage on mutation', () => {
    service.addBookmark('book-1');
    const stored = mockStore['pd-audiobooks-library'];
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored);
    expect(parsed.bookmarks.length).toBe(1);
    expect(parsed.bookmarks[0].bookId).toBe('book-1');
  });

  it('loads from localStorage', () => {
    mockStore['pd-audiobooks-library'] = JSON.stringify({
      bookmarks: [{ bookId: 'saved-book', addedAt: 1000 }],
      history: [],
      favorites: ['fav-book'],
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshService = TestBed.inject(LibraryService);

    expect(freshService.bookmarks().length).toBe(1);
    expect(freshService.bookmarks()[0].bookId).toBe('saved-book');
    expect(freshService.isFavorite('fav-book')).toBe(true);
  });
});
