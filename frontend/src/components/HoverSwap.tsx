import React, { useCallback, useState } from 'react';

export const HoverSwap: React.FC = ({ children }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const [notHovered, hovered] = React.Children.toArray(children);

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {isHovered ? hovered : notHovered}
    </div>
  );
};
