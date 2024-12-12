import React from 'react';

/**
 * The ToggleButtonGroup component displays a group of buttons that can be toggled on or off individually.
 * The toggled state and behavior are managed externally via props.
 * @component
 * @param {Object} props - The component props.
 * @param {Array<string>} props.items - An array of labels for the toggle buttons.
 * @param {Array<boolean>} props.toggledState - An array of boolean values representing the toggled state of each button.
 * @param {Function} props.handleToggle - A function to handle toggling a button by its index.
 * @returns {JSX.Element} A group of toggle buttons.
 */
const ToggleButtonGroup = ({ items, toggledState, handleToggle }) => {
  return (
    <div style={{ display: 'flex', maxWidth: '100%', flexWrap: 'wrap', gap: '10px' }}>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => handleToggle(index)}
          style={{
            padding: "5px",
            fontSize: "15px",
            backgroundColor: toggledState[index] ? "rgb(150, 150, 150)" : "",
            cursor: "pointer",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default ToggleButtonGroup;
