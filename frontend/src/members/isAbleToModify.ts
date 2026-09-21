export const ALLOWABLE_MODIFICATIONS: Record<string, Array<string>> = {
  'hosting advisor': ['host', 'trial host', 'hosting banned'],
  admin: ['trial host', 'host', 'hosting advisor', 'beta tester'],
};

export const isAbleToModify = (userPermissions: string[], permission: string) => {
  // contains duplicates but doesn't change anything
  const allowed = userPermissions.map(x => ALLOWABLE_MODIFICATIONS[x] ?? []).flat();

  return allowed.includes(permission);
};
