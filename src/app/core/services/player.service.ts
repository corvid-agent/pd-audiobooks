import { Injectable, inject, signal, computed } from '@angular/core';
import type { PlaybackState, PlaybackSpeed, SleepTimerState } from '../models/player.model';
import type { AudiobookDetail, Chapter } from '../models/audiobook.model';
import { LibraryService } from './library.service';
import { OfflineService } from './offline.service';

const POSITION_KEY = 'pd-audiobooks-player-position';
const SPEED_KEY = 'pd-audiobooks-player-speed';

interface SavedPosition {
  bookId: string;
  chapterIndex: number;
  positionSecs: number;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly library = inject(LibraryService);
  private readonly offline = inject(OfflineService);
  private audio: HTMLAudioElement | null = null;
  private currentBlobUrl: string | null = null;
  private currentBook: AudiobookDetail | null = null;
  private positionUpdateTimer: ReturnType<typeof setInterval> | null = null;
  private sleepTimerId: ReturnType<typeof setInterval> | null = null;

  readonly state = signal<PlaybackState | null>(null);
  readonly sleepTimer = signal<SleepTimerState>({ active: false, remainingSecs: 0, endChapter: false });

  readonly isActive = computed(() => this.state() !== null);
  readonly progress = computed(() => {
    const s = this.state();
    if (!s || s.durationSecs <= 0) return 0;
    return s.currentTimeSecs / s.durationSecs;
  });

  constructor() {
    // Listen for keyboard-triggered play/pause
    if (typeof document !== 'undefined') {
      document.addEventListener('pd-toggle-playback', () => this.togglePlayPause());
    }
  }

  play(book: AudiobookDetail, chapterIndex: number, seekTo?: number): void {
    this.currentBook = book;

    const chapter = book.sections[chapterIndex];
    if (!chapter) return;

    if (!this.audio) {
      this.audio = new Audio();
      this.setupAudioListeners();
    }

    // Revoke previous blob URL to prevent memory leaks
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    const authorName = book.authors.map((a) => `${a.firstName} ${a.lastName}`.trim()).join(', ') || 'Unknown Author';

    this.state.set({
      bookId: book.id,
      bookTitle: book.title,
      authorName,
      coverArtUrl: book.coverArtUrl,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterIndex,
      totalChapters: book.sections.length,
      listenUrl: chapter.listenUrl,
      playing: false,
      currentTimeSecs: 0,
      durationSecs: chapter.durationSecs,
      speed: this.loadSpeed(),
      volume: this.audio.volume,
    });

    // Resolve the URL through the offline cache, then begin playback
    this.offline.resolveAudioUrl(chapter.listenUrl).then((resolvedUrl) => {
      if (!this.audio) return;

      if (resolvedUrl !== chapter.listenUrl) {
        this.currentBlobUrl = resolvedUrl;
      }

      this.audio.src = resolvedUrl;
      this.audio.playbackRate = this.loadSpeed();

      if (seekTo !== undefined && seekTo > 0) {
        this.audio.currentTime = seekTo;
      }

      this.audio.play().then(() => {
        this.state.update((s) => s ? { ...s, playing: true } : s);
        this.startPositionTracking();
        this.updateMediaSession();
      }).catch((err) => console.error('Playback error:', err));
    });
  }

  resume(book: AudiobookDetail): void {
    const saved = this.loadPosition();
    if (saved && saved.bookId === book.id) {
      this.play(book, saved.chapterIndex, saved.positionSecs);
    } else {
      this.play(book, 0);
    }
  }

  togglePlayPause(): void {
    if (!this.audio || !this.state()) return;
    if (this.audio.paused) {
      this.audio.play().then(() => {
        this.state.update((s) => s ? { ...s, playing: true } : s);
        this.startPositionTracking();
      }).catch(() => {});
    } else {
      this.audio.pause();
      this.state.update((s) => s ? { ...s, playing: false } : s);
      this.stopPositionTracking();
      this.savePosition();
    }
  }

  seek(ratio: number): void {
    if (!this.audio) return;
    const s = this.state();
    if (!s) return;
    this.audio.currentTime = ratio * (this.audio.duration || s.durationSecs);
    this.state.update((st) => st ? { ...st, currentTimeSecs: this.audio!.currentTime } : st);
  }

  seekTo(secs: number): void {
    if (!this.audio) return;
    this.audio.currentTime = secs;
    this.state.update((s) => s ? { ...s, currentTimeSecs: secs } : s);
  }

  nextChapter(): void {
    const s = this.state();
    if (!s || !this.currentBook) return;
    if (s.chapterIndex < s.totalChapters - 1) {
      this.play(this.currentBook, s.chapterIndex + 1);
    }
  }

  previousChapter(): void {
    const s = this.state();
    if (!s || !this.currentBook) return;
    if (s.currentTimeSecs > 3) {
      this.seekTo(0);
    } else if (s.chapterIndex > 0) {
      this.play(this.currentBook, s.chapterIndex - 1);
    }
  }

  skipForward(secs = 30): void {
    if (!this.audio) return;
    this.audio.currentTime = Math.min(this.audio.currentTime + secs, this.audio.duration || Infinity);
    this.state.update((s) => s ? { ...s, currentTimeSecs: this.audio!.currentTime } : s);
  }

  skipBack(secs = 15): void {
    if (!this.audio) return;
    this.audio.currentTime = Math.max(this.audio.currentTime - secs, 0);
    this.state.update((s) => s ? { ...s, currentTimeSecs: this.audio!.currentTime } : s);
  }

  setSpeed(speed: PlaybackSpeed): void {
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
    this.state.update((s) => s ? { ...s, speed } : s);
    try { localStorage.setItem(SPEED_KEY, String(speed)); } catch { /* noop */ }
  }

  setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = clamped;
    }
    this.state.update((s) => s ? { ...s, volume: clamped } : s);
  }

  // Sleep timer
  startSleepTimer(minutes: number): void {
    this.cancelSleepTimer();
    this.sleepTimer.set({ active: true, remainingSecs: minutes * 60, endChapter: false });
    this.sleepTimerId = setInterval(() => {
      this.sleepTimer.update((t) => {
        if (t.remainingSecs <= 1) {
          this.onSleepTimerEnd();
          return { active: false, remainingSecs: 0, endChapter: false };
        }
        return { ...t, remainingSecs: t.remainingSecs - 1 };
      });
    }, 1000);
  }

  startEndOfChapterTimer(): void {
    this.cancelSleepTimer();
    this.sleepTimer.set({ active: true, remainingSecs: 0, endChapter: true });
  }

  cancelSleepTimer(): void {
    if (this.sleepTimerId) {
      clearInterval(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    this.sleepTimer.set({ active: false, remainingSecs: 0, endChapter: false });
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    this.stopPositionTracking();
    this.cancelSleepTimer();
    this.state.set(null);
    this.currentBook = null;
  }

  playChapter(chapterIndex: number): void {
    if (this.currentBook) {
      this.play(this.currentBook, chapterIndex);
    }
  }

  getCurrentBook(): AudiobookDetail | null {
    return this.currentBook;
  }

  private setupAudioListeners(): void {
    if (!this.audio) return;

    this.audio.addEventListener('ended', () => {
      const s = this.state();
      if (this.sleepTimer().endChapter) {
        this.onSleepTimerEnd();
        return;
      }
      if (s && this.currentBook && s.chapterIndex < s.totalChapters - 1) {
        this.play(this.currentBook, s.chapterIndex + 1);
      } else {
        this.state.update((st) => st ? { ...st, playing: false } : st);
        this.stopPositionTracking();
        if (s) {
          this.library.markCompleted(s.bookId);
        }
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio && this.audio.duration && isFinite(this.audio.duration)) {
        this.state.update((s) => s ? { ...s, durationSecs: this.audio!.duration } : s);
      }
    });

    this.audio.addEventListener('error', () => {
      console.error('Audio playback error');
      this.state.update((s) => s ? { ...s, playing: false } : s);
    });
  }

  private startPositionTracking(): void {
    this.stopPositionTracking();
    this.positionUpdateTimer = setInterval(() => {
      if (this.audio && !this.audio.paused) {
        const currentTime = this.audio.currentTime;
        this.state.update((s) => s ? { ...s, currentTimeSecs: currentTime } : s);

        const s = this.state();
        if (s) {
          this.library.updateHistory(s.bookId, s.chapterId, currentTime, 1);
        }
      }
    }, 1000);
  }

  private stopPositionTracking(): void {
    if (this.positionUpdateTimer) {
      clearInterval(this.positionUpdateTimer);
      this.positionUpdateTimer = null;
    }
  }

  private onSleepTimerEnd(): void {
    if (this.audio) {
      this.audio.pause();
    }
    this.state.update((s) => s ? { ...s, playing: false } : s);
    this.stopPositionTracking();
    this.cancelSleepTimer();
    this.savePosition();
  }

  private savePosition(): void {
    const s = this.state();
    if (!s) return;
    const data: SavedPosition = {
      bookId: s.bookId,
      chapterIndex: s.chapterIndex,
      positionSecs: s.currentTimeSecs,
    };
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(data)); } catch { /* noop */ }
  }

  private loadPosition(): SavedPosition | null {
    try {
      const raw = localStorage.getItem(POSITION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private loadSpeed(): PlaybackSpeed {
    try {
      const raw = localStorage.getItem(SPEED_KEY);
      if (raw) {
        const n = parseFloat(raw);
        if ([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].includes(n)) return n as PlaybackSpeed;
      }
    } catch { /* noop */ }
    return 1;
  }

  private updateMediaSession(): void {
    if (!('mediaSession' in navigator)) return;
    const s = this.state();
    if (!s) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: s.chapterTitle,
      artist: s.authorName,
      album: s.bookTitle,
      artwork: s.coverArtUrl ? [{ src: s.coverArtUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
    });

    navigator.mediaSession.setActionHandler('play', () => this.togglePlayPause());
    navigator.mediaSession.setActionHandler('pause', () => this.togglePlayPause());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.previousChapter());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.nextChapter());
    navigator.mediaSession.setActionHandler('seekbackward', () => this.skipBack(15));
    navigator.mediaSession.setActionHandler('seekforward', () => this.skipForward(30));
  }
}
