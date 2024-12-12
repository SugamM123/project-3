import React, { useState, useEffect } from 'react';
import styles from "../styles/WeatherTimeDisplay.module.css";

/**
 * The WeatherTimeDisplay component displays the current time, temperature, and weather icon for a specific location.
 * It fetches weather data from an external API and updates the time every minute.
 * @component
 * @returns {JSX.Element} A display for the current time and weather.
 */
const WeatherTimeDisplay = () => {
  /**
   * @type {number|null} temperature - The current temperature in Fahrenheit.
   */
  const [temperature, setTemperature] = useState(null);

  /**
   * @type {Date} currentTime - The current date and time.
   */
  const [currentTime, setCurrentTime] = useState(new Date());

  /**
   * @type {string|null} weatherIcon - The emoji representing the current weather condition.
   */
  const [weatherIcon, setWeatherIcon] = useState(null);

  useEffect(() => {
    /**
     * Fetches weather data and updates the temperature and weather icon.
     * @async
     * @function fetchWeather
     */
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=30.628&longitude=-96.3344&current=temperature_2m,weather_code&hourly=temperature_2m&temperature_unit=fahrenheit&timezone=America%2FChicago'
        );
        const data = await response.json();
        
        const currentHour = new Date().getHours();
        const temp = data.hourly.temperature_2m[currentHour];
        setTemperature(temp);

        // Get weather icon based on weather code
        const weatherCode = data.current.weather_code;
        const icon = getWeatherIcon(weatherCode);
        setWeatherIcon(icon);
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    /**
     * Returns the weather icon corresponding to a weather code.
     * @function getWeatherIcon
     * @param {number} code - The weather code.
     * @returns {string} The emoji representing the weather condition.
     */
    const getWeatherIcon = (code) => {
      const iconMap = {
        0: '☀️', // Clear sky
        1: '🌤️', // Mainly clear
        2: '⛅', // Partly cloudy
        3: '☁️', // Overcast
        45: '🌫️', // Foggy
        48: '🌫️', // Depositing rime fog
        51: '🌧️', // Light drizzle
        53: '🌧️', // Moderate drizzle
        55: '🌧️', // Dense drizzle
        61: '🌧️', // Slight rain
        63: '🌧️', // Moderate rain
        65: '🌧️', // Heavy rain
        71: '🌨️', // Slight snow
        73: '🌨️', // Moderate snow
        75: '🌨️', // Heavy snow
        77: '🌨️', // Snow grains
        80: '🌦️', // Slight rain showers
        81: '🌦️', // Moderate rain showers
        82: '🌦️', // Violent rain showers
        95: '⛈️', // Thunderstorm
        96: '⛈️', // Thunderstorm with slight hail
        99: '⛈️', // Thunderstorm with heavy hail
      };
      return iconMap[code] || '❓';
    };

    fetchWeather();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update time every minute

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);

  /**
   * Formats a Date object into a readable time string.
   * @function formatTime
   * @param {Date} date - The date object to format.
   * @returns {string} The formatted time string (e.g., "12:30 PM").
   */
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={styles.weatherTime}>
      <div className={styles.time}>{formatTime(currentTime)}</div>
      {temperature !== null && (
        <div className={styles.temperature}>
          {weatherIcon && <span className={styles.weatherIcon}>{weatherIcon}</span>}
          {Math.round(temperature)}°F
        </div>
      )}
    </div>
  );
};

export default WeatherTimeDisplay;
