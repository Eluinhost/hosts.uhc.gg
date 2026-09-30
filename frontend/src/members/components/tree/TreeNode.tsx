import { Collapse, Group, List } from '@mantine/core';
import { CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import { type PropsWithChildren, type ReactNode } from 'react';

import { LoadingNode } from '@/members/components/tree/LoadingNode';
import styles from '@/members/components/tree/TreeNode.module.css';

export interface TreeNodeProps {
  className?: string;
  disabled?: boolean;
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
  disabled,
  icon,
  label,
  isOpen,
  onOpenChange,
  rightIcon,
  isLoading,
  'aria-label': ariaLabel,
  children,
}: PropsWithChildren<TreeNodeProps>) => {
  const toggleOpen = () => {
    if (!disabled) {
      onOpenChange?.(!isOpen);
    }
  };

  const CaretIcon = isOpen ? CaretDownIcon : CaretRightIcon;

  return (
    <>
      <Group align="center" h={30} component="li" className={styles.treeNode} mt={4} pr="xs" pl="xs">
        <Group
          align="center"
          flex={1}
          role="button"
          aria-label={ariaLabel}
          onClick={toggleOpen}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              toggleOpen();
            }
          }}
          className={styles.treeNodeLabel}
        >
          {icon ?? (
            <CaretIcon
              alt={isOpen ? 'Collapse group' : 'Expand group'}
              onClick={toggleOpen}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  toggleOpen();
                }
              }}
            />
          )}
          {label}
        </Group>
        {rightIcon}
      </Group>
      {onOpenChange && (
        <Collapse expanded={isOpen} component={List} pl={0} ml="lg">
          {isLoading && (
            <>
              <LoadingNode />
              <LoadingNode />
              <LoadingNode />
            </>
          )}
          {children}
        </Collapse>
      )}
    </>
  );
};
