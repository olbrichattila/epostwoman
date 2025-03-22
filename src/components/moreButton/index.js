import React, { useState, useEffect, useRef } from "react";
import "./index.css";

const MoreButton = ({ onMenuClick = () => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const onMenuItemClick = (e, itemName) => {
    e.preventDefault();
    onMenuClick(itemName);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="moreBtn" ref={menuRef}>
      <div
        className="dotWrapper"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
      <div className={`menu${isMenuOpen ? " active" : ""}`}>
        <div onClick={(e) => onMenuItemClick(e, "rename")}>Rename</div>
        <div onClick={(e) => onMenuItemClick(e, "close")}>Close Tab</div>
        <div onClick={() => setIsMenuOpen(false)}>Cancel</div>
      </div>
    </div>
  );
};

export default MoreButton;