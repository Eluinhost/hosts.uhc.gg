import { useState } from 'react';

import { ApprovalModal } from '@/matches/components/ApprovalModal';
import { MatchDetails } from '@/matches/components/MatchDetails';

export interface MatchDetailsPageProps {
  id: number;
}

export const MatchDetailsPage = ({ id }: MatchDetailsPageProps) => {
  const [isApproving, setIsApproving] = useState(false);

  return (
    <div>
      <MatchDetails id={id} />
      {isApproving && (
        <ApprovalModal
          id={id}
          onClose={() => {
            setIsApproving(false);
          }}
        />
      )}
    </div>
  );
};
