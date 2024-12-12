import { useEffect, useState } from "react";
import axios from "axios";
import { useLanguageContext } from "../contexts/LanguageContext";

/**
 * The TextWrap component automatically translates its child text based on the selected language context.
 * It supports English (default) and Spanish (translation fetched from a backend API).
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The text content to be displayed and translated.
 * @returns {JSX.Element} The translated or original text wrapped in a React fragment.
 */
const TextWrap = ({ children }) => {
  /**
   * @type {string} text - The current displayed text (original or translated).
   */
  const [text, setText] = useState(children);

  /**
   * Language state from the global context.
   * @type {string} language - The currently selected language ("en" or "es").
   */
  const { language } = useLanguageContext();

  useEffect(() => {
    let isMounted = true;

    /**
     * Fetches the translation of the text if the selected language is Spanish ("es").
     * @async
     * @function fetchTranslation
     */
    const fetchTranslation = async () => {
      try {
        if (language === "es") {
          const translatedWordResponse = await axios.post(
            "https://project-3-team-0g-backend.onrender.com/get-translation",
            {
              en: children.toString(),
            }
          );

          if (isMounted) {
            setText(translatedWordResponse.data.es); // Update text with translated content
          }
        }
      } catch (error) {
        console.error("Translation error:", error);
      }
    };

    fetchTranslation();

    return () => {
      isMounted = false; // Cleanup to prevent state updates on unmounted component
    };
  }, [language, children]);

  return <>{text}</>;
};

export default TextWrap;
