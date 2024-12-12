import axios from "axios";
import styles from "../styles/MenuBoard.module.css";
import InfiniteCarousel from "./InfiniteCarousel";
import { useNavigate } from "react-router-dom";

/**
 * The MenuBoard component displays the menu items including entrees and sides.
 * It uses carousels to scroll through the menu and provides a navigation button to proceed.
 * @component
 */
const MenuBoard = () => {
  const navigate = useNavigate();

  /**
   * Array of entrees, each with a name and an image filename.
   * @constant
   * @type {Array.<[string, string]>}
   */
  const entrees = [
    ["Orange Chicken", "orange-chicken.png"],
    ["Beijing Beef", "beijing-beef.png"],
    ["Teriyaki Chicken", "teriyaki-chicken.png"],
    ["Honey Walnut Shrimp", "honey-walnut-shrimp.png"],
    ["Kung Pao Chicken", "kung-pao-chicken.png"],
    ["SweetFire Chicken", "sweetfire-chicken.png"],
    ["Mushroom Chicken", "mushroom-chicken.png"],
    ["String Bean Chicken", "string-bean-chicken.png"],
    ["Broccoli Beef", "broccoli-beef.png"],
    ["Sesame Chicken", "sesame-chicken-breast.png"],
  ];

  /**
   * Array of sides, each with a name and an image filename.
   * @constant
   * @type {Array.<[string, string]>}
   */
  const sides = [
    ["Chow Mein", "chow-mein.png"],
    ["White Rice", "white-rice.png"],
    ["Fried Rice", "fried-rice.png"],
    ["Super Greens", "super-greens.png"],
    ["Chicken Egg Roll", "chicken-eggroll.png"],
    ["Veggie Spring Roll", "veggie-springroll.png"],
    ["Cream Cheese Rangoon", "rangoon.png"],
    ["Apple Pie Roll", "apple-pie-roll.png"],
  ];

  /**
   * Handles the "Continue to Menu" button click.
   * Navigates the user to the "Choose User" screen.
   * @function MenuBoard~handleContinueClick
   * @async
   */
  const handleContinueClick = async () => {
    // Uncomment this to fetch data from the backend if needed
    // const response = await axios.get("https://project-3-team-0g-backend.onrender.com/");
    // console.log(response.data);
    navigate("/choose-user");
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.sideSectionContainer}>
        <InfiniteCarousel items={entrees} direction={"up"} />
      </div>
      <div className={styles.newMenuItemContainer}>
        <h3>NEW ITEM</h3>
        <h1 className={styles.newItemName}>
          Blazing <span>Bourbon Chicken</span>
        </h1>
        <img src="/imgs/foods/bourbon-chicken.png" alt="bourbon chicken" />
        <p>Crispy, spicy, and tangy</p>
        <div
          className={styles.toMenuButton}
          onClick={() => handleContinueClick()}
        >
          <h1>Continue to Menu</h1>
        </div>
      </div>
      <div className={styles.sideSectionContainer}>
        <InfiniteCarousel items={sides} direction={"down"} />
      </div>
    </div>
  );
};

export default MenuBoard;
