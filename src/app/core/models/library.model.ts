export interface BookmarkItem {
  bookId: string;
  addedAt: number;
}

export interface ListeningHistoryItem {
  bookId: string;
  lastPlayedAt: number;
  lastChapterId: string;
  lastPositionSecs: number;
  totalListenedSecs: number;
  completed: boolean;
}

export interface UserLibrary {
  bookmarks: BookmarkItem[];
  history: ListeningHistoryItem[];
  favorites: string[];
}
