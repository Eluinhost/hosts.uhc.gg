import React from 'react';
import { useParams } from 'react-router';

import { ApprovalModal } from '../components/ApprovalModal';
import { MatchDetails } from '../components/MatchDetails';

export type MatchDetailsPageParams = {
  id: string | undefined;
};

export const MatchDetailsPage: React.FC = () => {
  const params = useParams<MatchDetailsPageParams>();

  return (
    <div>
      <MatchDetails id={Number(params.id)} />
      <ApprovalModal />
    </div>
  );
};
