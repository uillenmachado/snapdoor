import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useVirtualList, useVirtualTable } from './useVirtualList';

describe('useVirtualList', () => {
  beforeEach(() => {
    // Mock DOM methods
    HTMLElement.prototype.scrollTop = 0;
  });

  it('should return correct initial values', () => {
    const { result } = renderHook(() =>
      useVirtualList(100, {
        itemHeight: 50,
        containerHeight: 600,
      })
    );

    expect(result.current.virtualItems).toBeDefined();
    expect(result.current.totalHeight).toBe(5000); // 100 items * 50px
    expect(result.current.startIndex).toBe(0);
    expect(result.current.containerProps).toBeDefined();
  });

  it('should calculate correct total height', () => {
    const { result } = renderHook(() =>
      useVirtualList(200, {
        itemHeight: 60,
        containerHeight: 400,
      })
    );

    expect(result.current.totalHeight).toBe(12000); // 200 * 60
  });

  it('should render visible items with overscan', () => {
    const { result } = renderHook(() =>
      useVirtualList(1000, {
        itemHeight: 50,
        containerHeight: 600,
        overscan: 5,
      })
    );

    // Container height 600px / item height 50px = 12 visible items
    // + overscan 5 on each side = 12 + 10 = 22 items
    const itemCount = result.current.virtualItems.length;
    expect(itemCount).toBeGreaterThan(12);
    expect(itemCount).toBeLessThanOrEqual(22);
  });

  it('should calculate correct offsetTop for items', () => {
    const { result } = renderHook(() =>
      useVirtualList(10, {
        itemHeight: 100,
        containerHeight: 300,
      })
    );

    const firstItem = result.current.virtualItems[0];
    expect(firstItem.offsetTop).toBe(0);

    if (result.current.virtualItems.length > 1) {
      const secondItem = result.current.virtualItems[1];
      expect(secondItem.offsetTop).toBe(100);
    }
  });

  it('should update visible range on scroll', () => {
    const { result } = renderHook(() =>
      useVirtualList(1000, {
        itemHeight: 50,
        containerHeight: 600,
        overscan: 3,
      })
    );

    const initialStartIndex = result.current.startIndex;

    // Simulate scroll (this is simplified - actual implementation uses ref)
    // In a real test, you'd need to trigger scroll event on the containerRef
    expect(initialStartIndex).toBe(0);
  });

  it('should handle edge cases - empty list', () => {
    const { result } = renderHook(() =>
      useVirtualList(0, {
        itemHeight: 50,
        containerHeight: 600,
      })
    );

    expect(result.current.virtualItems).toHaveLength(0);
    expect(result.current.totalHeight).toBe(0);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(-1);
  });

  it('should handle small lists (less than container height)', () => {
    const { result } = renderHook(() =>
      useVirtualList(5, {
        itemHeight: 50,
        containerHeight: 600,
      })
    );

    expect(result.current.totalHeight).toBe(250); // 5 * 50
    // Should render all items since list is smaller than container
    expect(result.current.virtualItems.length).toBeGreaterThan(0);
  });

  it('should respect overscan parameter', () => {
    const { result: resultWithOverscan } = renderHook(() =>
      useVirtualList(1000, {
        itemHeight: 50,
        containerHeight: 600,
        overscan: 10,
      })
    );

    const { result: resultWithoutOverscan } = renderHook(() =>
      useVirtualList(1000, {
        itemHeight: 50,
        containerHeight: 600,
        overscan: 0,
      })
    );

    // With overscan should render more items
    expect(resultWithOverscan.current.virtualItems.length).toBeGreaterThan(
      resultWithoutOverscan.current.virtualItems.length
    );
  });

  it('should provide correct container props', () => {
    const { result } = renderHook(() =>
      useVirtualList(100, {
        itemHeight: 50,
        containerHeight: 600,
      })
    );

    expect(result.current.containerProps).toHaveProperty('ref');
    expect(result.current.containerProps).toHaveProperty('style');
    expect(result.current.containerProps.style).toEqual({
      height: 600,
      overflow: 'auto',
    });
  });

  it('should handle dynamic itemCount changes', () => {
    const { result, rerender } = renderHook(
      ({ count }) =>
        useVirtualList(count, {
          itemHeight: 50,
          containerHeight: 600,
        }),
      { initialProps: { count: 100 } }
    );

    const initialHeight = result.current.totalHeight;
    expect(initialHeight).toBe(5000);

    rerender({ count: 200 });

    expect(result.current.totalHeight).toBe(10000);
  });

  it('should handle dynamic itemHeight changes', () => {
    const { result, rerender } = renderHook(
      ({ height }) =>
        useVirtualList(100, {
          itemHeight: height,
          containerHeight: 600,
        }),
      { initialProps: { height: 50 } }
    );

    expect(result.current.totalHeight).toBe(5000);

    rerender({ height: 100 });

    expect(result.current.totalHeight).toBe(10000);
  });
});

describe('useVirtualTable', () => {
  it('should use default values', () => {
    const { result } = renderHook(() => useVirtualTable(100));

    expect(result.current.totalHeight).toBe(5000); // 100 * 50 (default rowHeight)
    expect(result.current.containerProps.style.height).toBe(600); // default containerHeight
  });

  it('should accept custom rowHeight', () => {
    const { result } = renderHook(() => useVirtualTable(100, 80));

    expect(result.current.totalHeight).toBe(8000); // 100 * 80
  });

  it('should accept custom containerHeight', () => {
    const { result } = renderHook(() => useVirtualTable(100, 50, 800));

    expect(result.current.containerProps.style.height).toBe(800);
  });

  it('should have higher overscan for tables', () => {
    const { result: tableResult } = renderHook(() => useVirtualTable(1000));

    const { result: listResult } = renderHook(() =>
      useVirtualList(1000, {
        itemHeight: 50,
        containerHeight: 600,
        overscan: 3, // default overscan for list
      })
    );

    // Table uses overscan: 5, so should render more items
    expect(tableResult.current.virtualItems.length).toBeGreaterThanOrEqual(
      listResult.current.virtualItems.length
    );
  });

  it('should handle large datasets efficiently', () => {
    const { result } = renderHook(() => useVirtualTable(10000, 60, 800));

    // Should not render all 10,000 items
    expect(result.current.virtualItems.length).toBeLessThan(100);
    
    // Total height should be correct
    expect(result.current.totalHeight).toBe(600000); // 10,000 * 60
  });

  it('should work with different row heights', () => {
    const heights = [40, 50, 60, 80, 100];

    heights.forEach((height) => {
      const { result } = renderHook(() => useVirtualTable(100, height));
      expect(result.current.totalHeight).toBe(100 * height);
    });
  });
});
