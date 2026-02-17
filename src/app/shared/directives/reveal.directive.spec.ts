import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { RevealDirective } from './reveal.directive';

@Component({
  standalone: true,
  imports: [RevealDirective],
  template: `<div appReveal class="test-reveal">Content</div>`,
})
class TestHostComponent {}

describe('RevealDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    // Mock IntersectionObserver as a class (must be constructable with `new`)
    (globalThis as any).IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(_cb: any, _opts?: any) {}
    };

    // Mock matchMedia to not prefer reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create the directive', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.test-reveal');
    expect(el).toBeTruthy();
  });

  it('should set opacity to 0 initially', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.test-reveal');
    expect(el.style.opacity).toBe('0');
  });

  it('should set transform to translateY(24px)', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.test-reveal');
    expect(el.style.transform).toBe('translateY(24px)');
  });

  it('should set transition style', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.test-reveal');
    expect(el.style.transition).toContain('opacity');
    expect(el.style.transition).toContain('transform');
  });

  it('should have a transition duration', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.test-reveal');
    expect(el.style.transition).toContain('0.5s');
  });
});
