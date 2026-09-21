import { Classes } from '@blueprintjs/core';

import { TreeNode } from './TreeNode';

export const LoadingNode = ({ depth }: { depth: number }) => (
  <TreeNode isOpen depth={depth} label="Loading" aria-label="Loading" labelClass={Classes.SKELETON} />
);
