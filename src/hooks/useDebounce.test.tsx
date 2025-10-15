import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDebounce, useDebouncedCallback } from './useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 300));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 300 });

    // Should still be initial (not debounced yet)
    expect(result.current).toBe('initial');

    // Wait for debounce
    await waitFor(() => expect(result.current).toBe('updated'), {
      timeout: 400,
    });
  });

  it('should reset timer on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'initial' } }
    );

    // Rapid changes
    rerender({ value: 'change1' });
    await new Promise((resolve) => setTimeout(resolve, 100));
    rerender({ value: 'change2' });
    await new Promise((resolve) => setTimeout(resolve, 100));
    rerender({ value: 'final' });

    // Should only debounce to the last value
    await waitFor(() => expect(result.current).toBe('final'), {
      timeout: 300,
    });
  });

  it('should handle different delay values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 100 } }
    );

    rerender({ value: 'new', delay: 100 });

    await waitFor(() => expect(result.current).toBe('new'), {
      timeout: 200,
    });
  });

  it('should work with different data types', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 42 });

    await waitFor(() => expect(result.current).toBe(42), {
      timeout: 200,
    });
  });

  it('should work with objects', async () => {
    const obj1 = { name: 'John' };
    const obj2 = { name: 'Jane' };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: obj1 } }
    );

    rerender({ value: obj2 });

    await waitFor(() => expect(result.current).toBe(obj2), {
      timeout: 200,
    });
  });
});

describe('useDebouncedCallback', () => {
  it('should debounce callback execution', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 200));

    // Call multiple times
    result.current('test1');
    result.current('test2');
    result.current('test3');

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Fast-forward time by 200ms
    vi.advanceTimersByTime(200);

    // Should only call once with last argument
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('test3');
    
    vi.useRealTimers();
  });

  it('should cancel previous timeout on new call', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 150));

    result.current('first');
    vi.advanceTimersByTime(50);
    result.current('second');
    vi.advanceTimersByTime(50);
    result.current('third');

    // Wait for final debounce
    vi.advanceTimersByTime(150);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
    
    vi.useRealTimers();
  });

  it('should handle multiple arguments', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    result.current('arg1', 'arg2', 'arg3');

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    
    vi.useRealTimers();
  });

  it('should work with different delay values', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ delay }) => useDebouncedCallback(callback, delay),
      { initialProps: { delay: 50 } }
    );

    result.current('test');

    vi.advanceTimersByTime(50);

    expect(callback).toHaveBeenCalledTimes(1);
    
    vi.useRealTimers();
  });

  it('should preserve callback arguments types', async () => {
    vi.useFakeTimers();
    const callback = vi.fn((num: number, str: string, bool: boolean) => {
      return { num, str, bool };
    });

    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    result.current(42, 'test', true);

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(42, 'test', true);
    
    vi.useRealTimers();
  });
});
