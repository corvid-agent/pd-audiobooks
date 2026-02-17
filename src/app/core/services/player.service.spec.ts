import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PlayerService } from './player.service';

class MockAudio {
  src = '';
  currentTime = 0;
  duration = 100;
  paused = true;
  playbackRate = 1;
  volume = 1;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

describe('PlayerService', () => {
  let service: PlayerService;
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

    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerService);
  });

  it('starts with null state', () => {
    expect(service.state()).toBeNull();
  });

  it('isActive computed returns false initially', () => {
    expect(service.isActive()).toBe(false);
  });

  it('progress computed returns 0 initially', () => {
    expect(service.progress()).toBe(0);
  });

  it('stop() resets state to null', () => {
    // Manually set a state to verify stop clears it
    service['state'].set({
      bookId: 'book-1',
      bookTitle: 'Test Book',
      authorName: 'Test Author',
      coverArtUrl: null,
      chapterId: 'ch-1',
      chapterTitle: 'Chapter 1',
      chapterIndex: 0,
      totalChapters: 5,
      listenUrl: 'http://example.com/audio.mp3',
      playing: false,
      currentTimeSecs: 50,
      durationSecs: 100,
      speed: 1,
      volume: 1,
    });

    expect(service.state()).not.toBeNull();
    service.stop();
    expect(service.state()).toBeNull();
  });

  it('setSpeed() updates state speed', () => {
    // Set an initial state so setSpeed can update it
    service['state'].set({
      bookId: 'book-1',
      bookTitle: 'Test Book',
      authorName: 'Test Author',
      coverArtUrl: null,
      chapterId: 'ch-1',
      chapterTitle: 'Chapter 1',
      chapterIndex: 0,
      totalChapters: 5,
      listenUrl: 'http://example.com/audio.mp3',
      playing: false,
      currentTimeSecs: 0,
      durationSecs: 100,
      speed: 1,
      volume: 1,
    });

    service.setSpeed(1.5);
    expect(service.state()!.speed).toBe(1.5);

    service.setSpeed(2);
    expect(service.state()!.speed).toBe(2);
  });

  it('setVolume() clamps between 0 and 1', () => {
    service['state'].set({
      bookId: 'book-1',
      bookTitle: 'Test Book',
      authorName: 'Test Author',
      coverArtUrl: null,
      chapterId: 'ch-1',
      chapterTitle: 'Chapter 1',
      chapterIndex: 0,
      totalChapters: 5,
      listenUrl: 'http://example.com/audio.mp3',
      playing: false,
      currentTimeSecs: 0,
      durationSecs: 100,
      speed: 1,
      volume: 1,
    });

    service.setVolume(0.5);
    expect(service.state()!.volume).toBe(0.5);

    // Clamp above 1
    service.setVolume(1.5);
    expect(service.state()!.volume).toBe(1);

    // Clamp below 0
    service.setVolume(-0.5);
    expect(service.state()!.volume).toBe(0);
  });

  it('sleepTimer starts inactive', () => {
    const timer = service.sleepTimer();
    expect(timer.active).toBe(false);
    expect(timer.remainingSecs).toBe(0);
    expect(timer.endChapter).toBe(false);
  });
});
