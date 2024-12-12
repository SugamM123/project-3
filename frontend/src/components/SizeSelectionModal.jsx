import React, { useState } from 'react';
import styles from "../styles/SizeSelectionModal.module.css";

/**
 * The SizeSelectionModal component provides a modal interface for selecting a size for a menu item.
 * It supports size selection and adding the item to a cart.
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.item - The menu item displayed in the modal.
 * @param {string} props.item.name - The name of the menu item.
 * @param {string} props.item.image - The image URL of the menu item.
 * @param {Function} props.onSizeSelect - Callback function triggered when a size is selected and confirmed.
 * @param {Function} props.onClose - Callback function triggered when the modal is closed.
 * @returns {JSX.Element} A modal for selecting the size of a menu item.
 */
const SizeSelectionModal = ({ item, onSizeSelect, onClose }) => {
  /**
   * @type {string|null} selectedSize - The currently selected size (e.g., 'Small', 'Medium', 'Large').
   */
  const [selectedSize, setSelectedSize] = useState(null);

  /**
   * Handles adding the item with the selected size to the cart.
   * Calls the `onSizeSelect` function with the selected size.
   * @function handleAddToCart
   */
  const handleAddToCart = () => {
    if (selectedSize) {
      onSizeSelect(selectedSize);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.sizeModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <div className={styles.itemDisplay}>
          <img src={item.image} alt={item.name} />
          <h2>{item.name}</h2>
        </div>
        <div className={styles.sizeOptions}>
          <button 
            className={`${styles.sizeButton} ${selectedSize === 'Small' ? styles.selected : ''}`}
            onClick={() => setSelectedSize('Small')}
          >
            Small
          </button>
          <button 
            className={`${styles.sizeButton} ${selectedSize === 'Medium' ? styles.selected : ''}`}
            onClick={() => setSelectedSize('Medium')}
          >
            Medium
          </button>
          <button 
            className={`${styles.sizeButton} ${selectedSize === 'Large' ? styles.selected : ''}`}
            onClick={() => setSelectedSize('Large')}
          >
            Large
          </button>
        </div>
        <div className={styles.buttonGroup}>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            disabled={!selectedSize}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeSelectionModal;
