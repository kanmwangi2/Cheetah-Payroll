/**
 * Virtualization Hook
 * Implements virtual scrolling for large lists to improve performance
 */

import React, { useState, useCallback, useMemo } from 'react';

interface VirtualizationConfig<T = unknown> {
  itemHeight: number;
  containerHeight: number;
  items: T[];
  overscan?: number;
}

interface VirtualizationResult<T = unknown> {
  startIndex: number;
  endIndex: number;
  visibleItems: T[];
  totalHeight: number;
  offsetY: number;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

export const useVirtualization = <T = unknown>({
  itemHeight,
  containerHeight,
  items,
  overscan = 5,
}: VirtualizationConfig<T>): VirtualizationResult<T> => {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const offsetY = useMemo(() => {
    return visibleRange.startIndex * itemHeight;
  }, [visibleRange.startIndex, itemHeight]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
};

export default useVirtualization;
