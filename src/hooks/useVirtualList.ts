import { useState, useEffect, useRef, useMemo } from 'react';

export interface UseVirtualListOptions {
  itemHeight: number; // Altura de cada item em pixels
  containerHeight: number; // Altura do container visível
  overscan?: number; // Número de itens extras para renderizar (padrão: 3)
}

export interface VirtualItem {
  index: number;
  offsetTop: number;
}

/**
 * Hook para virtualização de listas longas
 * Renderiza apenas os itens visíveis + overscan para melhor performance
 * 
 * @example
 * const { virtualItems, totalHeight, containerProps } = useVirtualList({
 *   itemCount: 10000,
 *   itemHeight: 60,
 *   containerHeight: 600,
 *   overscan: 5
 * });
 * 
 * return (
 *   <div {...containerProps} style={{ height: 600, overflow: 'auto' }}>
 *     <div style={{ height: totalHeight, position: 'relative' }}>
 *       {virtualItems.map((virtualItem) => (
 *         <div
 *           key={virtualItem.index}
 *           style={{
 *             position: 'absolute',
 *             top: virtualItem.offsetTop,
 *             height: itemHeight,
 *             width: '100%',
 *           }}
 *         >
 *           {items[virtualItem.index]}
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * );
 */
export function useVirtualList<T = any>(
  itemCount: number,
  options: UseVirtualListOptions
) {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular altura total da lista
  const totalHeight = itemCount * itemHeight;

  // Calcular range visível
  const { startIndex, endIndex, virtualItems } = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

    // Adicionar overscan para scroll suave
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(itemCount - 1, visibleEnd + overscan);

    // Criar array de items virtuais
    const items: VirtualItem[] = [];
    for (let i = start; i <= end; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
      });
    }

    return {
      startIndex: start,
      endIndex: end,
      virtualItems: items,
    };
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

  // Handler de scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    containerProps: {
      ref: containerRef,
      style: {
        height: containerHeight,
        overflow: 'auto',
      },
    },
  };
}

/**
 * Hook simplificado para tabelas virtualizadas
 * Wrapper do useVirtualList com configurações otimizadas para tabelas
 */
export function useVirtualTable<T = any>(
  rowCount: number,
  rowHeight: number = 50,
  containerHeight: number = 600
) {
  return useVirtualList(rowCount, {
    itemHeight: rowHeight,
    containerHeight,
    overscan: 5, // Mais overscan para tabelas (scroll rápido)
  });
}
