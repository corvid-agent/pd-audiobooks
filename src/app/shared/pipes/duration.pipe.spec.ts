import { describe, it, expect, beforeEach } from 'vitest';
import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  let pipe: DurationPipe;

  beforeEach(() => {
    pipe = new DurationPipe();
  });

  it('transforms 0 to "0:00" (long)', () => {
    expect(pipe.transform(0, 'long')).toBe('0:00');
  });

  it('transforms 0 to "0:00" (short)', () => {
    expect(pipe.transform(0, 'short')).toBe('0:00');
  });

  it('transforms 90 to "1m" (long)', () => {
    expect(pipe.transform(90, 'long')).toBe('1m');
  });

  it('transforms 90 to "1:30" (short)', () => {
    expect(pipe.transform(90, 'short')).toBe('1:30');
  });

  it('transforms 3661 to "1h 1m" (long)', () => {
    expect(pipe.transform(3661, 'long')).toBe('1h 1m');
  });

  it('transforms 3661 to "1:01:01" (short)', () => {
    expect(pipe.transform(3661, 'short')).toBe('1:01:01');
  });

  it('transforms 7200 to "2h 0m" (long)', () => {
    expect(pipe.transform(7200, 'long')).toBe('2h 0m');
  });

  it('transforms negative to "0:00"', () => {
    expect(pipe.transform(-100, 'long')).toBe('0:00');
  });

  it('transforms undefined/NaN gracefully', () => {
    expect(pipe.transform(undefined as unknown as number)).toBe('0:00');
    expect(pipe.transform(NaN)).toBe('0:00');
  });
});
