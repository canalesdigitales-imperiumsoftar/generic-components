import React from 'react';

interface ConditionalFieldsProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalFields: React.FC<ConditionalFieldsProps> = ({
  condition,
  children,
  fallback = null,
}) => {
  return condition ? <>{children}</> : <>{fallback}</>;
};