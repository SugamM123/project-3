import React, { useState, useEffect } from 'react';
import styles from '../styles/TextSizeControls.module.css';
import { useLocation } from 'react-router-dom';

/**
 * The Contrast component provides a soft contrast mode for customer-related routes.
 * It overlays the UI with a semi-transparent layer for enhanced accessibility.
 * @component
 */const Contrast = () => {
  /**
   * State to determine whether contrast mode is active.
   * The initial state is fetched from localStorage.
   * @type {boolean}
   */
  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem('softContrast') === 'true'
  });
  const location = useLocation();


  /**
   * Checks if the current route is customer-related.
   * @returns {boolean} True if the route is related to the customer.
   */
  const isCustomerRelatedRoute = () => {
    const customerRoutes = ['/customer', '/checkout', '/submit-order', '/combo-selection'];
    return customerRoutes.some(route => location.pathname.startsWith(route));
  };


  // overlay without affectign UI
  useEffect(() => {
    let overlay = document.getElementById('contrast-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'contrast-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '9999';
      overlay.style.transition = 'all 0.3s ease';
      document.body.appendChild(overlay);
    }


    // activate contrast/ deactivate contrast
    if (isActive && isCustomerRelatedRoute()) {
      overlay.style.backgroundColor = 'rgba(255, 249, 240, 0.1)';
      overlay.style.backdropFilter = 'brightness(0.95) sepia(0.15)';
    } else {
      overlay.style.backgroundColor = 'transparent';
      overlay.style.backdropFilter = 'none';
      document.body.style.removeProperty('background-color');
    }

    return () => {
      if (!isCustomerRelatedRoute()) {
        overlay.remove(); // cleanup
      }
    };
  }, [isActive, location]);

  /**
   * Toggles the soft contrast mode and updates localStorage.
   */
  const toggleContrast = () => {
    const newState = !isActive;
    setIsActive(newState);
    localStorage.setItem('softContrast', newState);
  };

  if (!isCustomerRelatedRoute()) {
    return null;
  }

  return (
    <button 
      className={`${styles.sizeButton} ${isActive ? styles.active : ''}`}
      onClick={toggleContrast}
      aria-label="Toggle soft contrast"
      style={{ position: 'fixed', bottom: '80px', left: '80px' }}
    >
      👁️
    </button>
  );
};

export default Contrast;