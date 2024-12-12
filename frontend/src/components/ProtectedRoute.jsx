import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * The ProtectedRoute component restricts access to its children based on user authentication and roles.
 * If no user is found in localStorage, it redirects to the home page.
 * If a non-manager user is detected, it redirects to the employee order page.
 * 
 * @component
 * @param {Object} props - The component props.
 * @param {JSX.Element} props.children - The child components to render if the user is authorized.
 * @returns {JSX.Element|null} Returns the child components if authorized, otherwise redirects.
 */
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      navigate("/"); // Redirect to home if no user is found
    } else if (!JSON.parse(user).is_manager) {
      navigate("/employee-order"); // Redirect to employee order page for non-managers
    }
  }, [navigate]);

  if (!localStorage.getItem("user")) {
    return null; // Prevent rendering until navigation
  }

  return <>{children}</>;
};

export default ProtectedRoute;
