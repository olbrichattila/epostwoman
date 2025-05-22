import React, { useState, useEffect } from "react";
import "./index.css";
import MoreButton from "../moreButton";

const PageControl = ({
  children,
  tabIndex = 0,
  onAddButton = null,
  onClose = () => {},
  onPageChange = () => {},
  onMoreEdit = () => {},
  canClose = false,
  canEdit = false,
}) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(tabIndex);

  const onInternalAddButtonClick = () => {
    if (!onAddButton) {
      return;
    }
    onAddButton();
  };

  const onTabClick = (index) => {
    setSelectedTabIndex(index);
    onPageChange(index);
  };

  useEffect(() => {
    setSelectedTabIndex(tabIndex);
  }, [tabIndex]);

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
              {canEdit ? (
                <MoreButton
                  onMenuClick={(itemName) => onMoreEdit(index, itemName)}
                />
              ) : null}
              {child.props.tabName ? (
                <label>{child.props.tabName}</label>
              ) : (
                <label>{`Tab ${index + 1}`}</label>
              )}
              {canClose ? (
                <span className="closeBtn" onClick={() => onClose(index)}>
                  x
                </span>
              ) : null}
            </div>
          );
        })}
        {onAddButton && (
          <div className="tabButton" onClick={() => onInternalAddButtonClick()}>
            <label>+</label>
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
