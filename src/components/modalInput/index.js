import React, { useState, useEffect } from "react";
import Button from "../button";
import "./index.css";

const ModalInput = ({
  visible = false,
  value = "",
  onOk = () => {},
  onCancel = () => {},
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [name, setName] = useState(value);

  const onInternalCancel = () => {
    onCancel();
    setIsVisible(false);
  };

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    setName(value);
  }, [value]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="modalInputShadow"></div>
      <div className="modalInput">
        <div className="head">
          Rename
          <span onClick={() => onInternalCancel()}></span>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div>
          <Button framed title="cancel" onClick={() => onInternalCancel()} />
          <Button title="ok" onClick={() => onOk(name)} />
        </div>
      </div>
    </>
  );
};

export default ModalInput;
