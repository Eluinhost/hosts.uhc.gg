import { ActionIcon, Button, Flex, Image } from '@mantine/core';
import {
  BoxArrowUpIcon,
  FileTextIcon,
  ListBulletsIcon,
  MoonIcon,
  QuestionIcon,
  SunIcon,
  ToggleLeftIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { useAtom } from 'jotai';
import React, { type ReactNode } from 'react';
import { useLocation, Link } from 'react-router';

import { isDarkModeAtom } from '../atoms/isDarkMode';

import styles from './Navbar.module.css';
import { Username } from './Username';
import { WithPermission } from './WithPermission';

type NavBarButtonProps = {
  readonly text: string;
  readonly icon?: ReactNode;
  readonly to: string;
};

const NavBarButtonComponent: React.FC<NavBarButtonProps> = ({ text, icon, to }) => {
  const location = useLocation();

  return (
    <Button
      leftSection={icon}
      variant="subtle"
      component={Link}
      to={to}
      className={clsx({
        [styles.active]: location.pathname === to,
      })}
    >
      {text}
    </Button>
  );
};

const NavbarButton: React.FC<NavBarButtonProps> = NavBarButtonComponent;

export const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useAtom(isDarkModeAtom);

  return (
    <Flex direction="row" gap="lg" className={styles.navbar}>
      <Flex direction="row" align="center" gap="xs">
        <Link to="/">
          <Image src="/logo.png" alt="logo" className="brand-logo" h="4rem" w="auto" p=".5rem" />
        </Link>
        <Link to="/">uhc.gg hosting</Link>
      </Flex>
      <Flex
        direction="row"
        justify="center"
        flex="1"
        align="center"
        gap="xs"
        className={styles.navLinks}
        wrap="wrap"
        m="xs"
      >
        <NavbarButton to="/host" text="Host" icon={<BoxArrowUpIcon size={20} />} />
        <NavbarButton to="/matches" text="Matches" icon={<ListBulletsIcon size={20} />} />
        <NavbarButton to="/host-applications" text="Host Applications" icon={<FileTextIcon />} />
        <NavbarButton to="/members" text="Members" icon={<UsersIcon />} />
        <WithPermission permission="hosting advisor">
          <NavbarButton text="Modifiers" icon={<ToggleLeftIcon />} to="/modifiers" />
          <NavbarButton to="/quiz" text="Application Quiz" icon={<QuestionIcon />} />
        </WithPermission>
      </Flex>
      <Flex direction="row" justify="flex-end" align="center" gap="xs">
        <Username />
        <ActionIcon
          variant="subtle"
          onClick={() => {
            setIsDarkMode(prev => !prev);
          }}
        >
          {isDarkMode ? <MoonIcon /> : <SunIcon />}
        </ActionIcon>
      </Flex>
    </Flex>
  );
};
