import { ModerationLog } from './ModerationLog';
import { MembersTree } from './tree/MembersTree';

export const MembersPage = () => {
  return (
    <div>
      <title>uhc.gg | Members</title>
      <div className="members-page">
        <MembersTree />
        <ModerationLog />
      </div>
    </div>
  );
};
