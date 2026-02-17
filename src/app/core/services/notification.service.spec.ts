import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('show() adds toast with correct properties', () => {
    service.show('Test message', 'success');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Test message');
    expect(toasts[0].type).toBe('success');
    expect(typeof toasts[0].id).toBe('number');
  });

  it("defaults to 'info' type", () => {
    service.show('Info message');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('auto-dismisses after default 3000ms', () => {
    vi.useFakeTimers();
    service.show('Will vanish');
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(2999);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('auto-dismisses after custom duration', () => {
    vi.useFakeTimers();
    service.show('Custom duration', 'info', 5000);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(4999);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('dismiss() removes specific toast', () => {
    vi.useFakeTimers();
    service.show('Toast A', 'info', 99999);
    service.show('Toast B', 'success', 99999);
    expect(service.toasts().length).toBe(2);

    const idToRemove = service.toasts()[0].id;
    service.dismiss(idToRemove);

    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Toast B');
  });

  it('handles multiple toasts', () => {
    vi.useFakeTimers();
    service.show('First', 'info', 99999);
    service.show('Second', 'success', 99999);
    service.show('Third', 'error', 99999);

    expect(service.toasts().length).toBe(3);
    expect(service.toasts().map((t) => t.message)).toEqual(['First', 'Second', 'Third']);
  });

  it('assigns unique ids', () => {
    vi.useFakeTimers();
    service.show('A', 'info', 99999);
    service.show('B', 'info', 99999);
    service.show('C', 'info', 99999);

    const ids = service.toasts().map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });
});
