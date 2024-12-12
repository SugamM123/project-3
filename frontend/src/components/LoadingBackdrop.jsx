import { ring } from "ldrs";
import styles from "../styles/LoadingBackdrop.module.css";

ring.register();

/**
 * Functional component that displays a loading backdrop with a spinning ring animation.
 * @param {{boolean}} loading - Determines whether the loading backdrop is visible or hidden.
 * @returns JSX element representing the loading backdrop.
 */
const LoadingBackdrop = ({ loading }) => {
  return (
    <div className={`${styles.backdrop} ${loading ? "" : styles.hidden}`}>
      <l-ring
        size="40"
        stroke="5"
        bg-opacity="0"
        speed="2"
        color="white"
      ></l-ring>
    </div>
  );
};

export default LoadingBackdrop;
