import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CustomerScreen.module.css";
import WeatherTimeDisplay from "./WeatherTimeDisplay";
import CustomerBowl from "./CustomerBowl";
import CustomerPlate from "./CustomerPlate";
import CustomerBigPlate from "./CustomerBigPlate";
import TextWrap from "./TextWrap";
import axios from "axios";
import { useLanguageContext } from "../contexts/LanguageContext";
import TextSizeControls from "./TextSizeControls";
import Magnifier from "./Magnifier";
import Contrast from "./Contrast";


/**
 * Configuration object for menu items, including categories, names, images, and details.
 * @constant
 * @type {Object}
 */

// Menu items configuration with categories and their respective items
const menuItems = {
  Combo: [
    {
      name: "Bowl (1 Side + 1 Entree)",
      image: "/imgs/meals/Bowl.png",
      isComboOption: true,
    },
    {
      name: "Plate (1 Side + 2 Entrees)",
      image: "/imgs/meals/Plate.png",
      isComboOption: true,
    },
    {
      name: "Bigger Plate (1 Side + 3 Entrees)",
      image: "/imgs/meals/BiggerPlate.png",
      isComboOption: true,
    },
  ],
  "A la Carte": [
    {
      name: "Orange Chicken",
      image: "/imgs/foods/orange-chicken.png",
      allergens: "Wheat, Soy, Eggs, Milk",
      nutrition: "Calories: 420, Fat: 14g, Carbs: 45g, Protein: 14g",
    },
    {
      name: "Beijing Beef",
      image: "/imgs/foods/beijing-beef.png",
      allergens: "Wheat, Soy, Milk",
      nutrition: "Calories: 690, Fat: 35g, Carbs: 59g, Protein: 21g",
    },
    {
      name: "Sweet Fire Chicken Breast",
      image: "/imgs/foods/sweetfire-chicken.png",
      allergens: "Wheat, Soy",
      nutrition: "Calories: 440, Fat: 15g, Carbs: 47g, Protein: 13g",
    },
    {
      name: "Broccoli Beef",
      image: "/imgs/foods/broccoli-beef.png",
      allergens: "Wheat, Soy",
      nutrition: "Calories: 120, Fat: 9g, Carbs: 12g, Protein: 10g",
    },
    {
      name: "Grilled Teriyaki Chicken",
      image: "/imgs/foods/teriyaki-chicken.png",
      allergens: "Wheat, Soy",
      nutrition: "Calories: 340, Fat: 13g, Carbs: 14g, Protein: 41g",
    },
    {
      name: "Black Pepper Steak",
      image: "/imgs/foods/pepper-steak.png",
      isPremium: true,
      allergens: "Wheat, Soy, Gluten",
      nutrition: "Calories: 180, Fat: 7g, Carbs: 10g, Protein: 19g",
    },
    {
      name: "Mushroom Chicken Breast",
      image: "/imgs/foods/mushroom-chicken.png",
      allergens: "Wheat, Soy",
      nutrition: "Calories: 170, Fat: 9g, Carbs: 11g, Protein: 12g",
    },
    {
      name: "Sesame Chicken Breast",
      image: "/imgs/foods/sesame-chicken-breast.png",
      allergens: "Wheat, Soy, Sesame",
      nutrition: "Calories: 420, Fat: 22g, Carbs: 40g, Protein: 16g",
    },
    {
      name: "Bourbon Chicken",
      image: "/imgs/foods/bourbon-chicken.png",
      allergens: "Wheat, Soy, Sesame, Gluten, Eggs, Milk",
      nutrition: "Calories: 400, Fat: 5g, Carbs: 40g, Protein: 14g",
    },
    {
      name: "String Bean Chicken Breast",
      image: "/imgs/foods/string-bean-chicken.png",
      allergens: "Wheat, Soy",
      nutrition: "Calories: 190, Fat: 9g, Carbs: 13g, Protein: 14g",
    },
    {
      name: "Honey Walnut Shrimp",
      image: "/imgs/foods/honey-walnut-shrimp.png",
      isPremium: true,
      allergens: "Wheat, Soy, Treenuts, Shellfish, Eggs, Milk",
      nutrition: "Calories: 370, Fat: 23g, Carbs: 35g, Protein: 13g",
    },
    {
      name: "Chow Mein",
      image: "/imgs/foods/chow-mein.png",
      allergens: "Wheat, Soy",
      nutrition: "Calories: 490, Fat: 22g, Carbs: 65g, Protein: 13g",
    },
    {
      name: "Fried Rice",
      image: "/imgs/foods/fried-rice.png",
      allergens: "Wheat, Soy",
      nutrition: "Calories: 530, Fat: 16g, Carbs: 82g, Protein: 12g",
    },
    {
      name: "White Steamed Rice",
      image: "/imgs/foods/white-rice.png",
      allergens: "None",
      nutrition: "Calories: 200, Fat: 0g, Carbs: 87g, Protein: 7g",
    },
    {
      name: "Super Greens",
      image: "/imgs/foods/super-greens.png",
      allergens: "None",
      nutrition: "Calories: 50, Fat: 3g, Carbs: 10g, Protein: 6g",
    },
  ],
  Appetizers: [
    {
      name: "Chicken Egg Roll",
      image: "/imgs/foods/chicken-eggroll.png",
      allergens: "Wheat, Soy, Eggs, Milk",
      nutrition: "Calories: 200, Fat: 10g, Carbs: 20g, Protein: 6g",
    },
    {
      name: "Veggie Spring Roll",
      image: "/imgs/foods/veggie-springroll.png",
      allergens: "Wheat, Soy, Milk",
      nutrition: "Calories: 160, Fat: 8g, Carbs: 27g, Protein: 3g",
    },
    {
      name: "Cream Cheese Rangoon",
      image: "/imgs/foods/rangoon.png",
      allergens: "Wheat, Eggs, Milk",
      nutrition: "Calories: 190, Fat: 8g, Carbs: 24g, Protein: 5g",
    },
    {
      name: "Apple Pie Roll",
      image: "/imgs/foods/apple-pie-roll.png",
      allergens: "Wheat",
      nutrition: "Calories: 150, Fat: 3g, Carbs: 30g, Protein: 2g",
    },
  ],
  Drinks: [
    { name: "Fountain Drink", image: "/imgs/foods/fountain.png" },
    { name: "Sweet Tea", image: "/imgs/foods/sweet-tea.png" },
    { name: "Bottled Water", image: "/imgs/foods/water.png" },
  ],
};

/**
 * Main component for the customer screen.
 * @component
 */

const CustomerScreen = () => {
  // State management for various UI controls and data
  const { language } = useLanguageContext();

  const navigate = useNavigate();
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Combo");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showSizeSelection, setShowSizeSelection] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [prices, setPrices] = useState({
    Combo: {},
    "A la Carte": {
      regular: {},
      premium: {},
    },
    Appetizers: {},
    Drinks: {},
  });
  const [textSizeMultiplier, setTextSizeMultiplier] = useState("1");

  // Initialize component by clearing user data and fetching prices
  useEffect(() => {
    localStorage.removeItem("user");
    fetchPrices();
  }, []);

   /**
   * Fetches menu prices from the backend and updates state.
   * @async
   */
  // Fetch menu prices from the backend
  const fetchPrices = async () => {
    try {
      console.log("Fetching prices...");
      const response = await axios.get(
        "https://project-3-team-0g-backend.onrender.com/get-customer-prices"
      );
      console.log("Received prices:", response.data);
      setPrices(response.data);
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  /**
   * Navigates the user back to the home screen.
   */
  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBack = () => setSelectedCombo(null);

  /**
   * Handles combo meal selection and adds to cart.
   * @param {Object} comboSelection - Selected combo meal details.
   */
  const handleConfirm = (comboSelection) => {
    // Check if any selected entree is premium
    const hasPremiumEntree =
      comboSelection.entrees?.some((entreeName) =>
        entreeName.includes("PREMIUM")
      ) ||
      comboSelection.entree?.includes("PREMIUM") ||
      false;

    // Get base combo price
    let comboPrice = prices.Combo[selectedCombo] || 0;

    // Add premium upcharge if applicable
    if (hasPremiumEntree) {
      comboPrice += prices.Combo.premiumUpcharge || 0;
    }

    const comboImage =
      menuItems.Combo.find((item) => item.name.startsWith(selectedCombo))
        ?.image || "/imgs/meals/default.png";

    const cartItem = {
      type: selectedCombo,
      details: comboSelection,
      price: comboPrice,
      id: Date.now(),
      image: comboImage,
    };

    setCart([...cart, cartItem]);
    setSelectedCombo(null);
  };

/**
   * Adds an individual item to the cart.
   * @param {Object} item - The item to add to the cart.
   * @param {string|null} size - The size of the item (if applicable).
   */  const addToCart = (item, size = null) => {
    let price;

    if (selectedCategory === "A la Carte") {
      price = item.isPremium
        ? prices["A la Carte"].premium[size]
        : prices["A la Carte"].regular[size];
    } else if (selectedCategory === "Appetizers") {
      price = prices["Appetizers"][size];
    } else if (selectedCategory === "Drinks") {
      price = prices.Drinks[size];
    }

    const cartItem = {
      ...item,
      id: Date.now(),
      size: size,
      quantity: 1,
      price: price,
      image: item.image,
    };
    setCart((prevCart) => [...prevCart, cartItem]);
    setShowCart(true);
  };

  // Handle clicks on menu items - either show combo options or size selection
  const handleItemClick = (item) => {
    if (item.isComboOption) {
      setSelectedCombo(item.name.split("(")[0].trim());
    } else if (
      ["A la Carte", "Appetizers", "Drinks"].includes(selectedCategory)
    ) {
      setSelectedItem(item);
      setShowSizeSelection(true);
    }
  };

  // rocess size selection for non-combo items
  const handleSizeSelect = (size) => {
    if (selectedItem) {
      addToCart(selectedItem, size);
    }
    setShowSizeSelection(false);
    setSelectedItem(null);
  };

  /**
   * Calculates the total cost of items in the cart.
   * @returns {string} - The total price as a string.
   */  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + (item.price || 0), 0)
      .toFixed(2);
  };

/**
   * Handles checkout and navigates to the order submission page.
   */  const handleCheckout = () => {
    if (cart.length === 0) return;

    navigate("/submit-order", {
      state: {
        cart: cart,
        total: calculateTotal(),
      },
    });
  };

  // Render appropriate combo selection component based on user choice
  if (selectedCombo === "Bowl") {
    return <CustomerBowl onBack={handleBack} onConfirm={handleConfirm} />;
  } else if (selectedCombo === "Plate") {
    return <CustomerPlate onBack={handleBack} onConfirm={handleConfirm} />;
  } else if (selectedCombo === "Bigger Plate") {
    return <CustomerBigPlate onBack={handleBack} onConfirm={handleConfirm} />;
  }

  return (
    <div className={styles.mainContainer}>
      {/* Header section with logo, weather display, and cart */}
      <div className={styles.header}>
        <img
          src="/imgs/logo.svg"
          alt="Panda Express Logo"
          className={styles.logo}
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        />
        <WeatherTimeDisplay />
        <div className={styles.cartContainer}>
          <button
            className={styles.cartButton}
            onClick={() => setShowCart(!showCart)}
          >
            <TextWrap>Cart</TextWrap> ({cart.length})
          </button>
          {showCart && cart.length > 0 && (
            <div className={styles.cartDropdown}>
              <div className={styles.cartItems}>
                {cart.map((item) =>
                  item.details ? (
                    // Render for combo meal (when item.details exists)
                    <div key={item.id} className={styles.cartItem}>
                      <img
                        src={item.image || "/imgs/meals/default.png"}
                        alt="Meal option"
                      />
                      <div className={styles.cartItemDetails}>
                        <h3>
                          <TextWrap>Combo Meal</TextWrap>
                        </h3>
                        {item.details.entrees && (
                          <p>
                            <strong>
                              <TextWrap>Entrees:</TextWrap>
                            </strong>{" "}
                            <TextWrap>{item.details.entrees.join(", ")}</TextWrap>
                          </p>
                        )}
                        {item.details.side && (
                          <p>
                            
                              <strong><TextWrap>Side</TextWrap>:</strong>{" "}
                            
                            <TextWrap>{item.details.side}</TextWrap>
                          </p>
                        )}
                        <p>${(item.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ) : (
                    // Render for non-combo items (when item.details does not exist)
                    <div key={item.id} className={styles.cartItem}>
                      <img src={item.image} alt={item.name} />
                      <div className={styles.cartItemDetails}>
                        <h3>{item.name}</h3>
                        {item.size && <p>Size: {item.size}</p>}
                        <p>${(item.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className={styles.cartTotal}>
                <h3>
                  <TextWrap>Total</TextWrap>: ${calculateTotal()}
                </h3>
                <button
                  className={styles.checkoutButton}
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  <TextWrap>Checkout</TextWrap>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.content}>
        {/* Category selection buttons */}
        <div className={styles.categories}>
          {Object.keys(menuItems).map((category) => (
            <button
              key={category}
              className={`${styles.categoryButton} ${
                selectedCategory === category ? styles.selected : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <TextWrap>{category}</TextWrap>
            </button>
          ))}
        </div>
        {/* Menu items grid display */}
        <div className={styles.menuItems}>
          {menuItems[selectedCategory].map((item) => (
            <div
              key={item.name}
              className={styles.menuItem}
              onClick={() => handleItemClick(item)}
            >
              <img src={item.image} alt={item.name} />
              <div className={styles.itemName}>
                <TextWrap>{item.name}</TextWrap>
              </div>
              {item.isNew && (
                <div className={styles.newTag}>
                  <TextWrap>New</TextWrap>
                </div>
              )}
              {item.isPremium && (
                <div className={styles.premiumTag}>
                  <TextWrap>Premium</TextWrap>
                </div>
              )}
              {item.allergens && (
                <p>
                  <TextWrap>Allergens:</TextWrap>
                  <TextWrap>{item.allergens}</TextWrap>
                </p>
              )}

              {item.nutrition && (
                <p>
                  <TextWrap>Nutrition:</TextWrap>
                  <TextWrap>{item.nutrition}</TextWrap>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Size selection modal for non-combo items */}
      {showSizeSelection && selectedItem && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowSizeSelection(false)}
        >
          <div
            className={styles.sizeModal}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className={styles.modalImage}
            />
            <h2>
              <TextWrap>{selectedItem.name}</TextWrap>
            </h2>
            <div className={styles.sizeOptions}>
              {selectedCategory === "A la Carte" && (
                <>
                  <button onClick={() => handleSizeSelect("Small")}>
                    Small - $
                    {selectedItem?.isPremium
                      ? prices["A la Carte"].premium.Small.toFixed(2)
                      : prices["A la Carte"].regular.Small.toFixed(2)}
                  </button>
                  <button onClick={() => handleSizeSelect("Medium")}>
                    Medium - $
                    {selectedItem?.isPremium
                      ? prices["A la Carte"].premium.Medium.toFixed(2)
                      : prices["A la Carte"].regular.Medium.toFixed(2)}
                  </button>
                  <button onClick={() => handleSizeSelect("Large")}>
                    Large - $
                    {selectedItem?.isPremium
                      ? prices["A la Carte"].premium.Large.toFixed(2)
                      : prices["A la Carte"].regular.Large.toFixed(2)}
                  </button>
                </>
              )}
              {selectedCategory === "Appetizers" && (
                <>
                  <button onClick={() => handleSizeSelect("Small")}>
                    Small - ${prices["Appetizers"].Small.toFixed(2)}
                  </button>
                  <button onClick={() => handleSizeSelect("Large")}>
                    Large - ${prices["Appetizers"].Large.toFixed(2)}
                  </button>
                </>
              )}
              {selectedCategory === "Drinks" && (
                <>
                  <button onClick={() => handleSizeSelect("Small")}>
                    Small - ${prices.Drinks.Small.toFixed(2)}
                  </button>
                  <button onClick={() => handleSizeSelect("Medium")}>
                    Medium - ${prices.Drinks.Medium.toFixed(2)}
                  </button>
                  <button onClick={() => handleSizeSelect("Large")}>
                    Large - ${prices.Drinks.Large.toFixed(2)}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <TextSizeControls onSizeChange={setTextSizeMultiplier} />
      <Magnifier />
      <Contrast />
    </div>
  );
};

export default CustomerScreen;
