import { Classes, Collapse } from '@blueprintjs/core';
import { ChevronRightIcon } from '@blueprintjs/icons';
import { clsx } from 'clsx';
import { type PropsWithChildren, type ReactNode } from 'react';

import './TreeNode.sass';
import { LoadingNode } from './LoadingNode';

export interface TreeNodeProps {
  className?: string;
  disabled?: boolean;
  depth: number;
  icon?: ReactNode;
  label: string;
  isOpen: boolean;
  rightIcon?: ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  'aria-label': string;
  labelClass?: string;
  isLoading?: boolean;
}

export const TreeNode = ({
  className,
  disabled,
  depth,
  icon,
  label,
  isOpen,
  onOpenChange,
  labelClass,
  rightIcon,
  isLoading,
  'aria-label': ariaLabel,
  children,
}: PropsWithChildren<TreeNodeProps>) => {
  const classes = clsx(
    Classes.TREE_NODE,
    {
      [Classes.DISABLED]: disabled,
      [Classes.TREE_NODE_EXPANDED]: isOpen,
    },
    'custom-tree-node',
    className,
  );

  const contentClasses = clsx(Classes.TREE_NODE_CONTENT, `${Classes.TREE_NODE_CONTENT}-${depth}`);

  const caretClasses = clsx(
    Classes.TREE_NODE_CARET,
    isOpen ? Classes.TREE_NODE_CARET_OPEN : Classes.TREE_NODE_CARET_CLOSED,
  );

  const toggleOpen = () => {
    if (!disabled) {
      onOpenChange?.(!isOpen);
    }
  };

  return (
    <li className={classes}>
      <div className={contentClasses}>
        {onOpenChange && (
          <ChevronRightIcon
            title={isOpen ? 'Collapse group' : 'Expand group'}
            className={caretClasses}
            onClick={toggleOpen}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                toggleOpen();
              }
            }}
            role="button"
          />
        )}
        <span
          className={clsx(Classes.TREE_NODE_LABEL, labelClass)}
          onClick={toggleOpen}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              toggleOpen();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={ariaLabel}
        >
          {icon}
          <span className="custom-tree-node_label">{label}</span>
          {rightIcon && <span className="custom-tree-node_action">{rightIcon}</span>}
        </span>
      </div>
      <Collapse isOpen={isOpen}>
        {isLoading && <LoadingNode depth={depth + 1} />}
        {children}
      </Collapse>
    </li>
  );
};
