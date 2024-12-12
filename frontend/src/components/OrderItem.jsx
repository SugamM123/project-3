import styles from "../styles/OrderItem.module.css";
import CloseIcon from "@mui/icons-material/Close";

/**
 * The OrderItem component displays details of an order item, including meal type, entrees, sides, and price.
 * It also provides a delete button to remove the item from the current order.
 * 
 * @component
 * @param {Object} props - The component props.
 * @param {string} [props.mealType="Bowl"] - The type of meal (e.g., Bowl, Plate, Bigger Plate).
 * @param {Array.<string>} [props.entrees=["Orange Chicken", "Beijing Beef"]] - List of entrees included in the meal.
 * @param {Array.<string>} [props.sides=["Chow Mein"]] - List of sides included in the meal.
 * @param {string} [props.other="Something"] - Additional details for non-standard meals.
 * @param {number} [props.price=1.0] - The price of the meal.
 * @param {Function} props.setCurrentOrder - Function to update the current order state.
 * @param {string} props.id - The unique identifier for the order item.
 * @returns {JSX.Element} A styled component displaying order item details.
 */
const OrderItem = ({
  mealType = "Bowl",
  entrees = ["Orange Chicken", "Beijing Beef"],
  sides = ["Chow Mein"],
  other = "Something",
  price = 1.0,
  setCurrentOrder,
  id
}) => {
  /**
   * Handles the deletion of the current order item.
   * Removes the item from the `setCurrentOrder` state using its unique ID.
   * @function OrderItem~handleDelete
   */
  const handleDelete = () => {
    setCurrentOrder(prevState => {
      const { [id]: _, ...newState } = prevState; 
      return newState;
    });
  };

  return (
    <div className={styles.mainContainer}>
      <div>
        <h4>{mealType} - ${price.toFixed(2)}</h4>
      </div>
      <div>
        {["Bowl", "Plate", "Bigger Plate"].includes(mealType) ? (
          <>
            <span>Entrees:</span>
            <span>{entrees.join(", ")}</span>
            <div />
            <span>Sides:</span>
            <span>{sides.join(", ")}</span>
          </>
        ) : (
          <>{other}</>
        )}
      </div>

      <div className={styles.deleteButton}>
        <CloseIcon
          fontSize="small"
          style={{ color: "red", margin: "5px", cursor: "pointer" }}
          onClick={handleDelete}
        />
      </div>
    </div>
  );
};

export default OrderItem;
