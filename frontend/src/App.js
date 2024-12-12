import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import EmployeeOrderScreen from "./components/EmployeeOrderScreen";
import MenuBoard from "./components/MenuBoard";
import ChooseUser from "./components/ChooseUser";
import Login from "./components/Login";
import CustomerScreen from "./components/CustomerScreen";
import InventoryScreen from "./components/InventoryScreen";
import ReportsScreen from "./components/ReportsScreen";
import PriceManagementScreen from "./components/PriceManagementScreen";
import EmployeeManagementScreen from "./components/EmployeeManagementScreen";
import OrderHistoryScreen from "./components/OrderHistoryScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import MenuManagementScreen from "./components/MenuManagementScreen";
import SubmitOrderScreen from "./components/SubmitOrderScreen";
import NewMenuNonInteractive from "./components/MenuBoardNoninteractive"; 
import RestockScreen from "./components/RestockScreen";

/**
 * The main App component that sets up routing for the application.
 * It includes both public and protected routes, with a `LanguageProvider` wrapping the application for global state management.
 * @component
 * @returns {JSX.Element} The main application component.
 */
function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MenuBoard />} />
          <Route path="/customer" element={<CustomerScreen />} />
          <Route path="/choose-user" element={<ChooseUser />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit-order" element={<SubmitOrderScreen />} />

          {/* Protected Routes */}
          <Route
            path="/employee-order"
            element={
              <ProtectedRoute>
                <EmployeeOrderScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-inventory"
            element={
              <ProtectedRoute>
                <InventoryScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-employees"
            element={
              <ProtectedRoute>
                <EmployeeManagementScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-prices"
            element={
              <ProtectedRoute>
                <PriceManagementScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-menu"
            element={
              <ProtectedRoute>
                <MenuManagementScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-history"
            element={
              <ProtectedRoute>
                <OrderHistoryScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restock"
            element={
              <ProtectedRoute>
                <RestockScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-board-noninteractive"
            element={
              <ProtectedRoute>
                <NewMenuNonInteractive />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
