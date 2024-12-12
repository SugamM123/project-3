import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/SubmitOrderScreen.module.css";
import TextWrap from "./TextWrap";

/**
 * The SubmitOrderScreen component allows customers to review their cart, add personal details, and submit their order.
 * It provides weather-related messages for a personalized checkout experience.
 * @component
 */
const SubmitOrderScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Cart and total price data passed from the previous screen.
   * @type {{cart: Array<Object>, total: number}}
   */
  const { cart, total } = location.state || { cart: [], total: 0 };

  /**
   * @type {string} customerName - The name of the customer submitting the order.
   */
  const [customerName, setCustomerName] = useState("");

  /**
   * @type {boolean} isSubmitting - Indicates whether the order is currently being submitted.
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * @type {string} note - Weather-based checkout message.
   */
  const [note, setNote] = useState("");

  useEffect(() => {
    /**
     * Fetches weather data and sets an appropriate checkout message.
     * @async
     * @function WeatherNote
     */
    const WeatherNote = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=30.628&longitude=-96.3344&current=temperature_2m,weather_code&hourly=temperature_2m&temperature_unit=fahrenheit&timezone=America%2FChicago"
        );
        const info = await response.json();
        const hour = new Date().getHours();
        const temperature = info.hourly.temperature_2m[hour];
        const weatherCode = info.current.weather_code;

        if (temperature < 65) {
          setNote(
            `It is chilly outside: ${temperature} degrees. Good thing your food is always hot! Enjoy!`
          );
        } else if (weatherCode === 1 || weatherCode === 0) {
          setNote(
            "What great weather to enjoy great food, clear skies and fresh food! What more could you want?!"
          );
        } else if (weatherCode >= 3 && weatherCode <= 99) {
          setNote(
            "Don't let grey skies keep you down, your food will surely turn that frown upside down.\n No matter the bad weather, this food is sure to brighten your day!"
          );
        } else {
          setNote("No matter the weather, your food will be great! Enjoy!");
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    WeatherNote();
  }, []);

  useEffect(() => {
    const savedTextSize = localStorage.getItem("textSizeMultiplier") || "1";
    document.documentElement.style.setProperty(
      "--text-size-multiplier",
      savedTextSize
    );
  }, []);

  /**
   * Renders an individual order item, formatted based on whether it is a combo or individual item.
   * @param {Object} item - The item to render.
   * @returns {JSX.Element} The rendered order item.
   */
  const renderOrderItem = (item) => {
    if (item.details) {
      return (
        <div className={styles.orderItem}>
          <div className={styles.itemDetails}>
            <h3>
              <TextWrap>{item.type}</TextWrap>
            </h3>
            <div className={styles.comboDetails}>
              {item.details.side && (
                <p>
                  <TextWrap>Side</TextWrap>:{" "}
                  <TextWrap>{item.details.side}</TextWrap>
                </p>
              )}
              {item.details.entree && (
                <p>
                  <TextWrap>Entree</TextWrap>:{" "}
                  <TextWrap>{item.details.entree}</TextWrap>
                </p>
              )}
              {item.details.entrees && (
                <p>
                  <TextWrap>Entrees</TextWrap>:{" "}
                  <TextWrap>{item.details.entrees.join(", ")}</TextWrap>
                </p>
              )}
            </div>
            <p className={styles.price}>${(item.price || 0).toFixed(2)}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.orderItem}>
          <div className={styles.itemDetails}>
            <h3>
              <TextWrap>{item.name}</TextWrap>
            </h3>
            {item.size && (
              <p>
                <TextWrap>Size</TextWrap>: <TextWrap>{item.size}</TextWrap>
              </p>
            )}
            <p className={styles.price}>${(item.price || 0).toFixed(2)}</p>
          </div>
        </div>
      );
    }
  };

  /**
   * Handles the order submission process.
   * Validates inputs and sends the order data to the backend.
   * @async
   * @function handleSubmit
   */
  const handleSubmit = async () => {
    if (!customerName.trim()) {
      alert("Please enter your name before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customer_name: customerName,
        order_date: new Date().toISOString(),
        employee_id: null,
        total_price: parseFloat(total),
        items: cart.map((item) => {
          if (item.details) {
            return {
              meal_type: item.type.toLowerCase(),
              meal_items: [
                ...(item.details.side ? [{ item_name: item.details.side }] : []),
                ...(item.details.entree
                  ? [{ item_name: item.details.entree }]
                  : []),
                ...(item.details.entrees
                  ? item.details.entrees.map((e) => ({ item_name: e }))
                  : []),
              ],
            };
          } else {
            let meal_type = "a la carte";
            if (
              ["Fountain Drink", "Sweet Tea", "Bottled Water"].includes(
                item.name
              )
            ) {
              meal_type = "drink";
            } else if (
              [
                "Chicken Egg Roll",
                "Veggie Spring Roll",
                "Apple Pie Roll",
              ].includes(item.name)
            ) {
              meal_type = "appetizer";
            }

            return {
              meal_type,
              meal_items: [{ item_name: item.name }],
            };
          }
        }),
      };

      const response = await axios.post(
        "https://project-3-team-0g-backend.onrender.com/submit-order",
        orderData
      );

      if (response.status === 201) {
        alert(`Order #${response.data.order_id} placed successfully!`);
        navigate("/customer");
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancels the order and navigates back to the customer screen.
   * @function handleCancel
   */
  const handleCancel = () => {
    navigate("/customer");
  };

  return (
    <div className={styles.container}>
      <h1>
        <TextWrap>Submit Order</TextWrap>
      </h1>
      <div className={styles.orderSummary}>
        <h2>
          <TextWrap>Order Summary</TextWrap>
        </h2>
        {cart.map((item, index) => (
          <div key={index}>{renderOrderItem(item)}</div>
        ))}
        {note && (
          <div>
            <p>
              <TextWrap>{note}</TextWrap>
            </p>
          </div>
        )}
        <div className={styles.total}>
          <h3>Total: ${total}</h3>
        </div>
      </div>
      <div className={styles.customerInfo}>
        <input
          type="text"
          placeholder="Enter your name..."
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className={styles.nameInput}
        />
      </div>
      <div className={styles.buttons}>
        <button className={styles.cancelButton} onClick={handleCancel}>
          <TextWrap>Cancel</TextWrap>
        </button>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <TextWrap>{isSubmitting ? "Submitting..." : "Submit Order"}</TextWrap>
        </button>
      </div>
    </div>
  );
};

export default SubmitOrderScreen;
