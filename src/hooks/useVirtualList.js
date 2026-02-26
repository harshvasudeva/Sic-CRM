/**
 * useVirtualList - Renders only visible rows for large lists (C1).
 * Uses IntersectionObserver for lightweight virtualization.
 *
 * @param {Object} opts
 * @param {number} opts.itemCount - Total number of items
 * @param {number} opts.itemHeight - Estimated height of each row in px
 * @param {number} opts.overscan - Extra items to render above/below viewport (default 5)
 * @returns {{ containerRef, containerStyle, items: [{index, style}], totalHeight }}
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'

export default function useVirtualList({ itemCount = 0, itemHeight = 40, overscan = 5 }) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(400)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const totalHeight = itemCount * itemHeight

  const items = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(itemCount - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)

    const visible = []
    for (let i = startIndex; i <= endIndex; i++) {
      visible.push({
        index: i,
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      })
    }
    return visible
  }, [scrollTop, containerHeight, itemCount, itemHeight, overscan])

  const containerStyle = {
    overflow: 'auto',
    position: 'relative',
  }

  const innerStyle = {
    height: totalHeight,
    position: 'relative',
    width: '100%',
  }

  return {
    containerRef,
    containerStyle,
    innerStyle,
    items,
    totalHeight,
    onScroll: handleScroll,
  }
}
