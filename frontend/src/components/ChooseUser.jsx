import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ChooseUser.module.css";
import logo from "../imgs/logo.svg";
import { useLanguageContext } from "../contexts/LanguageContext";

/**
 * The ChooseUser component allows users to select their role (customer or employee) 
 * and language preference.
 * @component
 */

/**
 * Functional component for choosing the user type and language.
 * @returns JSX element for choosing user type and language.
 */
const ChooseUser = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguageContext();


  /**
   * Handles navigation based on the selected user type.
   * @param {string} userType - The type of user, either "customer" or "employee".
   */
  const handleUserTypeSelect = (userType) => {
    if (userType === "customer") {
      navigate("/customer");
    } else if (userType === "employee") {
      navigate("/login");
    }
  };

    /**
   * Updates the application's language based on user selection.
   * @param {string} selectedLanguage - The selected language, e.g., "en" or "es".
   */

  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="Panda Express Logo" className={styles.logo} />
      </div>
      <div className={styles.userTypeButtons}>
        <button
          className={styles.userTypeButton}
          onClick={() => handleUserTypeSelect("customer")}
        >
          {language === "en" ? "Customer" : "Cliente"}
        </button>
        <button
          className={styles.userTypeButton}
          onClick={() => handleUserTypeSelect("employee")}
        >
          {language === "en" ? "Employee" : "Empleado"}
        </button>
      </div>
      <div className={styles.languageButtons}>
        <button
          className={`${styles.languageButton} ${
            language === "english" ? styles.active : ""
          }`}
          onClick={() => handleLanguageSelect("en")}
        >
          English
        </button>
        <button
          className={`${styles.languageButton} ${
            language === "spanish" ? styles.active : ""
          }`}
          onClick={() => handleLanguageSelect("es")}
        >
          Español
        </button>
      </div>
    </div>
  );
};

export default ChooseUser;
