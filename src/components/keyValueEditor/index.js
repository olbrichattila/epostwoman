import React, { useState, useEffect } from "react";
import KeyValueRow from "./row";
import { initialKeyValueRow } from "./defaults";
import "./index.css";

const KeyValueEditor = ({data = [], onChange = () => {}}) => {
  const [rows, setRows] = useState(data);

  const onSetRows = (data, idx) => {
    const newRow = [...rows.slice(0, idx), data, ...rows.slice(idx + 1)];
    setRows(newRow)
    onChange(newRow);
  }

  const onNewTab = () => {
    const newRow = [...rows, initialKeyValueRow]
    setRows(newRow)
    onChange(newRow);
  }

  useEffect(() => {
    setRows(data);
  }, [data])

  return (
    <table className="keyValueEditor">
      <thead>
        <tr>
          <th></th>
          <th>Key</th>
          <th>Value</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <KeyValueRow
            key={idx}
            data={row}
            onDelete={() =>
              setRows([...rows.slice(0, idx), ...rows.slice(idx + 1)])
            }
            onChange={(data) => onSetRows(data, idx)}
          />
        ))}
        <tr>
          <td colSpan={4}>
            <span
              className="addBtn"
              onClick={() => onNewTab()}
            >
              +
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default KeyValueEditor;
