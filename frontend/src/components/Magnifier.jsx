import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/TextSizeControls.module.css';
import { useLocation } from 'react-router-dom';

/**
 * The Magnifier component provides a zoomed-in view of elements under the cursor 
 * for customer-related routes. It includes a toggle button to activate or deactivate the magnifier.
 * @component
 */
const Magnifier = () => {
  /**
   * State to determine if the magnifier is active.
   * The initial state is fetched from localStorage.
   * @type {boolean}
   */
  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem('magnifierActive') === 'true';
  });

  /**
   * Tracks the current position of the cursor.
   * @type {{x: number, y: number}}
   */
  const [position, setPosition] = useState({ x: 0, y: 0 });

  /**
   * Reference to the magnifier lens element.
   * @type {React.MutableRefObject<HTMLDivElement|null>}
   */
  const magnifierRef = useRef(null);

  /**
   * The zoom level applied by the magnifier.
   * @constant
   * @type {number}
   */
  const zoomLevel = 1.5;

  const location = useLocation();

  /**
   * Determines if the current route is customer-related.
   * @function Magnifier~isCustomerRelatedRoute
   * @returns {boolean} True if the current route matches a customer-related path.
   */
  const isCustomerRelatedRoute = () => {
    const customerRoutes = ['/customer', '/checkout', '/submit-order', '/combo-selection'];
    return customerRoutes.some(route => location.pathname.startsWith(route));
  };

  useEffect(() => {
    /**
     * Handles the mousemove event to update the magnifier's position and content.
     * @function Magnifier~handleMouseMove
     * @param {MouseEvent} e - The mousemove event object.
     */
    const handleMouseMove = (e) => {
      if (!isActive) return;

      const x = e.clientX;
      const y = e.clientY;
      setPosition({ x, y });

      if (magnifierRef.current) {
        const magnifier = magnifierRef.current;

        // Find the element under the magnifier
        const elementUnderMagnifier = document.elementFromPoint(x, y);
        if (!elementUnderMagnifier) return;

        let targetElement = elementUnderMagnifier;
        while (
          targetElement &&
          !targetElement.offsetWidth &&
          !targetElement.offsetHeight &&
          targetElement !== document.body
        ) {
          targetElement = targetElement.parentElement;
        }

        // Clone content inside the magnifier lens
        const contentClone = targetElement.cloneNode(true);

        magnifier.innerHTML = '';
        magnifier.appendChild(contentClone);

        const rect = targetElement.getBoundingClientRect();
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;

        contentClone.style.position = 'absolute';
        contentClone.style.transform = `scale(${zoomLevel})`;
        contentClone.style.transformOrigin = 'center center';
        contentClone.style.left = `${-relativeX * zoomLevel + magnifier.offsetWidth / 2}px`;
        contentClone.style.top = `${-relativeY * zoomLevel + magnifier.offsetHeight / 2}px`;
        contentClone.style.width = `${rect.width}px`;
        contentClone.style.height = `${rect.height}px`;
      }
    };

    // Activate or deactivate magnifier based on state and route
    if (isActive && isCustomerRelatedRoute()) {
      document.addEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'default';
    };
  }, [isActive, location]);

  /**
   * Toggles the magnifier on or off and updates the localStorage state.
   * @function Magnifier~toggleMagnifier
   */
  const toggleMagnifier = () => {
    const newState = !isActive;
    setIsActive(newState);
    localStorage.setItem('magnifierActive', newState);
  };

  if (!isCustomerRelatedRoute()) {
    return null;
  }

  return (
    <>
      <button
        className={`${styles.sizeButton} ${isActive ? styles.active : ''}`}
        onClick={toggleMagnifier}
        aria-label="Toggle magnifier"
        style={{ position: 'fixed', bottom: '80px', left: '20px' }}
      >
        🔍
      </button>
      {isActive && (
        <div
          ref={magnifierRef}
          className={styles.magnifierLens}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            width: '200px',
            height: '200px',
            border: '2px solid #af0000',
            borderRadius: '50%',
            overflow: 'hidden',
            zIndex: 10000,
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        />
      )}
    </>
  );
};

export default Magnifier;
