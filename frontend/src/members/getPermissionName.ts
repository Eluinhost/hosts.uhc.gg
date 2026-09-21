const GROUP_NAMES: { [key: string]: string } = {
  admin: 'Administrators',
  host: 'Verified Hosts',
  'hosting advisor': 'Hosting Advisors',
  'hosting banned': 'Hosting Banned',
  'trial host': 'Trial Hosts',
};

export const getPermissionName = (permission: string) =>
  GROUP_NAMES[permission] || permission.charAt(0).toUpperCase() + permission.slice(1) + 's';
