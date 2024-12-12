import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import LoadingBackdrop from "./LoadingBackdrop";
import {
  Box,
  Typography,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

/**
 * The OrderHistoryScreen component displays a list of past orders with options to filter and view details.
 * It allows for paginated viewing, dynamic filtering, and displays order details in a dialog.
 * @component
 */
const OrderHistoryScreen = () => {
  /**
   * @type {Array} orders - The list of orders retrieved from the backend.
   */
  const [orders, setOrders] = useState([]);

  /**
   * @type {boolean} loading - Indicates whether the data is currently loading.
   */
  const [loading, setLoading] = useState(true);

  /**
   * @type {string|null} error - The error message if fetching orders fails.
   */
  const [error, setError] = useState(null);

  /**
   * @type {Object|null} selectedOrder - The currently selected order for viewing details.
   */
  const [selectedOrder, setSelectedOrder] = useState(null);

  /**
   * @type {Array} orderDetails - The details of the currently selected order.
   */
  const [orderDetails, setOrderDetails] = useState([]);

  /**
   * @type {boolean} dialogOpen - Indicates whether the order details dialog is open.
   */
  const [dialogOpen, setDialogOpen] = useState(false);

  /**
   * @type {number} page - The current page in the paginated view.
   */
  const [page, setPage] = useState(0);

  /**
   * @type {number} rowsPerPage - The number of rows displayed per page in the paginated view.
   */
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /**
   * @type {string} customerFilter - Filter value for customer name.
   * @type {string} orderDateFilter - Filter value for order date.
   * @type {string} employeeFilter - Filter value for employee name.
   * @type {string} priceFilter - Filter value for total price.
   */
  const [customerFilter, setCustomerFilter] = useState("");
  const [orderDateFilter, setOrderDateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  /**
   * @type {Object} appliedFilters - The currently applied filters.
   * @property {string} customer - Filter for customer name.
   * @property {string} date - Filter for order date.
   * @property {string} employee - Filter for employee name.
   * @property {string} price - Filter for total price.
   */
  const [appliedFilters, setAppliedFilters] = useState({
    customer: "",
    date: "",
    employee: "",
    price: "",
  });

  /**
   * Fetches the list of orders from the backend.
   * Applies pagination and filtering based on the current state.
   * @async
   * @function fetchOrders
   */
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
        customer: appliedFilters.customer,
        date: appliedFilters.date,
        employee: appliedFilters.employee,
        price: appliedFilters.price,
      });

      const response = await fetch(
        `https://project-3-team-0g-backend.onrender.com/orders?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch order history");
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the details of a specific order by ID.
   * @async
   * @function fetchOrderDetails
   * @param {string} orderId - The ID of the order to fetch details for.
   */
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `https://project-3-team-0g-backend.onrender.com/orders/${orderId}/details`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }
      const data = await response.json();
      setOrderDetails(data.details);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setOrderDetails([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, appliedFilters]);

  /**
   * Handles changing the current page in the paginated view.
   * @param {Object} event - The event triggered by the page change.
   * @param {number} newPage - The new page number.
   */
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  /**
   * Handles changing the number of rows displayed per page.
   * Resets the page to 0 when changed.
   * @param {Object} event - The event triggered by the rows-per-page change.
   */
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Applies the currently entered filters.
   */
  const handleApplyFilters = () => {
    setAppliedFilters({
      customer: customerFilter,
      date: orderDateFilter,
      employee: employeeFilter,
      price: priceFilter,
    });
    setPage(0);
  };

  /**
   * Handles opening the dialog to view order details.
   * @param {string} orderId - The ID of the order to view details for.
   */
  const handleRowDoubleClick = async (orderId) => {
    setSelectedOrder(orderId);
    await fetchOrderDetails(orderId);
    setDialogOpen(true);
  };

  /**
   * Closes the order details dialog.
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setOrderDetails([]);
  };

  return (
    <>
      <Navbar />
      <LoadingBackdrop loading={loading} />
      <Box sx={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Order History
        </Typography>
        {error && (
          <Typography color="error" sx={{ marginBottom: "20px" }}>
            {error}
          </Typography>
        )}
        <Box display="flex" gap="10px" marginBottom="20px">
          <TextField
            variant="outlined"
            size="small"
            label="Customer Name"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Order Date"
            value={orderDateFilter}
            onChange={(e) => setOrderDateFilter(e.target.value)}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Employee Name"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          />
          <TextField
            variant="outlined"
            size="small"
            label="Total Price"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Customer Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Order Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Employee Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Total Price ($)</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  onDoubleClick={() => handleRowDoubleClick(order.id)}
                >
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    {new Date(order.order_date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {order.employee_first_name} {order.employee_last_name}
                  </TableCell>
                  <TableCell>{order.total_price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={-1}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Rows per page"
        />
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {orderDetails.length > 0 ? (
            orderDetails.map((meal, index) => (
              <Typography
                key={index}
                variant="body1"
                sx={{ marginBottom: "10px" }}
              >
                <strong>{meal.meal_type}:</strong> {meal.items.join(", ")}
              </Typography>
            ))
          ) : (
            <Typography>No details available for this order.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderHistoryScreen;
