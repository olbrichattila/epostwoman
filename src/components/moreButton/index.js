import React, { useState } from "react";
import "./index.css";

const MoreButton = ({ onMenuClick = () => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onMenuItemClick = (itemName) => {
    onMenuClick(itemName);
    setIsMenuOpen(false);
  };

  return (
    <div className="moreBtn">
      <div className="dotWrapper" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
      <div className={`menu${isMenuOpen ? " active" : ""}`}>
        <div onClick={() => onMenuItemClick("rename")}>Rename</div>
        <div onClick={() => onMenuItemClick("close")}>Close Tab</div>
        <div onClick={() => setIsMenuOpen(false)}>Cancel</div>
      </div>
    </div>
  );
};

export default MoreButton;
