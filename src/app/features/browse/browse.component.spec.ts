import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowseComponent } from './browse.component';

let mockStore: Record<string, string> = {};
const mockStorage: Storage = {
  length: 0,
  clear: () => { mockStore = {}; },
  getItem: (key: string) => mockStore[key] ?? null,
  setItem: (key: string, value: string) => { mockStore[key] = value; },
  removeItem: (key: string) => { delete mockStore[key]; },
  key: () => null,
};

describe('BrowseComponent', () => {
  let component: BrowseComponent;
  let fixture: ComponentFixture<BrowseComponent>;

  beforeEach(async () => {
    mockStore = {};
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true, configurable: true });

    await TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have search input', () => {
    const el: HTMLElement = fixture.nativeElement;
    const input = el.querySelector('input[type="search"]');
    expect(input).toBeTruthy();
  });
});
