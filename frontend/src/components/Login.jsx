import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import axios from "axios";
import LoadingBackdrop from "./LoadingBackdrop";
import GoogleLoginButton from "./GoogleLoginButton";

/**
 * Represents a Login component that allows users to log in with their email and password.
 * @returns JSX element containing the login form and Google login button.
 */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/employee-order");
    }
  }, []);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        "https://project-3-team-0g-backend.onrender.com/verify-login",
        {
          email: email,
          password: password,
        }
      );

      if (response.data) {
        const userData = {
          id: response.data.id,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          // email: response.data.email,
          // phone_number: response.data.phone_number,
          is_manager: response.data.is_manager,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/employee-order");
        setError(null);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <LoadingBackdrop loading={loading} />
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>Employee Login</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Login
        </button>
        <div className={styles.separator}>
          <span>or</span>
        </div>
        <GoogleLoginButton setError={setError} setLoading={setLoading} />
      </form>
    </div>
  );
}

export default Login;
