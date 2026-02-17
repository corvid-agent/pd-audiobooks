import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockStore: Record<string, string>;
  let mockDocElement: {
    setAttribute: ReturnType<typeof vi.fn>;
    removeAttribute: ReturnType<typeof vi.fn>;
    dataset: Record<string, string>;
  };

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

    mockDocElement = {
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      dataset: {},
    };
    Object.defineProperty(document, 'documentElement', { value: mockDocElement, writable: true, configurable: true });

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    service['theme'].set('dark');
  });

  it("starts with 'dark' by default", () => {
    expect(service.theme()).toBe('dark');
  });

  it('toggle() cycles dark -> sepia -> light -> dark', () => {
    service.setTheme('dark');
    service.toggle();
    expect(service.theme()).toBe('sepia');

    service.toggle();
    expect(service.theme()).toBe('light');

    service.toggle();
    expect(service.theme()).toBe('dark');
  });

  it('setTheme() sets theme', () => {
    service.setTheme('sepia');
    expect(service.theme()).toBe('sepia');

    service.setTheme('light');
    expect(service.theme()).toBe('light');
  });

  it("setTheme() applies 'data-theme' attribute (sepia/light) or removes it (dark)", () => {
    service.setTheme('sepia');
    expect(mockDocElement.setAttribute).toHaveBeenCalledWith('data-theme', 'sepia');

    service.setTheme('light');
    expect(mockDocElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');

    service.setTheme('dark');
    expect(mockDocElement.removeAttribute).toHaveBeenCalledWith('data-theme');
  });

  it('persists to localStorage', () => {
    service.setTheme('sepia');
    expect(mockStore['pd-audiobooks-theme']).toBe('sepia');

    service.setTheme('light');
    expect(mockStore['pd-audiobooks-theme']).toBe('light');
  });
});
