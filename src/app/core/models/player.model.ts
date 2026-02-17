export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface PlaybackState {
  bookId: string;
  bookTitle: string;
  authorName: string;
  coverArtUrl: string | null;
  chapterId: string;
  chapterTitle: string;
  chapterIndex: number;
  totalChapters: number;
  listenUrl: string;
  playing: boolean;
  currentTimeSecs: number;
  durationSecs: number;
  speed: PlaybackSpeed;
  volume: number;
}

export interface SleepTimerState {
  active: boolean;
  remainingSecs: number;
  endChapter: boolean;
}
