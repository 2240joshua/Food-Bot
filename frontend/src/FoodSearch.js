import React, { useState } from "react";

// You need a backend endpoint for this (see note below)
const API_URL = "https://foodbot-backend.onrender.com/ingredients/suggest";


function FoodSearch({ value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);

  const fetchSuggestions = async (q) => {
    if (!q) {
      setSuggestions([]);
      setShow(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Error fetching suggestions");
      const data = await res.json();
      setSuggestions(data);
      setShow(true);
    } catch {
      setSuggestions([]);
      setShow(false);
    }
  };

  return (
    <div className="autocomplete-container">
      <input
        className="autocomplete-input"
        value={value}
        onChange={e => {
          onChange && onChange(e.target.value);
          fetchSuggestions(e.target.value);
        }}
        onFocus={e => fetchSuggestions(e.target.value)}
        autoComplete="off"
        placeholder="Ingredient"
      />
      {show && suggestions.length > 0 && (
        <ul className="autocomplete-list">
          {suggestions.map((item, i) => (
            <li
              key={i}
              className="autocomplete-item"
              onMouseDown={() => {
                onSelect(item);
                setShow(false);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FoodSearch;
