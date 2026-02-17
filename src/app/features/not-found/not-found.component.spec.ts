import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 404', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('404');
  });

  it('should have link to home', () => {
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('a');
    const homeLink = Array.from(links).find((a) => a.getAttribute('href') === '/home');
    expect(homeLink).toBeTruthy();
  });
});
