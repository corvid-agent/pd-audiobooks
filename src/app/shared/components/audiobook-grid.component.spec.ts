import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AudiobookGridComponent } from './audiobook-grid.component';

describe('AudiobookGridComponent', () => {
  let component: AudiobookGridComponent;
  let fixture: ComponentFixture<AudiobookGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudiobookGridComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AudiobookGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to empty audiobooks array', () => {
    expect(component.audiobooks).toEqual([]);
  });
});
