import React from 'react';

const CustomEditIcon = ({ onClick }) => (
  <svg
    onClick={onClick}
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="25"
    fill="outlined"
    viewBox="0 0 22 25"
    stroke="currentColor"
    style={{ cursor: 'pointer', color: '#4A90E2' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      color='white'
      d="M16 8l2 2m-2-2L10 16l-2 2 6-6m2-2l2 2m-2-2l2 2m-2-2l2-2m-4 4l-2 2"
    />
  </svg>

);

export default CustomEditIcon;