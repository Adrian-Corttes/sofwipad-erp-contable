
import React from 'react';

const Card = ({ title, children, actions }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <div className="p-4 border-b flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export default Card;
