import { useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  autoPlayInterval = 5000,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  showArrows = true,
  showDots = true,
  gap = '2rem'
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsVisible, setItemsVisible] = useState(itemsPerView.desktop);

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

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);

  const startIndex = currentIndex * itemsVisible;
  const visibleItems = children.slice(startIndex, startIndex + itemsVisible);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden">
        <div
          className="flex transition-all duration-500 ease-in-out"
          style={{ gap }}
        >
          {visibleItems.map((child, index) => (
            <div
              key={startIndex + index}
              className="flex-shrink-0"
              style={{ width: `calc((100% - ${gap} * ${itemsVisible - 1}) / ${itemsVisible})` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {showArrows && totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all group z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700 group-hover:text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all group z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-white" />
          </button>
        </>
      )}

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
