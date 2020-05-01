import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';
import { concat, converge, head, pipe, tail, toPairs, toUpper } from 'ramda';
import { Classes, ITreeNode, Spinner } from '@blueprintjs/core';
import * as React from 'react';

import {
  AddPermission,
  RemovePermission,
  FetchUserCountPerPermission,
  PermissionNode,
  FetchUsersInPermission,
  PermissionLetterNode,
  FetchUsersInPermissionWithLetter,
} from '../actions';

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
  icon: 'user',
  className: 'username-node',
});

const permissionGroupNames: { [key: string]: string } = {
  admin: 'Administrators',
  host: 'Verified Hosts',
  'hosting advisor': 'Hosting Advisors',
  'hosting banned': 'Hosting Banned',
  'trial host': 'Trial Hosts',
  'ubl moderator': 'UBL Moderators',
};

const getGroupName = (permission: string) =>
  permissionGroupNames[permission] || converge(concat, [pipe(head, toUpper), tail])(permission) + 's';

const createPermissionFolder = (permission: string, count: number): PermissionFolder => ({
  permission,
  count,
  id: `p~${permission}`,
  label: `${getGroupName(permission)} (${count})`,
  hasCaret: true,
  isFetching: false,
  isExpanded: false,
  icon: 'folder-close',
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
  icon: 'folder-close',
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
  readonly allowableModifications: { [key: string]: string[] };
};

const loadingIcon: React.ReactElement = React.createElement(Spinner, { className: Classes.SMALL });

export const reducer: Reducer<PermissionsState> = createReducer<PermissionsState>({
  isFetching: false,
  nodes: [],
  removeDialog: null,
  addDialog: null,
  allowableModifications: {
    'hosting advisor': ['host', 'trial host', 'hosting banned'],
    admin: ['trial host', 'host', 'hosting advisor', 'ubl moderator', 'beta tester'],
  },
})
  .handleAction(FetchUserCountPerPermission.started, state => ({
    ...state,
    isFetching: true,
  }))
  .handleAction(FetchUserCountPerPermission.success, (state, action) => ({
    ...state,
    isFetching: false,
    nodes: toPairs(action.payload.result).map(([key, value]) => createPermissionFolder(key, value)),
  }))
  .handleAction(FetchUserCountPerPermission.failure, state => ({
    ...state,
    isFetching: false,
  }))
  .handleAction(FetchUsersInPermission.started, (state, action) => ({
    ...state,
    nodes: state.nodes.map<PermissionFolder>(node => {
      if (node.permission !== action.payload.parameters) return node;

      return {
        ...node,
        isFetching: true,
        secondaryLabel: loadingIcon,
      };
    }),
  }))
  .handleAction(FetchUsersInPermission.success, (state, action) => ({
    ...state,
    nodes: state.nodes.map<PermissionFolder>(node => {
      if (node.permission !== action.payload.parameters) return node;

      const permission = action.payload.parameters;

      let childNodes: UsernameNode[] | LetterFolder[];

      if (Array.isArray(action.payload.result)) {
        const usernames = action.payload.result as string[];

        childNodes = usernames
          .sort((left, right) => left.toLocaleLowerCase().localeCompare(right.toLocaleLowerCase()))
          .map<UsernameNode>(name => createUsernameNode(permission, name));
      } else {
        const letters = action.payload.result as { [key: string]: number };

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
  .handleAction(FetchUsersInPermission.failure, (state, action) => ({
    ...state,
    nodes: state.nodes.map(node => {
      if (node.permission !== action.payload.parameters) return node;

      return {
        ...node,
        isFetching: false,
        secondaryLabel: undefined,
      };
    }),
  }))
  .handleAction(FetchUsersInPermissionWithLetter.started, (state, action) => ({
    ...state,
    nodes: state.nodes.map<PermissionFolder>(permNode => {
      if (permNode.permission !== action.payload.parameters.permission) return permNode;

      return {
        ...permNode,
        childNodes: (permNode.childNodes as LetterFolder[]).map(letterNode => {
          if (letterNode.letter !== action.payload.parameters.letter) return letterNode;

          return {
            ...letterNode,
            isFetching: true,
            secondaryLabel: loadingIcon,
          };
        }),
      };
    }),
  }))
  .handleAction(FetchUsersInPermissionWithLetter.success, (state, action) => ({
    ...state,
    nodes: state.nodes.map<PermissionFolder>(permNode => {
      if (permNode.permission !== action.payload.parameters.permission) return permNode;

      return {
        ...permNode,
        childNodes: (permNode.childNodes as LetterFolder[]).map(letterNode => {
          if (letterNode.letter !== action.payload.parameters.letter) return letterNode;

          return {
            ...letterNode,
            isFetching: false,
            secondaryLabel: undefined,
            childNodes: action.payload.result
              .sort((left, right) => left.toLocaleLowerCase().localeCompare(right.toLocaleLowerCase()))
              .map(name => createUsernameNode(action.payload.parameters.permission, name)),
          };
        }),
      };
    }),
  }))
  .handleAction(FetchUsersInPermissionWithLetter.failure, (state, action) => ({
    ...state,
    nodes: state.nodes.map<PermissionFolder>(permNode => {
      if (permNode.permission !== action.payload.parameters.permission) return permNode;

      return {
        ...permNode,
        childNodes: (permNode.childNodes as LetterFolder[]).map(letterNode => {
          if (letterNode.letter !== action.payload.parameters.letter) return letterNode;

          return {
            ...letterNode,
            isFetching: false,
            secondaryLabel: undefined,
          };
        }),
      };
    }),
  }))
  .handleAction(PermissionNode.open, (state, action) => ({
    ...state,
    nodes: state.nodes.map(node => {
      if (node.permission !== action.payload) return node;

      return {
        ...node,
        isExpanded: true,
        icon: 'folder-open',
      } as PermissionFolder;
    }),
  }))
  .handleAction(PermissionNode.close, (state, action) => ({
    ...state,
    nodes: state.nodes.map(node => {
      if (node.permission !== action.payload) return node;

      return {
        ...node,
        isExpanded: false,
        icon: 'folder-close',
      } as PermissionFolder;
    }),
  }))
  .handleAction(PermissionLetterNode.open, (state, action) => ({
    ...state,
    nodes: state.nodes.map(permNode => {
      if (permNode.permission !== action.payload.permission) return permNode;

      return {
        ...permNode,
        isExpanded: true,
        childNodes: (permNode.childNodes as LetterFolder[]).map(letterNode => {
          if (letterNode.letter !== action.payload.letter) return letterNode;

          return {
            ...letterNode,
            isExpanded: true,
            icon: 'folder-open',
          } as LetterFolder;
        }),
      };
    }),
  }))
  .handleAction(PermissionLetterNode.close, (state, action) => ({
    ...state,
    nodes: state.nodes.map(permNode => {
      if (permNode.permission !== action.payload.permission) return permNode;

      return {
        ...permNode,
        childNodes: (permNode.childNodes as LetterFolder[]).map(letterNode => {
          if (letterNode.letter !== action.payload.letter) return letterNode;

          return {
            ...letterNode,
            isExpanded: false,
            icon: 'folder-close',
          } as LetterFolder;
        }),
      };
    }),
  }))
  .handleAction(AddPermission.openDialog, (state, action) => ({
    ...state,
    addDialog: {
      permission: action.payload,
    },
  }))
  .handleAction(RemovePermission.openDialog, (state, action) => ({
    ...state,
    removeDialog: {
      permission: action.payload.permission,
      username: action.payload.username,
    },
  }))
  .handleAction(AddPermission.closeDialog, state => ({
    ...state,
    addDialog: null,
  }))
  .handleAction(RemovePermission.closeDialog, state => ({
    ...state,
    removeDialog: null,
  }));
