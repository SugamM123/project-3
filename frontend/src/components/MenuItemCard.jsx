import styles from "../styles/MenuItemCard.module.css";

/**
 * The MenuItemCard component displays a single menu item with an image and name.
 * It is designed for use in menu grids or lists.
 * 
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.itemName - The name of the menu item.
 * @param {string} props.imagePath - The path to the image representing the menu item.
 * @returns {JSX.Element} A styled card containing the menu item image and name.
 */
const MenuItemCard = ({ itemName, imagePath }) => {
  return (
    <div className={styles.itemCard}>
      <img src={imagePath} alt={itemName} />
      <p className={styles.text}>{itemName}</p>
    </div>
  );
};

export default MenuItemCard;
