import React, { useState } from 'react';
import styles from '../styles/TextSizeControls.module.css';

/**
 * The TextSizeControls component provides buttons to adjust the text size of the application.
 * Changes are persisted in local storage and applied globally via CSS variables.
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onSizeChange - Callback function triggered when the text size is updated.
 * @returns {JSX.Element} A set of buttons to control text size.
 */
const TextSizeControls = ({ onSizeChange }) => {
  /**
   * @type {string} textSize - The current text size multiplier.
   */
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('textSizeMultiplier') || '1';
  });

  /**
   * Updates the text size globally and persists the value in local storage.
   * Calls the `onSizeChange` callback with the new size.
   * @param {string} newSize - The new text size multiplier.
   */
  const handleSizeChange = (newSize) => {
    setTextSize(newSize);
    localStorage.setItem('textSizeMultiplier', newSize);
    document.documentElement.style.setProperty('--text-size-multiplier', newSize);
    onSizeChange(newSize);
  };

  return (
    <div className={styles.controls}>
      {/* Decrease text size */}
      <button 
        className={styles.sizeButton} 
        onClick={() => handleSizeChange('0.8')}
      >
        A-
      </button>
      {/* Normal text size */}
      <button 
        className={styles.sizeButton} 
        onClick={() => handleSizeChange('1')}
      >
        A
      </button>
      {/* Increase text size */}
      <button 
        className={styles.sizeButton} 
        onClick={() => handleSizeChange('1.2')}
      >
        A+
      </button>
    </div>
  );
};

export default TextSizeControls;
