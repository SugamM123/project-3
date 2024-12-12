import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/NavbarButton.module.css";
import TextWrap from "./TextWrap";

/**
 * The NavbarButton component represents a navigation button.
 * It highlights when the current route matches its destination and navigates to a specified path on click.
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.pathName - The target path to navigate to when the button is clicked.
 * @param {string} props.buttonName - The display name of the button.
 * @returns {JSX.Element} A styled navigation button.
 */
const NavbarButton = ({ pathName, buttonName }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className={`${styles.navButton} ${
        location.pathname === pathName ? styles.selected : ""
      }`}
      onClick={() => navigate(pathName)}
    >
      <h1>
        <TextWrap>{buttonName}</TextWrap>
      </h1>
    </div>
  );
};

export default NavbarButton;
