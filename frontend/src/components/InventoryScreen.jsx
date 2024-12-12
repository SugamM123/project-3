import React, { useState, useEffect } from "react";
import axios from "axios"; // needed for links
import Navbar from "./Navbar";
import "../styles/InventoryScreen.css";
import LoadingBackdrop from "./LoadingBackdrop";
/**
 * Functional component for the Inventory Screen.
 * Manages state for ednm, loading, inve, and datai using useState.
 * Uses useEffect to call getInve on component mount.
 * getInve is an asynchronous function that fetches inventory data.
 * Renders a list of items with edit and delete buttons.
 * @returns JSX element representing the Inventory Screen.
 */
const InventoryScreen = () => {
  const [ednm, setEdnm] = useState(null); // these are the state variable being used
  const [loading, setLoading] = useState(false);
  const [inve, setInve] = useState([]); // for names list of inv and format
  const [datai, setDatai] = useState({ name: "", quantity: "", unit: "" });
  /**
   * useEffect hook that calls the getInve function when the component mounts.
   * @returns None
   */
  useEffect(() => {
    getInve();
  }, []); // getting data
  /**
   * Asynchronously fetches data from a specified URL using axios and sets the retrieved data to the 'Inve' state.
   * Also handles loading state and error logging.
   * @returns None
   */
  const getInve = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(
        "https://project-3-team-0g-backend.onrender.com/inventory"
      ); // getting fectched inv
      setInve(resp.data); // updating with recieved
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };
  /**
   * Asynchronously adds or updates data based on the presence of 'ednm' in the input event.
   * If 'ednm' is present, it updates the existing data using a PUT request, otherwise it adds new data using a POST request.
   * @param {Event} e - The event object to prevent the default behavior.
   * @returns None
   */
  const addUp = async (e) => {
    e.preventDefault(); // for adding and updating
    try {
      if (ednm) {
        // this is for updating
        setLoading(true);

        await axios.put(
          `https://project-3-team-0g-backend.onrender.com/inventory/${ednm}`,
          datai
        );
        setInve((prevInve) =>
          prevInve.map((itm) =>
            itm.name === ednm ? { ...itm, ...datai } : itm
          )
        ); // keeps edited items in same position
      } else {
        setLoading(true);

        await axios.post(
          "https://project-3-team-0g-backend.onrender.com/inventory",
          datai
        ); // this is for inv adding
        setInve((prevInve) => [{ ...datai }, ...prevInve]);
      } // new item on top
      setDatai({ name: "", quantity: "", unit: "" }); // go back to original
      setEdnm(null);
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };
  /**
   * Handles the deletion of a resource with the given name.
   * @param {string} name - The name of the resource to delete.
   * @returns {Promise<void>} - A promise that resolves once the deletion is complete.
   */
  const handledel = async (name) => {
    try {
      // to use deleting property ^_
      setLoading(true);
      await axios.delete(
        `https://project-3-team-0g-backend.onrender.com/inventory/${name}`
      );
      getInve(); // update
    } catch (error) {
      console.error("Delete Malfunction:", error);
    } finally {
      setLoading(false);
    }
  };
  /**
   * Handles the edit functionality for an item.
   * @param {{object}} itm - The item to be edited.
   * @returns None
   */
  const handledit = (itm) => {
    setDatai(itm);
    setEdnm(itm.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      <LoadingBackdrop loading={loading} />
      <div className="inventory-container">
        <h1>Inventory Viewer</h1>
        {}
        <form onSubmit={addUp}>
          <input
            type="text"
            placeholder="Name"
            value={datai.name}
            onChange={(e) => setDatai({ ...datai, name: e.target.value })}
            disabled={!!ednm}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={datai.quantity}
            onChange={(e) =>
              setDatai({ ...datai, quantity: parseFloat(e.target.value) })
            }
            required
          />
          <input
            type="text"
            placeholder="Unit"
            value={datai.unit}
            onChange={(e) => setDatai({ ...datai, unit: e.target.value })}
            required
          />
          <button type="submit">{ednm ? "Update" : "Add"} Item</button>
          {ednm && (
            <button
              type="button"
              onClick={() => {
                setDatai({ name: "", quantity: "", unit: "" });
                setEdnm(null);
              }}
            >
              Cancel
            </button>
          )}
        </form>
        {}
        <ul>
          {inve.map((itm) => (
            <li key={itm.name}>
              <div>
                <strong>{itm.name}</strong>: {itm.quantity} {itm.unit}
              </div>{" "}
              <div>
                <button onClick={() => handledit(itm)}>Edit</button>
                <button onClick={() => handledel(itm.name)}>Delete</button>
              </div>{" "}
            </li>
          ))}{" "}
        </ul>{" "}
      </div>{" "}
    </>
  );
};
export default InventoryScreen;
