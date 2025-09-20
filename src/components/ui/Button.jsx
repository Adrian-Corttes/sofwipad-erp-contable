
import React from 'react';

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-md";
  const variantClasses = {
    primary:
      "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
    secondary:
      "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500",
    danger:
      "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
