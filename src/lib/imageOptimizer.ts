import { useEffect, useRef, useState } from 'react';

/**
 * Converte uma imagem para WebP (se suportado pelo navegador)
 */
export function convertToWebP(url: string): string {
  // Verifica se o navegador suporta WebP
  const supportsWebP = () => {
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  };

  if (!supportsWebP()) {
    return url;
  }

  // Se for URL externa e tiver parâmetros para conversão
  if (url.includes('cloudinary') || url.includes('imgix')) {
    return `${url}?format=webp`;
  }

  return url;
}

/**
 * Gera srcset responsivo para uma imagem
 */
export function generateSrcSet(baseUrl: string, sizes: number[]): string {
  return sizes
    .map((size) => {
      if (baseUrl.includes('cloudinary')) {
        return `${baseUrl.replace('/upload/', `/upload/w_${size}/`)} ${size}w`;
      }
      if (baseUrl.includes('imgix')) {
        return `${baseUrl}?w=${size} ${size}w`;
      }
      return `${baseUrl} ${size}w`;
    })
    .join(', ');
}

/**
 * Gera um placeholder blur (low quality image placeholder)
 */
export function generateBlurPlaceholder(url: string): string {
  if (url.includes('cloudinary')) {
    return url.replace('/upload/', '/upload/w_20,q_10,e_blur:1000/');
  }
  if (url.includes('imgix')) {
    return `${url}?w=20&q=10&blur=50`;
  }
  return url;
}

/**
 * Hook para lazy loading de imagens com IntersectionObserver
 * 
 * @example
 * const { ref, isLoaded, error } = useLazyImage('/image.jpg');
 * 
 * return (
 *   <div ref={ref}>
 *     {isLoaded && <img src="/image.jpg" alt="Image" />}
 *     {!isLoaded && <div>Loading...</div>}
 *   </div>
 * );
 */
export function useLazyImage(src: string, options?: { threshold?: number; rootMargin?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    // Criar observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            
            // Carregar imagem
            const tempImg = new Image();
            tempImg.onload = () => {
              img.src = src;
              setIsLoaded(true);
              setError(false);
            };
            tempImg.onerror = () => {
              setError(true);
              setIsLoaded(false);
            };
            tempImg.src = src;

            // Parar de observar após carregar
            if (observerRef.current) {
              observerRef.current.unobserve(img);
            }
          }
        });
      },
      {
        threshold: options?.threshold ?? 0.01,
        rootMargin: options?.rootMargin ?? '50px', // Começar a carregar 50px antes
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, options?.threshold, options?.rootMargin]);

  return { ref: imgRef, isLoaded, error };
}

/**
 * Preload de imagem crítica (above the fold)
 * Use para imagens que devem carregar imediatamente
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch preload de múltiplas imagens
 */
export async function preloadImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => preloadImage(url)));
}
