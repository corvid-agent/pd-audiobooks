import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { librivoxInterceptor } from './librivox.interceptor';

describe('librivoxInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([librivoxInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should proxy LibriVox API requests through codetabs', () => {
    http.get('https://librivox.org/api/feed/audiobooks').subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('codetabs.com'));
    expect(req.request.url).toContain('codetabs.com');
    expect(req.request.url).toContain(encodeURIComponent('librivox.org'));
    req.flush({});
  });

  it('should append format=json to LibriVox API requests', () => {
    http.get('https://librivox.org/api/feed/audiobooks').subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('codetabs.com'));
    expect(req.request.url).toContain(encodeURIComponent('format=json'));
    req.flush({});
  });

  it('should set Accept header to application/json', () => {
    http.get('https://librivox.org/api/feed/audiobooks').subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('codetabs.com'));
    expect(req.request.headers.get('Accept')).toBe('application/json');
    req.flush({});
  });

  it('should not modify non-LibriVox requests', () => {
    http.get('https://example.com/api/data').subscribe();
    const req = httpMock.expectOne('https://example.com/api/data');
    expect(req.request.url).toBe('https://example.com/api/data');
    expect(req.request.headers.has('Accept')).toBe(false);
    req.flush({});
  });

  it('should not override existing format param', () => {
    http.get('https://librivox.org/api/feed/audiobooks?format=xml').subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('codetabs.com'));
    expect(req.request.url).toContain(encodeURIComponent('format=xml'));
    expect(req.request.url).not.toContain(encodeURIComponent('format=json'));
    req.flush({});
  });
});
