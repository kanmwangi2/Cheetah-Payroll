/**
 * Virtualized List Component
 * High-performance list component for rendering large datasets
 */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useVirtualization } from '../../hooks/useVirtualization';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

interface VirtualizedListRef {
  scrollTo: (index: number) => void;
  scrollToTop: () => void;
}

function VirtualizedListInner<T>(
  props: VirtualizedListProps<T>,
  ref: React.Ref<VirtualizedListRef>
) {
  const { items, itemHeight, height, renderItem, className, overscan = 5 } = props;
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const { startIndex, visibleItems, totalHeight, offsetY, handleScroll } = useVirtualization({
    itemHeight,
    containerHeight: height,
    items,
    overscan,
  });

  useImperativeHandle(ref, () => ({
    scrollTo: (index: number) => {
      if (scrollElementRef.current) {
        scrollElementRef.current.scrollTop = index * itemHeight;
      }
    },
    scrollToTop: () => {
      if (scrollElementRef.current) {
        scrollElementRef.current.scrollTop = 0;
      }
    },
  }));

  return (
    <div
      ref={scrollElementRef}
      className={className}
      style={{
        height,
        overflowY: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{
                height: itemHeight,
                overflow: 'hidden',
              }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const VirtualizedList = forwardRef(VirtualizedListInner) as <T>(
  props: VirtualizedListProps<T> & { ref?: React.Ref<VirtualizedListRef> }
) => React.ReactElement;

export default VirtualizedList;
