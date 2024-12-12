import { useEffect, useState } from "react";
import styles from "../styles/EmployeeOrderScreen.module.css";
import ToggleButtonGroup from "./ToggleButtonGroup";
import Navbar from "./Navbar";
import OrderItem from "./OrderItem";
import axios from "axios";
import LoadingBackdrop from "./LoadingBackdrop";

const meals = [
  "Bowl",
  "Plate",
  "Bigger Plate",
  "Appetizer S",
  "Appetizer L",
  "A La Carte S",
  "A La Carte M",
  "A La Carte L",
  "Drink",
];

/**
 * Represents the Employee Order Screen component.
 * This component manages the state of loading prices, loading menu, and submitting order.
 * It also manages the state of entrees, premiums, sides, appetizers, and drinks.
 * Additionally, it contains a submit button to submit the order.
 * @returns The Employee Order Screen component JSX.
 */
const EmployeeOrderScreen = () => {
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const [entrees, setEntrees] = useState([]);
  const [premiums, setPremiums] = useState([]);
  const [sides, setSides] = useState([]);
  const [appetizers, setAppetizers] = useState([]);
  const [drinks, setDrinks] = useState([]);

  const [prices, setPrices] = useState({});

  const [mealToggled, setMealToggled] = useState(
    new Array(meals.length).fill(false)
  );
  const [entreeToggled, setEntreeToggled] = useState(
    new Array(entrees.length).fill(false)
  );
  const [sideToggled, setSideToggled] = useState(
    new Array(sides.length).fill(false)
  );
  const [appetizerToggled, setAppetizerToggled] = useState(
    new Array(appetizers.length).fill(false)
  );
  const [drinkToggled, setDrinkToggled] = useState(
    new Array(drinks.length).fill(false)
  );

  const [orderItemID, setOrderItemID] = useState(0);
  const [currentOrder, setCurrentOrder] = useState({});

  /**
   * Toggle the state of a specific item in the meal list.
   * @param {{number}} index - The index of the item to toggle.
   * @returns None
   */
  const handleMealToggle = (index) => {
    const newToggled = [...mealToggled];
    newToggled[index] = !newToggled[index];
    setMealToggled(newToggled);
  };

  const handleEntreeToggle = (index) => {
    const newToggled = [...entreeToggled];
    newToggled[index] = !newToggled[index];
    setEntreeToggled(newToggled);
  };

  const handleSideToggle = (index) => {
    const newToggled = [...sideToggled];
    newToggled[index] = !newToggled[index];
    setSideToggled(newToggled);
  };

  const handleAppetizerToggle = (index) => {
    const newToggled = [...appetizerToggled];
    newToggled[index] = !newToggled[index];
    setAppetizerToggled(newToggled);
  };

  const handleDrinkToggle = (index) => {
    const newToggled = [...drinkToggled];
    newToggled[index] = !newToggled[index];
    setDrinkToggled(newToggled);
  };

  const [customerName, setCustomerName] = useState("");

  const [error, setError] = useState("");

  /**
   * Returns an array of selected items based on the toggled array.
   * @param {Array} items - The array of items to filter.
   * @param {Array} toggled - An array of boolean values indicating which items are selected.
   * @returns {Array} An array of selected items.
   */
  const getSelectedItems = (items, toggled) =>
    items.filter((_, index) => toggled[index]);
  /**
   * Adds the selected items to the order based on the meal type chosen.
   * Validates the selected items based on the meal type and sets the order item details.
   * @returns None
   */
  const addToOrder = () => {
    setError("");
    const selectedMeals = getSelectedItems(meals, mealToggled);
    if (selectedMeals.length > 1) {
      setError(
        "Please select only one meal type at a time (Bowl, Plate, Bigger Plate, etc..)."
      );
      return;
    }
    const selectedMeal = selectedMeals[0];
    const selectedEntrees = getSelectedItems(entrees, entreeToggled);
    const selectedSides = getSelectedItems(sides, sideToggled);
    const selectedAppetizers = getSelectedItems(appetizers, appetizerToggled);
    const selectedDrinks = getSelectedItems(drinks, drinkToggled);
    let merged = [];
    if (!["Bowl", "Plate", "Bigger Plate"].includes(selectedMeal)) {
      merged = [
        ...selectedEntrees,
        ...selectedSides,
        ...selectedAppetizers,
        ...selectedDrinks,
      ];
    }

    let vOrder = false;

    switch (selectedMeal) {
      case "Bowl":
        vOrder =
          selectedSides.length === 1 &&
          selectedEntrees.length === 1 &&
          selectedAppetizers.length === 0 &&
          selectedDrinks.length === 0;
        break;
      case "Plate":
        vOrder =
          selectedSides.length === 1 &&
          selectedEntrees.length === 2 &&
          selectedAppetizers.length === 0 &&
          selectedDrinks.length === 0;
        break;
      case "Bigger Plate":
        vOrder =
          selectedSides.length === 1 &&
          selectedEntrees.length === 3 &&
          selectedAppetizers.length === 0 &&
          selectedDrinks.length === 0;
        break;
      case "A La Carte S":
        vOrder =
          selectedEntrees.length === 1 &&
          !(selectedEntrees.length && selectedSides.length) &&
          selectedAppetizers.length === 0 &&
          selectedDrinks.length === 0;
        break;
      case "A La Carte M":
        vOrder =
          (selectedEntrees.length === 1 || selectedSides.length === 1) &&
          !(selectedEntrees.length && selectedSides.length) &&
          selectedAppetizers.length === 0 &&
          selectedDrinks.length === 0;
        break;
      case "A La Carte L":
        vOrder =
          (selectedEntrees.length === 1 || selectedSides.length === 1) &&
          !(selectedEntrees.length && selectedSides.length) &&
          selectedAppetizers.length === 0 &&
          selectedDrinks.length === 0;
        break;
      case "Appetizer S":
        vOrder =
          selectedAppetizers.length === 1 &&
          selectedEntrees.length === 0 &&
          selectedSides.length === 0 &&
          selectedDrinks.length === 0;
        break;
      case "Appetizer L":
        vOrder =
          selectedAppetizers.length === 1 &&
          selectedEntrees.length === 0 &&
          selectedSides.length === 0 &&
          selectedDrinks.length === 0;
        break;
      case "Drink":
        if (
          selectedDrinks.length === 1 &&
          selectedEntrees.length === 0 &&
          selectedSides.length === 0 &&
          selectedAppetizers.length === 0
        ) {
          vOrder = true;
        }
        break;
      default:
        setError("Please select a valid meal.");
        return;
    }
    if (!vOrder) {
      setError("Invalid selection for the chosen meal type.");
      return;
    }
    let orderItem = {
      meal: selectedMeal,
      sides: selectedSides.length ? selectedSides : undefined,
      entrees: selectedEntrees.length ? selectedEntrees : undefined,
      appetizers: selectedAppetizers.length ? selectedAppetizers : undefined,
      drinks: selectedDrinks.length ? selectedDrinks : undefined,
      merged: merged,
      price: 0.0,
    };
    const item_price = getPrice(orderItem);
    orderItem.price = item_price;
    setCurrentOrder((prevState) => ({
      ...prevState,
      [orderItemID]: orderItem,
    }));
    setOrderItemID((prevOrderItemID) => prevOrderItemID + 1);
    resetSelections();
  };

  /**
   * Resets all the selections for meals, entrees, sides, appetizers, and drinks to false.
   * @returns None
   */
  const resetSelections = () => {
    setMealToggled(new Array(meals.length).fill(false));
    setEntreeToggled(new Array(entrees.length).fill(false));
    setSideToggled(new Array(sides.length).fill(false));
    setAppetizerToggled(new Array(appetizers.length).fill(false));
    setDrinkToggled(new Array(drinks.length).fill(false));
  };

  /**
   * Get the current timestamp in the format 'YYYY-MM-DD HH:mm:ss'.
   * @returns {string} The current timestamp in the specified format.
   */
  function getCurrentTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * useEffect hook that populates prices and menu items from an external API.
   * Sets loading states while fetching data and updates state with the retrieved data.
   * @returns None
   */
  useEffect(() => {
    /**
     * Asynchronously fetches prices from a remote API and populates the prices object.
     * @returns None
     */
    const populatePrices = async () => {
      try {
        setLoadingPrices(true);
        const response = await axios.get(
          "https://project-3-team-0g-backend.onrender.com/view-prices"
        );
        const pricesObject = response.data.reduce((acc, item) => {
          acc[item.name] = parseFloat(item.price);
          return acc;
        }, {});
        setPrices(pricesObject);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingPrices(false);
      }
    };
    /**
     * Populates the menu items by making an asynchronous call to a remote server.
     * Categorizes the items into different arrays based on their type (entree, premium, side, appetizer, drink).
     * Sets the state variables for each category of items.
     * Handles loading state and error handling.
     * @returns None
     */
    const populateMenu = async () => {
      try {
        setLoadingMenu(true);
        const response = await axios.get(
          "https://project-3-team-0g-backend.onrender.com/menu-items"
        );

        const entreeItems = [];
        const premiumItems = [];
        const sideItems = [];
        const appetizerItems = [];
        const drinkItems = [];

        response.data.forEach((item) => {
          if (item.type === "entree") {
            if (item.name.includes("PREMIUM")) {
              const regularName = item.name.replace("PREMIUM ", "");
              premiumItems.push(regularName);
              entreeItems.push(regularName); // Include the non-premium version in entrees
            } else {
              entreeItems.push(item.name);
            }
          } else if (item.type === "side") {
            sideItems.push(item.name);
          } else if (item.type === "appetizer") {
            appetizerItems.push(item.name);
          } else if (item.type === "drink") {
            drinkItems.push(item.name);
          }
        });

        setEntrees(entreeItems);
        setPremiums(premiumItems);
        setSides(sideItems);
        setAppetizers(appetizerItems);
        setDrinks(drinkItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoadingMenu(false);
      }
    };
    populatePrices();
    populateMenu();
  }, []);

  /**
   * Submits the current order to the server asynchronously.
   * Checks if there are orders to submit and if a customer name is entered.
   * Calculates the total cost of the order and prepares the order items for submission.
   * Constructs a JSON object with customer name, order date, employee ID, total price, and items.
   * Sends a POST request to the server with the order information.
   * Handles errors during submission and resets the order state after submission.
   * @returns None
   */
  const submitOrder = async () => {
    if (Object.keys(currentOrder).length === 0) {
      setError("No orders to submit.");
    } else if (customerName.length === 0) {
      setError("Please enter a customer name");
    } else {
      let totalCost = 0;
      let items = [];

      for (const [key, obj] of Object.entries(currentOrder)) {
        totalCost += obj["price"];

        let meal_items = [
          ...(obj["appetizers"] || []),
          ...(obj["drinks"] || []),
          ...(obj["entrees"] || []),
          ...(obj["sides"] || []),
        ].map((item) => ({ item_name: item }));

        items.push({
          meal_type: obj["meal"],
          meal_items: meal_items,
        });
      }
      const jsonObject = {
        customer_name: customerName,
        order_date: getCurrentTimestamp(),
        employee_id: JSON.parse(localStorage.getItem("user")).id,
        total_price: parseFloat(totalCost.toFixed(2)),
        items: items,
      };
      try {
        setSubmittingOrder(true);
        await axios.post(
          "https://project-3-team-0g-backend.onrender.com/submit-order",
          jsonObject
        );
      } catch (error) {
        console.error("Error submitting order:", error);
      } finally {
        setSubmittingOrder(false);
      }
      setCurrentOrder({});
      setOrderItemID(0);
      setCustomerName("");
      setError("");
    }
  };

  /**
   * Calculates the total price of a meal based on the meal object provided.
   * @param {{Object}} mealObj - The meal object containing information about the meal.
   * @returns The total price of the meal.
   */
  const getPrice = (mealObj) => {
    let price = 0.0;
    if (mealObj.meal === "Bowl") {
      price += prices["base_bowl"];
    }
    if (mealObj.meal === "Plate") {
      price += prices["base_plate"];
    }
    if (mealObj.meal === "Bigger Plate") {
      price += prices["base_bigger_plate"];
    }
    if (mealObj.meal === "Appetizer S") {
      price += prices["appetizer s"];
    }
    if (mealObj.meal === "Appetizer L") {
      price += prices["appetizer l"];
    }
    if (["Bowl", "Plate", "Bigger Plate"].includes(mealObj.meal)) {
      const premiumCount = mealObj.entrees.filter((entree) =>
        premiums.includes(entree)
      ).length;
      price += premiumCount * prices["norm prem"];
    }
    if (mealObj.drinks) {
      if (mealObj.drinks[0] === "Small Fountain Drink") {
        price = prices["ftn drk s"];
      }
      if (mealObj.drinks[0] === "Medium Fountain Drink") {
        price = prices["ftn drk m"];
      }
      if (mealObj.drinks[0] === "Large Fountain Drink") {
        price = prices["ftn drk l"];
      }
    }
    if (mealObj.meal === "A La Carte S") {
      if (premiums.includes(mealObj.entrees[0])) {
        price = prices["ala s prem"];
      } else {
        price = prices["ala s reg"];
      }
    }
    if (mealObj.meal === "A La Carte M") {
      if (mealObj.entrees) {
        if (premiums.includes(mealObj.entrees[0])) {
          price = prices["ala m prem"];
        } else {
          price = prices["ala m reg"];
        }
      } else {
        price = prices["ala m side"];
      }
    }
    if (mealObj.meal === "A La Carte L") {
      if (mealObj.entrees) {
        if (premiums.includes(mealObj.entrees[0])) {
          price = prices["ala l prem"];
        } else {
          price = prices["ala l reg"];
        }
      } else {
        price = prices["ala l side"];
      }
    }

    return price;
  };

  return (
    <>
      <Navbar />
      <LoadingBackdrop
        loading={loadingPrices || submittingOrder || loadingMenu}
      />
      <div className={styles.mainContainer}>
        {error && (
          <div className={styles.errorBox}>
            <p>{error}</p>
          </div>
        )}
        <div className={styles.buttonSection}>
          <h3>Choose Item:</h3>
          <ToggleButtonGroup
            items={meals}
            toggledState={mealToggled}
            handleToggle={handleMealToggle}
          />
          <h3>Choose Entrees:</h3>
          <ToggleButtonGroup
            items={entrees}
            toggledState={entreeToggled}
            handleToggle={handleEntreeToggle}
          />
          <h3>Choose Sides:</h3>
          <ToggleButtonGroup
            items={sides}
            toggledState={sideToggled}
            handleToggle={handleSideToggle}
          />
          <h3>Choose Appetizers:</h3>
          <ToggleButtonGroup
            items={appetizers}
            toggledState={appetizerToggled}
            handleToggle={handleAppetizerToggle}
          />
          <h3>Choose Drinks:</h3>
          <ToggleButtonGroup
            items={drinks}
            toggledState={drinkToggled}
            handleToggle={handleDrinkToggle}
          />
          <div className={styles.addToOrderButton} onClick={addToOrder}>
            <h2>Add To Order</h2>
          </div>
        </div>
        <div className={styles.currentOrderSection}>
          <div className={styles.orderBox}>
            <div className={styles.customerNameContainer}>
              <h3>Order for:</h3>
              <input
                type="text"
                placeholder="Enter customer name..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className={styles.orderItemsContainer}>
              {Object.entries(currentOrder).map(([orderId, item]) => (
                <OrderItem
                  key={orderId}
                  id={orderId}
                  mealType={item.meal}
                  entrees={item.entrees}
                  sides={item.sides}
                  other={item.merged[0]}
                  price={item.price}
                  setCurrentOrder={setCurrentOrder}
                />
              ))}
            </div>
            <div className={styles.submitContainer}>
              <div className={styles.submitButton} onClick={submitOrder}>
                <h1>Submit Order</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default EmployeeOrderScreen;
