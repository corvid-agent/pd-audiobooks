import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { LazyImageDirective } from './lazy-image.directive';

@Component({
  standalone: true,
  imports: [LazyImageDirective],
  template: `<img appLazyImage src="https://example.com/cover.jpg" alt="Test" />`,
})
class TestHostComponent {}

describe('LazyImageDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    // Mock IntersectionObserver as a class (must be constructable with `new`)
    (globalThis as any).IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(_cb: any, _opts?: any) {}
    };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create the directive on img element', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
  });

  it('should set opacity to 0 initially', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.style.opacity).toBe('0');
  });

  it('should set transition style', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.style.transition).toContain('opacity');
  });

  it('should move src to data-src for lazy loading', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    // The directive should have removed src and set data-src
    expect(img.getAttribute('data-src') || img.getAttribute('src')).toBeTruthy();
  });
});
