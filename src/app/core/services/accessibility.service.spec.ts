import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AccessibilityService } from './accessibility.service';

describe('AccessibilityService', () => {
  let service: AccessibilityService;
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

    // Mock document.documentElement for apply()
    const mockDocElement = {
      style: { setProperty: vi.fn() },
      classList: {
        toggle: vi.fn(),
      },
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
    };
    Object.defineProperty(document, 'documentElement', { value: mockDocElement, writable: true, configurable: true });

    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessibilityService);
    service.resetAll();
  });

  it('starts with default prefs', () => {
    const prefs = service.prefs();
    expect(prefs.fontSize).toBe('default');
    expect(prefs.highContrast).toBe(false);
    expect(prefs.reducedMotion).toBe(false);
    expect(prefs.wideSpacing).toBe(false);
  });

  it('increaseFontSize() goes default -> large -> x-large -> xx-large', () => {
    expect(service.prefs().fontSize).toBe('default');

    service.increaseFontSize();
    expect(service.prefs().fontSize).toBe('large');

    service.increaseFontSize();
    expect(service.prefs().fontSize).toBe('x-large');

    service.increaseFontSize();
    expect(service.prefs().fontSize).toBe('xx-large');

    // Should not go beyond xx-large
    service.increaseFontSize();
    expect(service.prefs().fontSize).toBe('xx-large');
  });

  it('decreaseFontSize() goes down', () => {
    service.increaseFontSize();
    service.increaseFontSize();
    expect(service.prefs().fontSize).toBe('x-large');

    service.decreaseFontSize();
    expect(service.prefs().fontSize).toBe('large');

    service.decreaseFontSize();
    expect(service.prefs().fontSize).toBe('default');

    // Should not go below default
    service.decreaseFontSize();
    expect(service.prefs().fontSize).toBe('default');
  });

  it('canIncrease()/canDecrease() correctness', () => {
    // At default: can increase, cannot decrease
    expect(service.canIncrease()).toBe(true);
    expect(service.canDecrease()).toBe(false);

    service.increaseFontSize(); // large
    expect(service.canIncrease()).toBe(true);
    expect(service.canDecrease()).toBe(true);

    service.increaseFontSize(); // x-large
    service.increaseFontSize(); // xx-large
    expect(service.canIncrease()).toBe(false);
    expect(service.canDecrease()).toBe(true);
  });

  it('toggleHighContrast() toggles', () => {
    expect(service.prefs().highContrast).toBe(false);
    service.toggleHighContrast();
    expect(service.prefs().highContrast).toBe(true);
    service.toggleHighContrast();
    expect(service.prefs().highContrast).toBe(false);
  });

  it('toggleReducedMotion() toggles', () => {
    expect(service.prefs().reducedMotion).toBe(false);
    service.toggleReducedMotion();
    expect(service.prefs().reducedMotion).toBe(true);
    service.toggleReducedMotion();
    expect(service.prefs().reducedMotion).toBe(false);
  });

  it('toggleWideSpacing() toggles', () => {
    expect(service.prefs().wideSpacing).toBe(false);
    service.toggleWideSpacing();
    expect(service.prefs().wideSpacing).toBe(true);
    service.toggleWideSpacing();
    expect(service.prefs().wideSpacing).toBe(false);
  });

  it('resetAll() resets to defaults', () => {
    service.increaseFontSize();
    service.toggleHighContrast();
    service.toggleReducedMotion();
    service.toggleWideSpacing();

    service.resetAll();

    const prefs = service.prefs();
    expect(prefs.fontSize).toBe('default');
    expect(prefs.highContrast).toBe(false);
    expect(prefs.reducedMotion).toBe(false);
    expect(prefs.wideSpacing).toBe(false);
  });

  it('getFontSizeLabel() returns correct labels', () => {
    expect(service.getFontSizeLabel()).toBe('Default');

    service.increaseFontSize();
    expect(service.getFontSizeLabel()).toBe('Large');

    service.increaseFontSize();
    expect(service.getFontSizeLabel()).toBe('X-Large');

    service.increaseFontSize();
    expect(service.getFontSizeLabel()).toBe('XX-Large');
  });

  it('persists to localStorage', () => {
    service.toggleHighContrast();
    const stored = mockStore['pd-audiobooks-a11y'];
    expect(stored).toBeDefined();

    const parsed = JSON.parse(stored);
    expect(parsed.highContrast).toBe(true);
    expect(parsed.fontSize).toBe('default');
  });
});
