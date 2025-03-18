import React, { useState } from "react";
import {initialKeyValueRow} from "./defaults"
import { FaTrash } from 'react-icons/fa';
import "./row.css"

const KeyValueRow = ({data = initialKeyValueRow, onChange = () => {}, onDelete = () => {}}) => {
    const [status, setStatus] = useState(data)
    const showCheckbox = status.checked || status.key !== '' || status.value !== '';

    const keyChange = (value) => {
        const newState = {...status, key: value};
        setStatus(newState)
        onChange(newState)
    }

    const valueChange = (value) => {
        const newState = {...status, value: value};
        setStatus(newState)
        onChange(newState)
    }
    
    return (
        <tr className="keyValueRow">
            <td>{showCheckbox ? <input type="checkbox"/> : null}</td>
            <td><input value={status.key} onChange={(e) => keyChange(e.target.value)} type="text" /></td>
            <td><input value={status.value} onChange={(e) => valueChange(e.target.value)} type="text" /></td>
            <td><span onClick={() => onDelete()}><FaTrash /></span></td>
        </tr>
    );
}

export default KeyValueRow;