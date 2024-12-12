import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/InfiniteCarousel.module.css';
import MenuItemCard from './MenuItemCard';

/**
 * InfiniteCarousel component that displays a carousel of items that infinitely scrolls.
 * @param {{Array}} items - The array of items to display in the carousel.
 * @param {{string}} direction - The direction of the carousel scroll.
 * @returns The InfiniteCarousel component with the provided items scrolling infinitely.
 */
const InfiniteCarousel = ({ items, direction }) => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef(null);
  const animationFrameId = useRef(null);

  const scrollSpeed = 0.5;

  /**
   * Animates the scroll based on the direction and scroll speed.
   * @returns None
   */
  const animateScroll = () => {
    setScrollY((prevScrollY) => {
      const contentHeight = containerRef.current.scrollHeight / 2;
      let newScrollY = direction === "up" ? prevScrollY - scrollSpeed : prevScrollY + scrollSpeed;

      if (direction === "up" && newScrollY <= -contentHeight) {
        newScrollY += contentHeight;
      } else if (direction === "down" && newScrollY >= 0) {
        newScrollY -= contentHeight;
      }

      return newScrollY;
    });

    animationFrameId.current = requestAnimationFrame(animateScroll);
  };

  /**
   * useEffect hook that animates scrolling based on the direction provided.
   * @param {function} animateScroll - The function that animates the scrolling.
   * @param {string} direction - The direction of the scrolling animation.
   * @returns None
   */
  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [direction]);

  return (
    <div className={styles.carousel} ref={containerRef}>
      <div
        className={styles.carouselTrack}
        style={{ transform: `translateY(${scrollY}px)` }}
      >
        {items.concat(items).map((item, index) => (
          <MenuItemCard key={index} itemName={item[0]} imagePath={`/imgs/foods/${item[1]}`} />
        ))}
      </div>
    </div>
  );
};

export default InfiniteCarousel;
