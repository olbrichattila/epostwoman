import React from 'react';
import './index.css'

const Button = ({framed = false, title, onClick = () => {}}) => {
  return (
    <div className={`btn${framed ? ' framed' : ''}`} onClick={()=> onClick()}>
      {title}
    </div>
  );
};

export default Button;