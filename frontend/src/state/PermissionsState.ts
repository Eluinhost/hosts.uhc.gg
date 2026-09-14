import { createReducer } from 'typesafe-redux-helpers';
import { Reducer } from 'redux';
import { toPairs } from 'ramda';
import { Classes, TreeNodeInfo, Spinner } from '@blueprintjs/core';
import React from 'react';

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

export type NodeType = UsernameNode | PermissionFolder | LetterFolder;

export type UsernameNode = {
  readonly type: 'username';
  readonly username: string;
  readonly permission: string;
};

export type PermissionFolder = {
  readonly type: 'permission';
  readonly permission: string;
  readonly isFetching: boolean;
  readonly count: number;
};

export type LetterFolder = {
  readonly type: 'letter';
  readonly permission: string;
  readonly letter: string;
  readonly isFetching: boolean;
  readonly count: number;
};

const createUsernameNode = (permission: string, username: string): TreeNodeInfo<UsernameNode> => ({
  id: `p~${permission}~u~${username}`,
  label: username,
  nodeData: {
    type: 'username',
    username,
    permission,
  },
  icon: 'user',
  className: 'username-node',
});

const permissionGroupNames: { [key: string]: string } = {
  admin: 'Administrators',
  host: 'Verified Hosts',
  'hosting advisor': 'Hosting Advisors',
  'hosting banned': 'Hosting Banned',
  'trial host': 'Trial Hosts',
};

const getGroupName = (permission: string) =>
  permissionGroupNames[permission] || permission.charAt(0).toUpperCase() + permission.slice(1) + 's';

const createPermissionFolder = (permission: string, count: number): TreeNodeInfo<PermissionFolder> => ({
  id: `p~${permission}`,
  label: `${getGroupName(permission)} (${count})`,
  hasCaret: true,
  nodeData: {
    type: 'permission',
    permission,
    count,
    isFetching: false,
  },
  isExpanded: false,
  icon: 'folder-close',
  className: 'permission-folder-node',
});

const createLetterFolder = (permission: string, letter: string, count: number): TreeNodeInfo<LetterFolder> => ({
  id: `p~${permission}~l~${letter}`,
  label: `${letter} (${count})`,
  hasCaret: true,
  icon: 'folder-close',
  nodeData: {
    type: 'letter',
    permission,
    letter,
    count,
    isFetching: false,
  },
  isExpanded: false,
  className: 'letter-folder-node',
});

export type PermissionsState = {
  readonly addDialog: AddPermissionDialogState | null;
  readonly removeDialog: RemovePermissionDialogState | null;
  readonly isFetching: boolean;
  readonly nodes: TreeNodeInfo<NodeType>[];
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
    admin: ['trial host', 'host', 'hosting advisor', 'beta tester'],
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
    nodes: state.nodes.map(node => {
      if (!node.nodeData || node.nodeData.permission !== action.payload.parameters) return node;

      return {
        ...node,
        nodeData: {
          ...node.nodeData,
          isFetching: true,
          secondaryLabel: loadingIcon,
        },
      };
    }),
  }))
  .handleAction(FetchUsersInPermission.success, (state, action) => ({
    ...state,
    nodes: state.nodes.map(node => {
      if (!node.nodeData || node.nodeData.permission !== action.payload.parameters) return node;

      const permission = action.payload.parameters;

      let childNodes: Array<TreeNodeInfo<NodeType>>;

      if (Array.isArray(action.payload.result)) {
        const usernames = action.payload.result as string[];

        childNodes = usernames
          .sort((left, right) => left.toLocaleLowerCase().localeCompare(right.toLocaleLowerCase()))
          .map(name => createUsernameNode(permission, name));
      } else {
        const letters = action.payload.result as { [key: string]: number };

        childNodes = toPairs(letters)
          .map(pair => createLetterFolder(permission, pair[0], pair[1]))
          .sort((left, right) => left.nodeData!.letter.localeCompare(right.nodeData!.letter));
      }

      return {
        ...node,
        childNodes,
        nodeData: {
          ...node.nodeData,
          isFetching: false,
          secondaryLabel: undefined,
        },
      };
    }),
  }))
  .handleAction(FetchUsersInPermission.failure, (state, action) => ({
    ...state,
    nodes: state.nodes.map(node => {
      if (!node.nodeData || node.nodeData.permission !== action.payload.parameters) return node;

      return {
        ...node,
        nodeData: {
          ...node.nodeData,
          isFetching: false,
          secondaryLabel: undefined,
        },
      };
    }),
  }))
  .handleAction(FetchUsersInPermissionWithLetter.started, (state, action) => ({
    ...state,
    nodes: state.nodes.map<TreeNodeInfo<NodeType>>(permNode => {
      if (!permNode.nodeData || permNode.nodeData.permission !== action.payload.parameters.permission) return permNode;

      return {
        ...permNode,
        childNodes: permNode.childNodes?.map<TreeNodeInfo<NodeType>>(letterNode => {
          if (letterNode.nodeData?.type !== 'letter' || letterNode.nodeData.letter !== action.payload.parameters.letter)
            return letterNode;

          return {
            ...letterNode,
            nodeData: {
              ...letterNode.nodeData,
              isFetching: true,
              secondaryLabel: loadingIcon,
            },
          };
        }),
      };
    }),
  }))
  .handleAction(FetchUsersInPermissionWithLetter.success, (state, action) => ({
    ...state,
    nodes: state.nodes.map(permNode => {
      if (!permNode.nodeData || permNode.nodeData.permission !== action.payload.parameters.permission) return permNode;

      return {
        ...permNode,
        childNodes: permNode.childNodes?.map(letterNode => {
          if (letterNode.nodeData?.type !== 'letter' || letterNode.nodeData.letter !== action.payload.parameters.letter)
            return letterNode;

          return {
            ...letterNode,
            nodeData: {
              ...letterNode.nodeData,
              isFetching: false,
              secondaryLabel: undefined,
            },
            childNodes: action.payload.result
              .sort((left: string, right: string) => left.toLocaleLowerCase().localeCompare(right.toLocaleLowerCase()))
              .map((name: string) => createUsernameNode(action.payload.parameters.permission, name)),
          };
        }),
      };
    }),
  }))
  .handleAction(FetchUsersInPermissionWithLetter.failure, (state, action) => ({
    ...state,
    nodes: state.nodes.map<TreeNodeInfo<NodeType>>(permNode => {
      if (!permNode.nodeData || permNode.nodeData.permission !== action.payload.parameters.permission) return permNode;

      return {
        ...permNode,
        childNodes: permNode.childNodes?.map<TreeNodeInfo<NodeType>>(letterNode => {
          if (letterNode.nodeData?.type !== 'letter' || letterNode.nodeData.letter !== action.payload.parameters.letter)
            return letterNode;

          return {
            ...letterNode,
            nodeData: {
              ...letterNode.nodeData,
              isFetching: false,
              secondaryLabel: undefined,
            },
          };
        }),
      };
    }),
  }))
  .handleAction(PermissionNode.open, (state, action) => ({
    ...state,
    nodes: state.nodes.map<TreeNodeInfo<NodeType>>(node => {
      if (!node.nodeData || node.nodeData.permission !== action.payload) return node;

      return {
        ...node,
        nodeData: {
          ...node.nodeData,
          isExpanded: true,
        },
        icon: 'folder-open',
      };
    }),
  }))
  .handleAction(PermissionNode.close, (state, action) => ({
    ...state,
    nodes: state.nodes.map(node => {
      if (!node.nodeData || node.nodeData.permission !== action.payload) return node;

      return {
        ...node,
        nodeData: {
          ...node.nodeData,
          isExpanded: false,
        },
        icon: 'folder-close',
      };
    }),
  }))
  .handleAction(PermissionLetterNode.open, (state, action) => ({
    ...state,
    nodes: state.nodes.map<TreeNodeInfo<NodeType>>(permNode => {
      if (!permNode.nodeData || permNode.nodeData.permission !== action.payload.permission) return permNode;

      return {
        ...permNode,
        isExpanded: true,
        childNodes: permNode.childNodes?.map(letterNode => {
          if (letterNode.nodeData?.type !== 'letter' || letterNode.nodeData.letter !== action.payload.letter)
            return letterNode;

          return {
            ...letterNode,
            nodeData: {
              ...letterNode.nodeData,
              isExpanded: true,
            },
            icon: 'folder-open',
          };
        }),
      };
    }),
  }))
  .handleAction(PermissionLetterNode.close, (state, action) => ({
    ...state,
    nodes: state.nodes.map<TreeNodeInfo<NodeType>>(permNode => {
      if (!permNode.nodeData || permNode.nodeData.permission !== action.payload.permission) return permNode;

      return {
        ...permNode,
        childNodes: permNode.childNodes?.map<TreeNodeInfo<NodeType>>(letterNode => {
          if (letterNode.nodeData?.type !== 'letter' || letterNode.nodeData.letter !== action.payload.letter)
            return letterNode;

          return {
            ...letterNode,
            nodeData: {
              ...letterNode.nodeData,
              isExpanded: false,
            },
            icon: 'folder-close',
          };
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
