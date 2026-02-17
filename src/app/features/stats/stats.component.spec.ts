import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { StatsComponent } from './stats.component';

let mockStore: Record<string, string> = {};
const mockStorage: Storage = {
  length: 0,
  clear: () => { mockStore = {}; },
  getItem: (key: string) => mockStore[key] ?? null,
  setItem: (key: string, value: string) => { mockStore[key] = value; },
  removeItem: (key: string) => { delete mockStore[key]; },
  key: () => null,
};

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;

  beforeEach(async () => {
    mockStore = {};
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true, configurable: true });

    await TestBed.configureTestingModule({
      imports: [StatsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty state message when no history', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Start listening to audiobooks to see your stats here!');
  });
});
