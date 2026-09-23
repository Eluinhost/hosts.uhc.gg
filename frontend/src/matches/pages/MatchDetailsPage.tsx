import React, { useState } from 'react';
import { useParams } from 'react-router';

import { ApprovalModal } from '../components/ApprovalModal';
import { MatchDetails } from '../components/MatchDetails';

export type MatchDetailsPageParams = {
  id: string | undefined;
};

export const MatchDetailsPage: React.FC = () => {
  const params = useParams<MatchDetailsPageParams>();
  const [isApproving, setIsApproving] = useState(false);

  if (!params.id) {
    return null;
  }

  return (
    <div>
      <MatchDetails id={Number(params.id)} />
      {isApproving && (
        <ApprovalModal
          id={Number(params.id)}
          onClose={() => {
            setIsApproving(false);
          }}
        />
      )}
    </div>
  );
};
