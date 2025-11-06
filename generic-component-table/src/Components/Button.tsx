import React from 'react';
import clsx from 'clsx'; // opcional pero recomendable

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'contained' | 'outlined';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'contained',
  className,
  ...props
}) => {
  const baseClass = "px-4 py-2 rounded-md shadow-md transition disabled:opacity-50";

  const variantClass = {
    contained: "bg-blue-600 hover:bg-blue-700 text-white",
    outlined: "border border-blue-600 text-blue-600 hover:bg-blue-50",
  };

  return (
    <button
      {...props}
      className={clsx(baseClass, variantClass[variant], className)}
    >
      {children}
    </button>
  );
};
