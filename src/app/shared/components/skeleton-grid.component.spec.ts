import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SkeletonGridComponent } from './skeleton-grid.component';

describe('SkeletonGridComponent', () => {
  let component: SkeletonGridComponent;
  let fixture: ComponentFixture<SkeletonGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonGridComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SkeletonGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default count to 12', () => {
    expect(component.count).toBe(12);
  });

  it('items getter should return array of correct length', () => {
    expect(component.items).toHaveLength(12);

    component.count = 5;
    expect(component.items).toHaveLength(5);
  });
});
