import { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import styles from "../styles/MenuManagementScreen.module.css";
import LoadingBackdrop from "./LoadingBackdrop";

/**
 * The MenuManagementScreen component provides a form to add new menu items.
 * It allows selecting the type of item, specifying its name, and marking it as premium if applicable.
 * @component
 */
const MenuManagementScreen = () => {
  /**
   * @type {string} - The type of the menu item being added (e.g., entree, drink, etc.).
   */
  const [type, setType] = useState("");

  /**
   * @type {string} - The name of the menu item being added.
   */
  const [name, setName] = useState("");

  /**
   * @type {boolean} - Whether the menu item is marked as premium (for entrees only).
   */
  const [isPremium, setIsPremium] = useState(false);

  /**
   * @type {string} - A feedback message displayed after the form is submitted.
   */
  const [message, setMessage] = useState("");

  /**
   * @type {boolean} - Indicates whether the form submission is in progress.
   */
  const [loading, setLoading] = useState(false);

  /**
   * Handles the form submission to add a new menu item.
   * Sends a POST request to the backend with the item details.
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Adjust name if "entree" and "Premium" are checked
    const finalName = type === "entree" && isPremium ? `PREMIUM ${name}` : name;

    // Data to be sent in the POST request
    const data = { name: finalName, type };

    try {
      setLoading(true);
      await axios.post(
        "https://project-3-team-0g-backend.onrender.com/add-menu-item",
        data
      );
      setMessage("Item added successfully!");
      setName("");
      setType("");
      setIsPremium(false);
    } catch (error) {
      console.error("Error adding item:", error);
      setMessage("Failed to add item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <LoadingBackdrop loading={loading} />
      <div className={styles.container}>
        <h2 className={styles.title}>Add Menu Item</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Item Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="type">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className={styles.select}
            >
              <option value="">Select type</option>
              <option value="entree">Entree</option>
              <option value="a la carte s">A La Carte S</option>
              <option value="a la carte m">A La Carte M</option>
              <option value="a la carte l">A La Carte L</option>
              <option value="appetizer s">Appetizer S</option>
              <option value="appetizer l">Appetizer L</option>
              <option value="drink">Drink</option>
            </select>
          </div>

          {type === "entree" && (
            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={() => setIsPremium((prev) => !prev)}
                  className={styles.checkbox}
                />
                Premium
              </label>
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            Submit
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>
      </div>
    </>
  );
};

export default MenuManagementScreen;
