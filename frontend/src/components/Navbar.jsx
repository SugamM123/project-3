import { useNavigate } from "react-router-dom";
import styles from "../styles/Navbar.module.css";
import NavbarButton from "./NavbarButton";
import { useEffect, useState } from "react";

/**
 * The Navbar component displays a top navigation bar with buttons for various routes.
 * It adapts its functionality based on the user's role (e.g., manager-specific buttons).
 * @component
 */
const Navbar = () => {
  /**
   * @type {Object|null} user - The currently signed-in user, or null if no user is signed in.
   * @property {boolean} user.is_manager - Indicates whether the user is a manager.
   * @property {string} user.first_name - The first name of the user.
   * @property {string} user.last_name - The last name of the user.
   */
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  /**
   * Signs out the current user by clearing their data from state and localStorage,
   * and redirects to the home page.
   * @function Navbar~handleSignOut
   */
  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    /**
     * Fetches the user data from localStorage on component mount.
     */
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className={styles.topBar}>
      <NavbarButton pathName={"/employee-order"} buttonName={"ORDER"} />
      <NavbarButton
        pathName={"/menu-board-noninteractive"}
        buttonName={"MENU-BOARD"}
      />
      {user && user.is_manager && (
        <>
          <NavbarButton pathName="/manage-inventory" buttonName="INVENTORY" />
          <NavbarButton pathName="/order-history" buttonName="HISTORY" />
          <NavbarButton pathName="/manage-employees" buttonName="EMPLOYEES" />
          <NavbarButton pathName="/manage-prices" buttonName="PRICES" />
          <NavbarButton pathName="/manage-menu" buttonName="MENU" />
          <NavbarButton pathName="/reports" buttonName="REPORTS" />
          <NavbarButton pathName="/restock" buttonName="RESTOCK" />
        </>
      )}

      <div className={styles.spacer} />
      <p>{user ? `${user.first_name} ${user.last_name}` : "Name"}</p>
      <div className={styles.signOutButton} onClick={handleSignOut}>
        <h3>Sign Out</h3>
      </div>
    </div>
  );
};

export default Navbar;
