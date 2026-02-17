import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SleepTimerComponent } from './sleep-timer.component';

describe('SleepTimerComponent', () => {
  let component: SleepTimerComponent;
  let fixture: ComponentFixture<SleepTimerComponent>;
  let mockStore: Record<string, string>;

  beforeEach(async () => {
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

    await TestBed.configureTestingModule({
      imports: [SleepTimerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SleepTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 6 preset options', () => {
    expect(component.presets).toHaveLength(6);
  });

  it('should format remaining time', () => {
    expect(component.formatRemaining(90)).toBe('1:30');
    expect(component.formatRemaining(0)).toBe('0:00');
    expect(component.formatRemaining(3600)).toBe('60:00');
  });

  it('should render option buttons when timer is not active', () => {
    const options = fixture.nativeElement.querySelectorAll('.st__option');
    expect(options.length).toBe(7); // 6 presets + end of chapter
  });
});
