import { Classes, H2 } from '@blueprintjs/core';
import { useQuery } from '@tanstack/react-query';

import { MembersData } from '../../api';

import { LoadingNode } from './LoadingNode';
import { PermissionNode } from './PermissionNode';

export const MembersTree = () => {
  const { data, isFetching } = useQuery(MembersData.fetchUserCountPerPermission);

  return (
    <div className="permissions-tree">
      <H2>All members</H2>
      <div className={Classes.TREE}>
        <ul className={Classes.TREE_NODE_LIST}>
          {isFetching && <LoadingNode depth={0} />}
          {!!data &&
            Object.entries(data).map(([permission, count]) => (
              <PermissionNode key={permission} permission={permission} count={count} />
            ))}
        </ul>
      </div>
    </div>
  );
};
