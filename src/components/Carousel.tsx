import { useState, useEffect, ReactNode, useRef } from 'react';

interface CarouselProps {
  children: ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  showArrows?: boolean;
  showDots?: boolean;
  gap?: string;
}

export function Carousel({
  children,
  autoPlay = false,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  showDots = true,
  gap = '2rem'
}: CarouselProps) {
  const [itemsVisible, setItemsVisible] = useState(itemsPerView.desktop);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsVisible(itemsPerView.mobile);
      } else if (width < 1024) {
        setItemsVisible(itemsPerView.tablet);
      } else {
        setItemsVisible(itemsPerView.desktop);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerView]);

  const totalSlides = Math.ceil(children.length / itemsVisible);
  const duplicatedChildren = [...children, ...children, ...children];

  useEffect(() => {
    if (!autoPlay || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let animationId: number;
    let scrollPosition = 0;
    const itemWidth = scrollContainer.scrollWidth / duplicatedChildren.length;
    const speed = 0.5;

    const animate = () => {
      scrollPosition += speed;

      if (scrollPosition >= itemWidth * children.length) {
        scrollPosition = 0;
      }

      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [autoPlay, children.length, duplicatedChildren.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full">
      <div className="overflow-hidden">
        <div
          ref={scrollRef}
          className="flex"
          style={{ gap, willChange: 'transform' }}
        >
          {duplicatedChildren.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ width: `calc((100% - ${gap} * ${itemsVisible - 1}) / ${itemsVisible})` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {showDots && totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-orange-500 w-8'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
