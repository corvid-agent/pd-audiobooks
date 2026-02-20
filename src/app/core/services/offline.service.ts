import { Injectable, signal, computed } from '@angular/core';

const CACHE_NAME = 'pd-audiobooks-offline-audio';
const STORAGE_KEY = 'pd-audiobooks-offline-chapters';

export interface DownloadProgress {
  chapterId: string;
  percent: number;
}

interface OfflineChapterRecord {
  bookId: string;
  chapterId: string;
  url: string;
  cachedAt: number;
}

@Injectable({ providedIn: 'root' })
export class OfflineService {
  /** Set of chapter IDs that have been fully cached */
  readonly downloadedChapterIds = signal<Set<string>>(new Set());

  /** Current download-in-progress state; null when idle */
  readonly activeDownload = signal<DownloadProgress | null>(null);

  /** Convenience: all downloaded records keyed by chapterId */
  private records = new Map<string, OfflineChapterRecord>();

  constructor() {
    this.loadRecords();
  }

  // ── public queries ──────────────────────────────────────────────

  isChapterDownloaded(chapterId: string): boolean {
    return this.downloadedChapterIds().has(chapterId);
  }

  downloadedCountForBook(bookId: string): number {
    let count = 0;
    for (const r of this.records.values()) {
      if (r.bookId === bookId) count++;
    }
    return count;
  }

  // ── download a single chapter ───────────────────────────────────

  async downloadChapter(bookId: string, chapterId: string, url: string): Promise<boolean> {
    if (this.isChapterDownloaded(chapterId)) return true;
    if (this.activeDownload()) return false; // already downloading something

    this.activeDownload.set({ chapterId, percent: 0 });

    try {
      const response = await fetch(url, { mode: 'cors', redirect: 'follow' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentLength = Number(response.headers.get('content-length') || '0');
      const reader = response.body?.getReader();

      if (!reader) {
        // Fallback: no streaming body — cache with the Cache API directly
        const fallbackResponse = await fetch(url, { mode: 'cors', redirect: 'follow' });
        const cache = await caches.open(CACHE_NAME);
        await cache.put(url, fallbackResponse);
        this.addRecord({ bookId, chapterId, url, cachedAt: Date.now() });
        this.activeDownload.set(null);
        return true;
      }

      // Stream the response and track progress
      const chunks: ArrayBuffer[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
        received += value.length;
        const percent = contentLength > 0
          ? Math.min(99, Math.round((received / contentLength) * 100))
          : 0;
        this.activeDownload.set({ chapterId, percent });
      }

      // Reassemble the body and store in the Cache API
      const blob = new Blob(chunks, {
        type: response.headers.get('content-type') || 'audio/mpeg',
      });
      const cachedResponse = new Response(blob, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': response.headers.get('content-type') || 'audio/mpeg',
          'Content-Length': String(blob.size),
        },
      });
      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, cachedResponse);

      this.addRecord({ bookId, chapterId, url, cachedAt: Date.now() });
      this.activeDownload.set({ chapterId, percent: 100 });

      // Brief flash at 100 % then clear
      setTimeout(() => this.activeDownload.set(null), 400);
      return true;
    } catch (err) {
      console.error('Offline download failed:', err);
      this.activeDownload.set(null);
      return false;
    }
  }

  // ── download all chapters of a book ────────────────────────────

  async downloadAllChapters(
    bookId: string,
    chapters: { id: string; listenUrl: string }[],
  ): Promise<number> {
    let downloaded = 0;
    for (const ch of chapters) {
      if (this.isChapterDownloaded(ch.id)) {
        downloaded++;
        continue;
      }
      const ok = await this.downloadChapter(bookId, ch.id, ch.listenUrl);
      if (ok) downloaded++;
    }
    return downloaded;
  }

  // ── remove cached chapter ──────────────────────────────────────

  async removeChapter(chapterId: string): Promise<void> {
    const record = this.records.get(chapterId);
    if (!record) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(record.url);
    } catch { /* noop */ }
    this.records.delete(chapterId);
    this.saveRecords();
    this.downloadedChapterIds.set(new Set(this.records.keys()));
  }

  async removeAllForBook(bookId: string): Promise<void> {
    const toRemove = [...this.records.values()].filter((r) => r.bookId === bookId);
    const cache = await caches.open(CACHE_NAME);
    for (const r of toRemove) {
      try { await cache.delete(r.url); } catch { /* noop */ }
      this.records.delete(r.chapterId);
    }
    this.saveRecords();
    this.downloadedChapterIds.set(new Set(this.records.keys()));
  }

  // ── resolve URL: return cached blob-URL or original ────────────

  async resolveAudioUrl(url: string): Promise<string> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) {
        const blob = await cached.blob();
        return URL.createObjectURL(blob);
      }
    } catch { /* fallthrough */ }
    return url;
  }

  // ── storage helpers ────────────────────────────────────────────

  private addRecord(record: OfflineChapterRecord): void {
    this.records.set(record.chapterId, record);
    this.saveRecords();
    this.downloadedChapterIds.set(new Set(this.records.keys()));
  }

  private saveRecords(): void {
    try {
      const arr = [...this.records.values()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch { /* noop */ }
  }

  private loadRecords(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr: OfflineChapterRecord[] = JSON.parse(raw);
        for (const r of arr) {
          this.records.set(r.chapterId, r);
        }
        this.downloadedChapterIds.set(new Set(this.records.keys()));
      }
    } catch { /* noop */ }
  }
}
