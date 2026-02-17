import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RecentlyPlayedService } from './recently-played.service';

describe('RecentlyPlayedService', () => {
  let service: RecentlyPlayedService;
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
    service = TestBed.inject(RecentlyPlayedService);
    service['ids'].set([]);
  });

  it('starts with empty array', () => {
    expect(service.ids()).toEqual([]);
  });

  it('add() adds id', () => {
    service.add('book-1');
    expect(service.ids()).toEqual(['book-1']);
  });

  it('add() moves existing to front', () => {
    service.add('book-1');
    service.add('book-2');
    service.add('book-3');
    expect(service.ids()).toEqual(['book-3', 'book-2', 'book-1']);

    service.add('book-1');
    expect(service.ids()).toEqual(['book-1', 'book-3', 'book-2']);
  });

  it('limits to 20 items', () => {
    for (let i = 0; i < 25; i++) {
      service.add(`book-${i}`);
    }
    expect(service.ids().length).toBe(20);
    // Most recent should be first
    expect(service.ids()[0]).toBe('book-24');
    // Oldest within limit should be last
    expect(service.ids()[19]).toBe('book-5');
  });

  it('persists to localStorage', () => {
    service.add('book-1');
    service.add('book-2');

    const stored = mockStore['pd-audiobooks-recently-played'];
    expect(stored).toBeDefined();

    const parsed = JSON.parse(stored);
    expect(parsed).toEqual(['book-2', 'book-1']);
  });
});
