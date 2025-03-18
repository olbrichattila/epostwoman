import React, { useState } from "react";
import "./index.css";

const PageControl = ({
  children,
  onAddButton = null,
  onClose = () => {},
  onPageChange = () => {},
  canClose = false,
}) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const onInternalAddButtonClick = () => {
    if (!onAddButton) {
      return;
    }
    onAddButton();
  };

  const onTabClick= (index) => {
    setSelectedTabIndex(index);
    onPageChange(index)
  }

  return (
    <div className="pageControl">
      <div className="tabButtons">
        {React.Children.map(children, (child, index) => {
          return (
            <div
              onClick={() => onTabClick(index)}
              key={index}
              className={`tabButton${
                index === selectedTabIndex ? " active" : ""
              }`}
            >
              {child.props.tabName ?? `Tab ${index + 1}`}
              {canClose ? <span onClick={() => onClose(index)}>x</span> : null}
            </div>
          );
        })}
        {onAddButton && (
          <div className="tabButton" onClick={() => onInternalAddButtonClick()}>
            +
          </div>
        )}
      </div>
      <div className="tabContent">
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className={`tabSheet${index === selectedTabIndex ? " active" : ""}`}
          >
            {index === selectedTabIndex ? child : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageControl;
