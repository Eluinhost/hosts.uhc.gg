import * as React from 'react';

export type RemovedReasonProps = {
  readonly reason: string;
  readonly removedBy: string;
};

export const RemovedReason: React.FunctionComponent<RemovedReasonProps> = ({ reason, removedBy }) => (
  <div className="removed-reason">
    <div className="removed-reason-reason">Removed: {reason}</div>
    <div className="removed-reason-remover">/u/{removedBy}</div>
  </div>
);
