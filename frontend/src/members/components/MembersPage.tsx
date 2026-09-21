import { Title } from '../../components/Title';

import { ModerationLog } from './ModerationLog';
import { MembersTree } from './tree/MembersTree';

export const MembersPage = () => {
  return (
    <div>
      <Title>Members</Title>
      <div className="members-page">
        <MembersTree />
        <ModerationLog />
      </div>
    </div>
  );
};
