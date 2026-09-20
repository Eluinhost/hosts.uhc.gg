import React from 'react';
import { useParams } from 'react-router';

import { ApprovalModal } from '../approval-modal';
import { MatchDetails } from '../match-details';

type Params = {
  readonly id?: string;
};

export const MatchDetailsPage: React.FC = () => {
  const params = useParams<Params>();

  return (
    <div>
      <MatchDetails id={Number(params.id)} />
      <ApprovalModal />
    </div>
  );
};
