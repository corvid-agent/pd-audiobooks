import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PlaybackSpeedComponent } from './playback-speed.component';

describe('PlaybackSpeedComponent', () => {
  let component: PlaybackSpeedComponent;
  let fixture: ComponentFixture<PlaybackSpeedComponent>;
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
      imports: [PlaybackSpeedComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PlaybackSpeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all 7 speed options', () => {
    expect(component.speeds).toEqual([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
  });

  it('should have 7 speed buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.ps__option');
    expect(buttons.length).toBe(7);
  });
});
