import { ApplicationReducer, ReducerBuilder } from './ReducerBuilder';
import { concat, converge, head, Obj, pipe, tail, toPairs, toUpper } from 'ramda';
import {
  AddPermission,
  RemovePermission,
  FetchUserCountPerPermission,
  PermissionNode,
  FetchUsersInPermission,
  PermissionLetterNode,
  FetchUsersInPermissionWithLetter,
} from '../actions';
import { isArray } from 'util';
import { Classes, ITreeNode, Spinner } from '@blueprintjs/core';
import * as React from 'react';

export type AddPermissionDialogState = {
  readonly permission: string;
};

export type RemovePermissionDialogState = {
  readonly permission: string;
  readonly username: string;
};

export interface BasicNode extends ITreeNode {
  readonly type: string;
  readonly permission: string;
}

export interface UsernameNode extends BasicNode {
  readonly type: 'username';
  readonly username: string;
}

export interface FolderNode extends BasicNode {
  readonly isFetching: boolean;
  readonly count: number;
}

export interface PermissionFolder extends FolderNode {
  readonly type: 'permission';
  readonly childNodes: LetterFolder[] | UsernameNode[];
}

export interface LetterFolder extends FolderNode {
  readonly type: 'letter';
  readonly childNodes: UsernameNode[];
  readonly letter: string;
}

const createUsernameNode = (permission: string, username: string): UsernameNode => ({
  username,
  permission,
  id: `p~${permission}~u~${username}`,
  label: username,
  type: 'username',
  iconName: 'user',
  className: 'username-node',
});

const permissionGroupNames: Obj<string> = {
  admin: 'Administrators',
  host: 'Verified Hosts',
  'hosting advisor': 'Hosting Advisors',
  'hosting banned': 'Hosting Banned',
  'trial host': 'Trial Hosts',
  'ubl moderator': 'UBL Moderators',
};

const getGroupName = (permission: string) =>
  permissionGroupNames[permission] || converge<string>(concat, [pipe(head, toUpper), tail])(permission) + 's';

const createPermissionFolder = (permission: string, count: number): PermissionFolder => ({
  permission,
  count,
  id: `p~${permission}`,
  label: `${getGroupName(permission)} (${count})`,
  hasCaret: true,
  isFetching: false,
  isExpanded: false,
  iconName: 'folder-close',
  type: 'permission',
  childNodes: [],
  className: 'permission-folder-node',
});

const createLetterFolder = (permission: string, letter: string, count: number): LetterFolder => ({
  permission,
  letter,
  count,
  id: `p~${permission}~l~${letter}`,
  label: `${letter} (${count})`,
  hasCaret: true,
  iconName: 'folder-close',
  isFetching: false,
  isExpanded: false,
  type: 'letter',
  childNodes: [],
  className: 'letter-folder-node',
});

export type PermissionsState = {
  readonly addDialog: AddPermissionDialogState | null;
  readonly removeDialog: RemovePermissionDialogState | null;
  readonly isFetching: boolean;
  readonly nodes: PermissionFolder[];
  readonly allowableModifications: Obj<string[]>;
};

const loadingIcon: React.ReactElement<any> = React.createElement(Spinner, { className: Classes.SMALL });

export const reducer: ApplicationReducer<PermissionsState> = ReducerBuilder.withInitialState<PermissionsState>({
  isFetching: false,
  nodes: [],
  removeDialog: null,
  addDialog: null,
  allowableModifications: {
    'hosting advisor': ['host', 'trial host', 'hosting banned'],
    admin: ['trial host', 'host', 'hosting advisor', 'ubl moderator'],
  },
})
  .handle(FetchUserCountPerPermission.started, (prev, action) => ({
    ...prev,
    isFetching: true,
  }))
  .handle(FetchUserCountPerPermission.success, (prev, action) => ({
    ...prev,
    isFetching: false,
    nodes: toPairs<number>(action.payload!.result).map<PermissionFolder>(pair =>
      createPermissionFolder(pair[0], pair[1]),
    ),
  }))
  .handle(FetchUserCountPerPermission.failure, (prev, action) => ({
    ...prev,
    isFetching: false,
  }))
  .handle(FetchUsersInPermission.started, (prev, action) => ({
    ...prev,
    nodes: prev.nodes.map<PermissionFolder>(node => {
      if (node.permission !== action.payload!.parameters) return node;

      return {
        ...node,
        isFetching: true,
        secondaryLabel: loadingIcon,
      };
    }),
  }))
  .handle(FetchUsersInPermission.success, (prev, action) => ({
    ...prev,
    nodes: prev.nodes.map<PermissionFolder>(node => {
      if (node.permission !== action.payload!.parameters) return node;

      const permission = action.payload!.parameters;

      let childNodes: UsernameNode[] | LetterFolder[];

      if (isArray(action.payload!.result)) {
        const usernames = action.payload!.result as string[];

        childNodes = usernames
          .sort((left, right) => left.toLocaleLowerCase().localeCompare(right.toLocaleLowerCase()))
          .map<UsernameNode>(name => createUsernameNode(permission, name));
      } else {
        const letters = action.payload!.result as Obj<number>;

        childNodes = toPairs(letters)
          .map<LetterFolder>(pair => createLetterFolder(permission, pair[0], pair[1]))
          .sort((left, right) => left.letter.localeCompare(right.letter));
      }

      return {
        ...node,
        childNodes,
        isFetching: false,
        secondaryLabel: undefined,
      };
    }),
  }))
  .handle(FetchUsersInPermission.failure, (prev, action) => ({
    ...prev,
    nodes: prev.nodes.map(node => {
      if (node.permission !== action.payload!.parameters) return node;

      return {
        ...node,
        isFetching: false,
        secondaryLabel: undefined,
      };
    }),
  }))
  .handle(FetchUsersInPermissionWithLetter.started, (prev, action) => ({
    ...prev,
    nodes: prev.nodes.map<PermissionFolder>(permNode => {
      if (permNode.permission !== action.payload!.parameters.permission) return permNode;

      return {
        ...permNode,
        childNodes: (permNode.childNodes as LetterFolder[]).map(letterNode => {
          if (letterNode.letter !== action.payload!.parameters.letter) return letterNode;

          return {
            ...letterNode,
            isFetching: true,
            secondaryLabel: loadingIcon,
          };
        }),
      };
    }),
  }))
  .handle(FetchUsersInPermissionWithLetter.success, (prev, action) => ({
    ...prev,
    nodes: prev.nodes.map<PermissionFolder>(permNode => {
      if (permNode.permission !== action.payload!.parameters.permission) return permNode;

      return {
        ...permNode,
        childNodes: (permNode.childNodes as LetterFolder[]).map(letterNode => {
          if (letterNode.letter !== action.payload!.parameters.letter) return letterNode;

          return {
            ...letterNode,
            isFetching: false,
            secondaryLabel: undefined,
            childNodes: action
              .payload!.result.sort((left, right) => left.toLocaleLowerCase().localeCompare(right.toLocaleLowerCase()))
              .map(name => createUsernameNode(action.payload!.parameters.permission, name)),
          };
        }),
      };
    }),
  }))
  .handle(FetchUsersInPermissionWithLetter.failure, (prev, action) => ({
    ...prev,
    nodes: prev.nodes.map<PermissionFolder>(permNode => {
      if (permNode.permission !== action.payload!.parameters.permission) return permNode;

      return {
        ...permNode,
        childNodes: (permNode.childNodes as LetterFolder[]).map(letterNode => {
          if (letterNode.letter !== action.payload!.parameters.letter) return letterNode;

          return {
            ...letterNode,
            isFetching: false,
            secondaryLabel: undefined,
          };
        }),
      };
    }),
  }))
  .handle(PermissionNode.open, (prev, action) => ({
    ...prev,
    nodes: prev.nodes.map(node => {
      if (node.permission !== action.payload!) return node;

      return <PermissionFolder>{
        ...node,
        isExpanded: true,
        iconName: 'folder-open',
      };
    }),
  }))
  .handle(PermissionNode.close, (prev, action) => ({
    ...prev,
    nodes: prev.nodes.map(node => {
      if (node.permission !== action.payload!) return node;

      return <PermissionFolder>{
        ...node,
        isExpanded: false,
        iconName: 'folder-close',
      };
    }),
  }))
  .handle(PermissionLetterNode.open, (prev, action) => ({
    ...prev,
    nodes: prev.nodes.map(permNode => {
      if (permNode.permission !== action.payload!.permission) return permNode;

      return {
        ...permNode,
        isExpanded: true,
        childNodes: (permNode.childNodes as LetterFolder[]).map(letterNode => {
          if (letterNode.letter !== action.payload!.letter) return letterNode;

          return <LetterFolder>{
            ...letterNode,
            isExpanded: true,
            iconName: 'folder-open',
          };
        }),
      };
    }),
  }))
  .handle(PermissionLetterNode.close, (prev, action) => ({
    ...prev,
    nodes: prev.nodes.map(permNode => {
      if (permNode.permission !== action.payload!.permission) return permNode;

      return {
        ...permNode,
        childNodes: (permNode.childNodes as LetterFolder[]).map(letterNode => {
          if (letterNode.letter !== action.payload!.letter) return letterNode;

          return <LetterFolder>{
            ...letterNode,
            isExpanded: false,
            iconName: 'folder-close',
          };
        }),
      };
    }),
  }))
  .handle(AddPermission.openDialog, (prev, action) => ({
    ...prev,
    addDialog: {
      permission: action.payload!,
    },
  }))
  .handle(RemovePermission.openDialog, (prev, action) => ({
    ...prev,
    removeDialog: {
      permission: action.payload!.permission,
      username: action.payload!.username,
    },
  }))
  .handle(AddPermission.closeDialog, (prev, action) => ({
    ...prev,
    addDialog: null,
  }))
  .handle(RemovePermission.closeDialog, (prev, action) => ({
    ...prev,
    removeDialog: null,
  }))
  .build();
