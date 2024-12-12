import React, { useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import Navbar from "./Navbar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Generates a random color in hexadecimal format.
 * @returns {string} A random hex color code.
 */
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * The ReportsScreen component displays different types of reports such as Sales Trends, X Report, Z Report, and Inventory Usage.
 * It dynamically fetches data based on user inputs and visualizes it using Chart.js.
 * @component
 */
const ReportsScreen = () => {
  /**
   * @type {string} selectedQuery - The currently selected report type.
   */
  const [selectedQuery, setSelectedQuery] = useState("");

  /**
   * @type {string} startDate - Start date for date range inputs.
   */
  const [startDate, setStartDate] = useState("");

  /**
   * @type {string} endDate - End date for date range inputs.
   */
  const [endDate, setEndDate] = useState("");

  /**
   * @type {string} itemName - Optional input for filtering by item name in Sales Trends.
   */
  const [itemName, setItemName] = useState("");

  /**
   * @type {Object|null} chartData - Data to be visualized in the charts.
   */
  const [chartData, setChartData] = useState(null);

  /**
   * @type {boolean} zReportDone - Flag to prevent multiple Z Report runs.
   */
  const [zReportDone, setZReportDone] = useState(false);

  /**
   * @type {string} productstart - Start date for inventory usage.
   */
  const [productstart, setProductStart] = useState("");

  /**
   * @type {string} productend - End date for inventory usage.
   */
  const [productend, setProductEnd] = useState("");

  /**
   * @type {Object|null} productinfo - Data for inventory usage visualization.
   */
  const [productinfo, setproductinfo] = useState(null);

  /**
   * Fetches data for the selected report type and processes it for visualization.
   * @async
   * @function fetchData
   */
  const fetchData = async () => {
    try {
      let url;

      if (
        (selectedQuery === "zReport" || selectedQuery === "xReport") &&
        zReportDone
      ) {
        alert("Z Report has already been run. Daily total has been reset.");
        return;
      }

      const getLocalDate = () => {
        const date = new Date();
        const offset = date.getTimezoneOffset();
        date.setMinutes(date.getMinutes() - offset);
        return date.toISOString().split("T")[0];
      };

      if (selectedQuery === "salesTrends") {
        url = `https://project-3-team-0g-backend.onrender.com/get-sales-trends?start_date=${startDate}&end_date=${endDate}&item_name=${itemName}`;
      } else if (selectedQuery === "xReport") {
        const reportDate = getLocalDate();
        const upToHour = new Date().getHours();
        url = `https://project-3-team-0g-backend.onrender.com/get-x-report?report_date=${reportDate}&up_to_hour=${upToHour}`;
      } else if (selectedQuery === "zReport") {
        const reportDate = getLocalDate();
        const upToHour = 23;
        url = `https://project-3-team-0g-backend.onrender.com/get-z-report?report_date=${reportDate}&up_to_hour=${upToHour}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        if (selectedQuery === "salesTrends") {
          const datasets = Object.keys(data).map((item) => ({
            label: item,
            data: data[item].map((entry) => entry.count),
            fill: false,
            borderColor: getRandomColor(),
            tension: 0.1,
          }));

          setChartData({
            labels: Object.values(data)[0]?.map((entry) => entry.date),
            datasets,
          });
        } else {
          const labels = data.hourly_sales.map((entry) => entry.hour);
          const counts = data.hourly_sales.map((entry) => entry.orderValue);

          if (selectedQuery === "zReport") {
            setZReportDone(true);
            alert("Z Report has been successfully run. Daily total is now reset.");
          }

          setChartData({
            labels,
            datasets: [
              {
                label:
                  selectedQuery === "xReport"
                    ? "Hourly Sales (X Report)"
                    : "Hourly Sales (Z Report)",
                data: counts,
                fill: false,
                borderColor: "#FF5733",
                tension: 0.1,
              },
            ],
          });
        }
      } else {
        console.error("Error fetching data", data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  /**
   * Fetches product usage data and processes it for visualization.
   * @async
   * @function fetchProductUsage
   */
  const fetchProductUsage = async () => {
    try {
      const response = await fetch(
        `https://project-3-team-0g-backend.onrender.com/get-productusage?start_date=${productstart}&end_date=${productend}`
      );
      const data = await response.json();
      setproductinfo({
        labels: data.map((item) => item.ingredient_name),
        datasets: [
          {
            label: "Inventory Usage",
            data: data.map((item) => item.total_used),
            backgroundColor: "red",
            borderColor: "red",
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Sales Reports</h1>

      {/* Dropdown to select the type of query */}
      <div>
        <label>
          Select Query:
          <select
            value={selectedQuery}
            onChange={(e) => {
              setChartData(null);
              setSelectedQuery(e.target.value);
            }}
          >
            <option value="">-- Select Report Type --</option>
            <option value="salesTrends">Sales Trends</option>
            <option value="xReport">X Report</option>
            <option value="zReport">Z Report</option>
            <option value="inventoryUsage">Inventory Usage</option>
          </select>
        </label>
      </div>

      {/* Conditional rendering based on selected query */}
      {selectedQuery === "salesTrends" && (
        <div>
          <h3>Sales Trends</h3>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <label>
            Item Name (optional):
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </label>
          <button onClick={fetchData}>Run Graph</button>
          {chartData && (
            <div>
              <h3>Sales Trend Graph</h3>
              <Line key={JSON.stringify(chartData)} data={chartData} />
            </div>
          )}
        </div>
      )}

      {selectedQuery === "xReport" && (
        <div>
          <h3>X Report</h3>
          <p>
            Generate hourly sales data for the current day (no input needed).
          </p>
          <button onClick={fetchData}>Generate X Report</button>
          {chartData && (
            <div>
              <h3>X Report Graph</h3>
              <Line key={JSON.stringify(chartData)} data={chartData} />
            </div>
          )}
        </div>
      )}

      {selectedQuery === "zReport" && (
        <div>
          <h3>Z Report</h3>
          <p>Generate end-of-day sales summary (only run once per day).</p>
          <button onClick={fetchData}>Generate Z Report</button>
          {chartData && (
            <div>
              <h3>Z Report Graph</h3>
              <Line key={JSON.stringify(chartData)} data={chartData} />
            </div>
          )}
        </div>
      )}

      {selectedQuery === "inventoryUsage" && (
        <div>
          <h3>Inventory Usage</h3>
          <p>Show usage of inventory throughout the time period</p>
          <label>
            Start Date:
            <input
              type="date"
              value={productstart}
              onChange={(e) => setProductStart(e.target.value)}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={productend}
              onChange={(e) => setProductEnd(e.target.value)}
            />
          </label>
          <button onClick={fetchProductUsage}>Run Product Graph</button>
          {productinfo && (
            <div>
              <h3>Product Usage Chart</h3>
              <Bar key={JSON.stringify(productinfo)} data={productinfo} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsScreen;
