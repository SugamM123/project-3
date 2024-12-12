import React, { useState } from "react";
import styles from "../styles/CustomerScreen.module.css";
import TextWrap from "./TextWrap";

const sides = [
  { name: "Chow Mein", image: "/imgs/foods/chow-mein.png", calories: 490, allergens: "Wheat, Soy" },
  { name: "White Rice", image: "/imgs/foods/white-rice.png", calories: 380, allergens: "None" },
  { name: "Fried Rice", image: "/imgs/foods/fried-rice.png", calories: 530, allergens: "Wheat, Soy" },
  { name: "Super Greens", image: "/imgs/foods/super-greens.png", calories: 90, allergens: "None" },
];

const entrees = [
  { name: "Orange Chicken", image: "/imgs/foods/orange-chicken.png", calories: 420, allergens: "Wheat, Soy, Eggs, Milk" },
  { name: "Beijing Beef", image: "/imgs/foods/beijing-beef.png", calories: 690, allergens: "Wheat, Soy, Milk" },
  { name: "Sweet Fire Chicken Breast", image: "/imgs/foods/sweetfire-chicken.png", calories: 440, allergens: "Wheat, Soy" },
  { name: "Broccoli Beef", image: "/imgs/foods/broccoli-beef.png", calories: 120, allergens: "Wheat, Soy" },
  { name: "Grilled Teriyaki Chicken", image: "/imgs/foods/teriyaki-chicken.png", calories: 340, allergens: "Wheat, Soy" },
  { name: "Black Pepper Steak", image: "/imgs/foods/pepper-steak.png", calories: 180, allergens: "Wheat, Soy, Gluten", isPremium: true },
  { name: "Mushroom Chicken Breast", image: "/imgs/foods/mushroom-chicken.png", calories: 170, allergens: "Wheat, Soy" },
  { name: "Black Pepper Chicken", image: "/imgs/foods/black-pepper-chicken.png", calories: 280, allergens: "Wheat, Soy" },
  { name: "Sesame Chicken Breast", image: "/imgs/foods/sesame-chicken-breast.png", calories: 420, allergens: "Wheat, Soy, Sesame" },
  { name: "Bourbon Chicken", image: "/imgs/foods/bourbon-chicken.png", calories: 400, allergens: "Wheat, Soy, Sesame, Gluten, Eggs, Milk" },
  { name: "String Bean Chicken Breast", image: "/imgs/foods/string-bean-chicken.png", calories: 190, allergens: "Wheat, Soy" },
  { name: "Honey Walnut Shrimp", image: "/imgs/foods/honey-walnut-shrimp.png", calories: 370, allergens: "Wheat, Soy, Treenuts, Shellfish, Eggs, Milk", isPremium: true },
];

/**
 * Represents a customer bowl component where the user can select a side and an entree.
 * @param {{function}} onBack - Function to handle going back to the previous step.
 * @param {{function}} onConfirm - Function to handle confirming the selected side and entree.
 * @returns A customer bowl component with side and entree selection functionality.
 */
const CustomerBowl = ({ onBack, onConfirm }) => {
  const [selectedSide, setSelectedSide] = useState(null);
  const [selectedEntree, setSelectedEntree] = useState(null);

  /**
   * Updates the selected side based on the input side value.
   * @param {{string}} side - The side to set as selected.
   * @returns None
   */
  const handleSideSelection = (side) => setSelectedSide(side);
  /**
   * Handles the selection of an entree by updating the selected entree state based on the entree name.
   * If the selected entree is premium, it prefixes the name with "PREMIUM".
   * @param {{string}} entreeName - The name of the selected entree.
   * @returns None
   */
  const handleEntreeSelection = (entreeName) => {
    const entree = entrees.find(e => e.name === entreeName);
    setSelectedEntree(entree?.isPremium ? `PREMIUM ${entreeName}` : entreeName);
  };

  const selectedSideDetails = sides.find((side) => side.name === selectedSide);
  const selectedEntreeDetails = entrees.find((entree) => entree.name === selectedEntree);

  return (
    <div className={styles.mainContainer}>
      <h2><TextWrap>Bowl - Select 1 Side and 1 Entree</TextWrap></h2>
      <div className={styles.selectionContainer}>
        {/* Side Selection */}
        <div className={styles.sideSelection}>
          <h3><TextWrap>Sides</TextWrap></h3>
          <div className={styles.sideOptions}>
            {sides.map((side) => (
              <div
                key={side.name}
                className={`${styles.selectionImage} ${
                  selectedSide === side.name ? styles.selected : ""
                }`}
                onClick={() => handleSideSelection(side.name)}
              >
                <img src={side.image} alt={side.name} />
                <div><TextWrap>{side.name}</TextWrap></div>
                {selectedSide === side.name && (
                  <div className={styles.nutritionalInfo}>
                    <p><TextWrap>Calories: </TextWrap><TextWrap>{side.calories}</TextWrap></p>
                    <p><TextWrap>Allergens: </TextWrap><TextWrap>{side.allergens}</TextWrap></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Entree Selection */}
        <div className={styles.entreeSelection}>
          <h3><TextWrap>Entree</TextWrap></h3>
          <div className={styles.entreeOptions}>
            {entrees.map((entree) => (
              <div
                key={entree.name}
                className={`${styles.selectionImage} ${
                  selectedEntree === entree.name || selectedEntree === `PREMIUM ${entree.name}`
                    ? styles.selected 
                    : ""
                }`}
                onClick={() => handleEntreeSelection(entree.name)}
              >
                <img src={entree.image} alt={entree.name} />
                <div><TextWrap>{entree.name}</TextWrap></div>
                {(selectedEntree === entree.name || selectedEntree === `PREMIUM ${entree.name}`) && (
                  <div className={styles.nutritionalInfo}>
                    <p><TextWrap>Calories: </TextWrap><TextWrap>{entree.calories}</TextWrap></p>
                    <p><TextWrap>Allergens: </TextWrap><TextWrap>{entree.allergens}</TextWrap></p>
                    {entree.isPremium && <p className={styles.premiumTag}><TextWrap>Premium </TextWrap>(+$1.50)</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button onClick={onBack} className={styles.backButton}>
        <TextWrap>Back</TextWrap>
        </button>
        <button
          onClick={() =>
            onConfirm({ side: selectedSide, entree: selectedEntree })
          }
          className={styles.confirmButton}
          disabled={!selectedSide || !selectedEntree} // Disable until selections are made
        >
          <TextWrap>Confirm</TextWrap>
        </button>
      </div>
    </div>
  );
};

export default CustomerBowl;