export type UserCountPerPermission = {
  [permission: string]: number;
};

export type UsersInPermission =
  | string[]
  | {
      [letter: string]: number;
    };
