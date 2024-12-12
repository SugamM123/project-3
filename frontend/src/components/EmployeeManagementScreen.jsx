import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  Button,
  Typography,
} from "@mui/material";
import LoadingBackdrop from "./LoadingBackdrop";
import GoogleSignUpButton from "./GoogleSignUpButton";

/**
 * Component for managing employees including adding, editing, and deleting employees.
 * @returns None
 */
const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleId, setGoogleId] = useState(null);

  /**
   * Set the email of the selected employee.
   * @param {{string}} email - The email address to set for the selected employee.
   * @returns None
   */
  const setEmail = (email) => {
    setSelectedEmployee((prevState) => ({
      ...prevState,
      email,
    }));
  };

  /**
   * Fetches a list of employees from a remote server and updates the state with the retrieved data.
   * @param {function} setEmployees - A function to set the state with the fetched employees data.
   * @returns {void}
   */
  const getEmployees = async (setEmployees) => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://project-3-team-0g-backend.onrender.com/employees"
      );
      const employees = response.data;

      setEmployees(
        employees.map((emp) => ({
          ...emp,
          isManager: emp.is_manager,
        }))
      );
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a new employee to the database using a POST request to the specified endpoint.
   * @param {{object}} employee - The employee object to be added.
   * @param {function} onSuccess - The callback function to be executed upon successful addition of the employee.
   * @returns None
   */
  const addEmployee = async (employee, onSuccess) => {
    try {
      const response = await axios.post(
        "https://project-3-team-0g-backend.onrender.com/employees",
        {
          ...employee,
          google_id: googleId,
        }
      );
      if (response.status === 201) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error adding employee:", err);
    }
  };

  /**
   * Deletes an employee with the given employeeId from the server.
   * @param {{number}} employeeId - The ID of the employee to delete.
   * @param {Function} onSuccess - The callback function to execute upon successful deletion.
   * @returns None
   */
  const deleteEmployee = async (employeeId, onSuccess) => {
    try {
      const response = await axios.delete(
        `https://project-3-team-0g-backend.onrender.com/employees/${employeeId}`
      );
      if (response.status === 200) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  useEffect(() => {
    getEmployees(setEmployees);
  }, []);

  /**
   * Handles the opening of a dialog for a specific employee.
   * @param {{object}} employee - The employee object to be selected.
   * @returns None
   */
  const handleOpen = (employee) => {
    setSelectedEmployee(employee);
    setIsAdding(false);
    setOpen(true);
  };

  /**
   * Handles the action of adding a new employee by setting the selected employee state
   * with default values, resetting the Google ID state, setting the isAdding state to true,
   * and opening the modal.
   * @returns None
   */
  const handleAddOpen = () => {
    setSelectedEmployee({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      is_manager: false,
      password: "",
    });
    setGoogleId(null);
    setIsAdding(true);
    setOpen(true);
  };

  /**
   * Closes the modal by setting open state to false, resetting selected employee, Google ID,
   * and the flag for adding mode.
   * @returns None
   */
  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
    setGoogleId(null);
    setIsAdding(false);
  };

  /**
   * Handles the deletion of an employee by setting loading state to true, deleting the employee
   * with the given employeeId, updating the list of employees, and setting loading state back to false.
   * @param {{number}} employeeId - The ID of the employee to be deleted.
   * @returns None
   */
  const handleDelete = async (employeeId) => {
    setLoading(true);
    await deleteEmployee(employeeId, () => {
      getEmployees(setEmployees);
    });
    setLoading(false);
  };

  /**
   * Updates an employee record with the provided data using a PUT request to the server.
   * @param {{object}} employee - The employee object to be updated.
   * @param {function} onSuccess - The callback function to be executed upon successful update.
   * @returns None
   */
  const updateEmployee = async (employee, onSuccess) => {
    try {
      setLoading(true);

      const response = await axios.put(
        `https://project-3-team-0g-backend.onrender.com/employees/${employee.id}`,
        employee
      );
      setLoading(false);

      if (response.status === 200) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error updating employee:", err);
    }
  };

  /**
   * Handles saving an employee by either adding a new employee or updating an existing one.
   * If adding a new employee, it calls the addEmployee function with the selectedEmployee,
   * then updates the list of employees and closes the modal.
   * If updating an existing employee, it calls the updateEmployee function with the selectedEmployee,
   * then updates the list of employees and closes the modal.
   * @returns None
   */
  const handleSave = async () => {
    if (isAdding) {
      setLoading(true);

      await addEmployee(selectedEmployee, () => {
        getEmployees(setEmployees);
        handleClose();
      });
      setLoading(false);
    } else {
      setLoading(true);

      await updateEmployee(selectedEmployee, () => {
        getEmployees(setEmployees);
        handleClose();
      });
      setLoading(false);
    }
  };

  /**
   * Update the selected employee object with a new value for a specific field.
   * @param {{string}} field - The field in the selected employee object to update.
   * @param {{any}} value - The new value to assign to the specified field.
   * @returns None
   */
  const handleChange = (field, value) => {
    setSelectedEmployee({ ...selectedEmployee, [field]: value });
  };

  return (
    <div>
      <LoadingBackdrop loading={loading} />
      <TableContainer
        component={Paper}
        style={{
          marginTop: "20px",
          maxHeight: "70vh", // Set a fixed height for the table container
          overflowY: "auto", // Enable vertical scrolling
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Is Manager</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.id}</TableCell>
                <TableCell>{employee.first_name}</TableCell>
                <TableCell>{employee.last_name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phone_number}</TableCell>
                <TableCell>{employee.is_manager ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpen(employee)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedEmployee && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{isAdding ? "Add Employee" : "Update Employee"}</span>
              <Button
                onClick={handleClose}
                style={{ minWidth: "auto", padding: 0, color: "red" }}
              >
                X
              </Button>
            </div>
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="First Name"
              fullWidth
              value={selectedEmployee.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
            <TextField
              margin="dense"
              label="Last Name"
              fullWidth
              value={selectedEmployee.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
            <TextField
              margin="dense"
              label="Phone Number"
              fullWidth
              value={selectedEmployee.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <Checkbox
                checked={selectedEmployee.is_manager}
                onChange={(e) => handleChange("is_manager", e.target.checked)}
              />
              <label>Is Manager</label>
            </div>
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              value={selectedEmployee.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <TextField
              margin="dense"
              label={
                googleId
                  ? "Password not needed if Google is authenticated"
                  : "Password"
              }
              type="password"
              fullWidth
              value={selectedEmployee.password || ""}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={!!googleId} // Disable field if googleId is set
              placeholder={
                googleId ? "Password not needed if Google is authenticated" : ""
              }
            />
            <Typography
              style={{
                textAlign: "center",
                margin: "5px 0",
                color: "lightgray",
                fontWeight: "bold",
              }}
            >
              or
            </Typography>
            <div style={{ marginTop: "10px" }}>
              <GoogleSignUpButton
                setGoogleId={setGoogleId}
                setEmail={setEmail}
              />
            </div>
            <Button
              onClick={handleSave}
              variant="contained"
              style={{
                marginTop: "20px",
                width: "100%",
                backgroundColor: "red",
                color: "white",
              }}
            >
              {isAdding ? "Create Employee" : "Save Changes"}
            </Button>
          </DialogContent>
        </Dialog>
      )}

      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "20px", marginLeft: "20px" }}
        onClick={handleAddOpen}
      >
        Add Employee
      </Button>
    </div>
  );
};

const EmployeeManagementScreen = () => {
  return (
    <>
      <Navbar />
      <EmployeeManagement />
    </>
  );
};

export default EmployeeManagementScreen;
