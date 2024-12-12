import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import styles from "../styles/PriceManagementScreen.module.css";
import LoadingBackdrop from "./LoadingBackdrop";

/**
 * The MenuManagementScreen component allows users to view and modify menu item prices.
 * It fetches the current prices from the backend, enables editing, and applies changes back to the server.
 * @component
 */
const MenuManagementScreen = () => {
  /**
   * @type {boolean} loadingPrices - Indicates whether prices are currently being fetched or updated.
   */
  const [loadingPrices, setLoadingPrices] = useState(false);

  /**
   * @type {Array.<{name: string, price: string}>} prices - The list of current prices fetched from the backend.
   */
  const [prices, setPrices] = useState([]);

  /**
   * @type {Array.<{name: string, price: string}>} editedPrices - The list of prices currently being edited by the user.
   */
  const [editedPrices, setEditedPrices] = useState([]);

  /**
   * @type {string|null} error - Error message to display if a fetch or update operation fails.
   */
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Fetches the current menu prices from the backend.
     * @async
     * @function fetchPrices
     */
    const fetchPrices = async () => {
      try {
        setLoadingPrices(true);
        const response = await axios.get(
          "https://project-3-team-0g-backend.onrender.com/view-prices"
        );
        const pricesWithFloat = response.data.map((item) => ({
          ...item,
          price: parseFloat(item.price).toFixed(2), // Initialize with two decimal places
        }));
        setPrices(pricesWithFloat);
        setEditedPrices(pricesWithFloat);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch prices.");
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchPrices();
  }, []);

  /**
   * Handles price input changes for a specific item.
   * @param {number} index - The index of the item being edited.
   * @param {string} newPrice - The new price value entered by the user.
   */
  const handlePriceChange = (index, newPrice) => {
    const updatedPrices = editedPrices.map((item, i) =>
      i === index ? { ...item, price: newPrice } : item
    );
    setEditedPrices(updatedPrices);
  };

  /**
   * Formats the price to two decimal places when the input field loses focus.
   * @param {number} index - The index of the item being formatted.
   */
  const handlePriceBlur = (index) => {
    const updatedPrices = editedPrices.map((item, i) => {
      if (i === index) {
        const priceValue = parseFloat(item.price);
        return {
          ...item,
          price: isNaN(priceValue) ? "0.00" : priceValue.toFixed(2),
        };
      }
      return item;
    });
    setEditedPrices(updatedPrices);
  };

  /**
   * Applies changes made to prices by sending the updated prices to the backend.
   * Only sends prices that have been modified.
   * @async
   * @function applyChanges
   */
  const applyChanges = async () => {
    const changedPrices = editedPrices
      .filter((item, index) => item.price !== prices[index].price)
      .map((item) => ({ name: item.name, price: parseFloat(item.price) }));

    if (changedPrices.length > 0) {
      try {
        setLoadingPrices(true);
        await axios.put(
          "https://project-3-team-0g-backend.onrender.com/modify-prices",
          changedPrices
        );
        setPrices(editedPrices);
        setError(null); // Clear any previous error message
      } catch (error) {
        console.error("Error applying changes:", error);
        setError("Failed to apply changes.");
      } finally {
        setLoadingPrices(false);
      }
    } else {
      setError("No changes made");
    }
  };

  return (
    <>
      <Navbar />
      <LoadingBackdrop loading={loadingPrices} />
      <div className={styles.mainContainer}>
        <div className={styles.priceContainer}>
          {error && <p className={styles.errorText}>{error}</p>}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {editedPrices.map((item, index) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>
                    <input
                      type="number"
                      value={item.price}
                      step="0.01"
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      onBlur={() => handlePriceBlur(index)} // Apply formatting on blur
                      className={styles.priceInput}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={applyChanges} className={styles.applyButton}>
            Apply Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default MenuManagementScreen;
