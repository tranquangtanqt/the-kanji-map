import * as React from "react";

interface TouchIsolatorProps {
  children: React.ReactNode;
}

export const TouchIsolator: React.FC<TouchIsolatorProps> = ({ children }) => {
  return <div className="touch-none">{children}</div>;
};
