import React, { useState, useEffect, useRef } from "react";
import MoreButton from "../moreButton";
import ScrollBtn from "./scrollBtn";
import "./index.css";

const PageControl = ({
  children,
  tabIndex = 0,
  scrollPos = 0,
  onAddButton = null,
  onClose = () => {},
  onPageChange = () => {},
  onMoreEdit = () => {},
  onChangeScrollPos = () => {},
  canClose = false,
  canEdit = false,
}) => {
  const scrollParentRef = useRef(null);
  const scrollRef = useRef(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(tabIndex);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [leftScrollPos, setLeftScrollPos] = useState(scrollPos);

  const onInternalAddButtonClick = () => {
    if (!onAddButton) {
      return;
    }

    onAddButton();
    checkScroll();
  };

  const onTabClick = (index) => {
    setSelectedTabIndex(index);
    onPageChange(index);
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    const parentEl = scrollParentRef.current;
    if (!el || !parentEl) return;
    setCanScrollLeft(leftScrollPos < 0);
    setCanScrollRight(
      !(leftScrollPos + el.clientWidth < parentEl.clientWidth + 1)
    );
  };

  const scrollLeft = () => {
    if (leftScrollPos > 0) {
      return;
    }
    const newPos = leftScrollPos + 50;
    onChangeScrollPos(newPos);
    setLeftScrollPos(newPos);
  };

  const scrollRight = () => {
    const el = scrollRef.current;
    const parentEl = scrollParentRef.current;

    if (!el || !parentEl) return;
    if (leftScrollPos + el.clientWidth < parentEl.clientWidth) {
      return;
    }
    const newPos = leftScrollPos - 50;
    onChangeScrollPos(newPos);
    setLeftScrollPos(leftScrollPos - 50);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    el.addEventListener("scroll", checkScroll);

    // Initial check after layout
    setTimeout(checkScroll, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      el.removeEventListener("scroll", checkScroll);
    };
  }, []);

  useEffect(() => {
    setSelectedTabIndex(tabIndex);
    setLeftScrollPos(0);
    checkScroll();
  }, [tabIndex]);

  useEffect(() => {
    checkScroll();
  }, [children, leftScrollPos, scrollPos]);

  useEffect(() => {
    setLeftScrollPos(scrollPos);
  }, [scrollPos]);

  return (
    <div className="pageControl">
      <div className="tabButtonWrapper">
        <div className="tabButtons" ref={scrollParentRef}>
          <div
            className="tabButtonScrollWrapper"
            ref={scrollRef}
            style={{ marginLeft: leftScrollPos }}
          >
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
          </div>
        </div>

        <div className="tabScrollButtons">
          {onAddButton && (
            <span onClick={() => onInternalAddButtonClick()}>+</span>
          )}
          <div className="vSpacer"></div>
          {(canScrollLeft || canScrollRight) && (
            <ScrollBtn disabled={!canScrollLeft} onClick={() => scrollLeft()}>
              &lt;
            </ScrollBtn>
          )}
          {(canScrollLeft || canScrollRight) && (
            <ScrollBtn disabled={!canScrollRight} onClick={() => scrollRight()}>
              &gt;
            </ScrollBtn>
          )}
        </div>
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
