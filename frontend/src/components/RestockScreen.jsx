import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import styles from "../styles/RestockScreen.module.css";
import LoadingBackdrop from "./LoadingBackdrop";

/**
 * The RestockScreen component facilitates inventory restocking decisions.
 * It integrates with an AI assistant to recommend restocking items and quantities.
 * Users can send queries, view recommendations, and execute restock updates.
 * @component
 */
const RestockScreen = () => {
  /**
   * @type {boolean} loading - Indicates whether data is being loaded.
   */
  const [loading, setLoading] = useState(false);

  /**
   * @type {Array.<{sender: string, text: string}>} messages - Chat history between the user and the AI assistant.
   */
  const [messages, setMessages] = useState([]);

  /**
   * @type {string} input - The user's input message for the AI assistant.
   */
  const [input, setInput] = useState("");

  /**
   * @type {Object} prePrompt - The system's predefined instructions for the AI assistant.
   * @property {string} sender - Identifies the message sender as "system".
   * @property {string} text - The AI's predefined behavior and context.
   */
  const [prePrompt, setPrePrompt] = useState({
    sender: "system",
    text: "You are a helpful assistant. Always provide clear, concise responses. Your role is to help the manager of Panda Express with inventory restocking decisions. Provide JSON payloads suitable for updating inventory using the 'mass-inventory-update' API.",
  });

  /**
   * @type {string|null} error - Error message for failed operations.
   */
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Fetches current inventory restock information and updates the prePrompt.
     * @async
     * @function fetchRestockInfo
     */
    const fetchRestockInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://project-3-team-0g-backend.onrender.com/inventory-restock-info"
        );
        if (!response.ok) throw new Error("Failed to fetch restock information.");
        const data = await response.json();
        const updatedPrePrompt = {
          sender: "system",
          text: `${prePrompt.text} Here is the current restock information: ${JSON.stringify(
            data
          )} When asked to pick top K items to restock, prioritize based on the priority score.`,
        };
        setPrePrompt(updatedPrePrompt);
      } catch (err) {
        console.error("Error fetching restock info:", err);
        setError("Unable to load restock information.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestockInfo();
  }, []);

  /**
   * Handles sending a message to the AI assistant.
   * Updates chat history and fetches the AI's response.
   * @async
   * @function handleSend
   */
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);

    const apiMessages = [
      { sender: "system", text: prePrompt.text },
      ...updatedMessages,
    ];

    try {
      const response = await fetch(
        "https://project-3-team-0g-backend.onrender.com/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        }
      );

      const data = await response.json();
      if (data.response) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.response }]);
      }
    } catch (err) {
      console.error("Error fetching AI response:", err);
      setError("Unable to process your request at this time.");
    }

    setInput("");
  };

  /**
   * Handles executing the restock operation using the AI's recommendations.
   * Validates the response and sends a POST request to update inventory.
   * @async
   * @function handleRestock
   */
  const handleRestock = async () => {
    if (
      messages.length === 0 ||
      messages[messages.length - 1].sender !== "ai"
    ) {
      setError("No valid AI response available for restocking.");
      return;
    }

    try {
      const payload = JSON.parse(messages[messages.length - 1].text);

      if (!Array.isArray(payload.updates)) {
        setError("Invalid format: 'updates' must be an array.");
        return;
      }

      for (const update of payload.updates) {
        if (!update.name || typeof update.quantity !== "number") {
          setError(
            "Invalid format: each update must have a 'name' and a numeric 'quantity'."
          );
          return;
        }
      }

      const response = await fetch(
        "https://project-3-team-0g-backend.onrender.com/mass-inventory-update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to execute restock.");

      setError(null);
      alert("Restock successful!");
    } catch (err) {
      console.error("Error processing restock:", err);
      setError(
        "Unable to process restock. Ensure the AI's response is in valid JSON format."
      );
    }
  };

  return (
    <>
      <Navbar />
      <LoadingBackdrop loading={loading} />
      <div className={styles.chatContainer}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.chatMessages}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.sender === "user"
                  ? styles.userMessage
                  : styles.aiMessage
              }
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className={styles.inputContainer}>
          <input
            className={styles.chatInput}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about restock recommendations..."
          />
          <button className={styles.sendButton} onClick={handleSend}>
            Send
          </button>
        </div>
        <button className={styles.restockButton} onClick={handleRestock}>
          Restock
        </button>
      </div>
    </>
  );
};

export default RestockScreen;
