import { Badge } from '@mantine/core';
import React from 'react';

interface ServerTagProps {
  title: string;
  text: string;
}

export const ServerTag: React.FC<ServerTagProps> = ({ title, text }) => (
  <Badge color="blue" variant="outline" title={title}>
    {text}
  </Badge>
);
