import React from 'react';

const SuccessDisplay = ({ message }) => {
  if (!message) return null;
  return (
    <div
      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative my-4"
      role="alert"
    >
      <strong className="font-bold">Éxito: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default SuccessDisplay;
