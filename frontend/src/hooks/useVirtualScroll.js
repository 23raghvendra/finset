import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Virtual scrolling hook for efficient rendering of large lists
 * Uses Intersection Observer for dynamic loading
 */
export const useVirtualScroll = (items, options = {}) => {
  const {
    itemHeight = 60,
    overscan = 5,
    containerHeight = 600
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState(containerHeight);

  // Calculate visible range
  const { startIndex, endIndex, visibleItems, offsetY, totalHeight } = useMemo(() => {
    const totalCount = items.length;
    const totalHeight = totalCount * itemHeight;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerSize / itemHeight) + overscan * 2;
    const endIndex = Math.min(totalCount, startIndex + visibleCount);
    
    const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      virtualIndex: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight
      }
    }));

    const offsetY = startIndex * itemHeight;

    return { startIndex, endIndex, visibleItems, offsetY, totalHeight };
  }, [items, scrollTop, itemHeight, overscan, containerSize]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // Update container size on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    setContainerSize(container.clientHeight);

    return () => resizeObserver.disconnect();
  }, []);

  return {
    containerRef,
    containerProps: {
      ref: containerRef,
      onScroll: handleScroll,
      style: {
        overflow: 'auto',
        position: 'relative',
        height: containerHeight
      }
    },
    innerProps: {
      style: {
        height: totalHeight,
        position: 'relative'
      }
    },
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    scrollTo: (index) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    },
    scrollToTop: () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  };
};

/**
 * Infinite scroll hook for loading more data as user scrolls
 */
export const useInfiniteScroll = (loadMore, options = {}) => {
  const { threshold = 100, hasMore = true, loading = false } = options;
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (loading || !hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        rootMargin: `${threshold}px`
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading, threshold]);

  return { sentinelRef };
};

export default useVirtualScroll;
