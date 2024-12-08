// src/components/Loader.js

import React from 'react';
import './Loader.css'; // CSS for loader styling

const Loader = () => {
  return (
    <div className="loader">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );
};

export default Loader;
