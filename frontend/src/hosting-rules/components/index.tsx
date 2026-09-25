import { Button, Callout, Collapse, H3, Intent } from '@blueprintjs/core';
import { CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { Markdown } from '../../components/Markdown';
import { WithPermission } from '../../components/WithPermission';
import { HostingRulesData } from '../api';

import { SetRulesDialog } from './SetRulesDialog';

export const HostingRules: React.FC = () => {
  const [areRulesOpen, setAreRulesOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data, error } = useQuery({
    enabled: areRulesOpen,
    ...HostingRulesData.fetchHostingRules,
  });

  const lastModified = () => {
    if (!data) {
      return null;
    }

    const time = data.modified.format('MMM Do HH:mm z');
    return `Last modified: ${time} by /u/${data.author}`;
  };

  return (
    <div className="hosting-rules">
      <H3
        role="button"
        onClick={() => {
          setAreRulesOpen(prev => !prev);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            setAreRulesOpen(prev => !prev);
          }
        }}
      >
        {areRulesOpen ? <CaretDownIcon /> : <CaretRightIcon />}
        <span className="hosting-rules_title">Hosting Rules</span>
        <span className="hosting-rules_last-modified">{lastModified()}</span>
      </H3>
      <Collapse isOpen={areRulesOpen} className="hosting-rules_content">
        <WithPermission permission="hosting advisor">
          <Button
            intent={Intent.PRIMARY}
            text="Edit Rules"
            onClick={() => {
              setIsEditing(true);
            }}
          />
          {isEditing && (
            <SetRulesDialog
              current={data?.content ?? ''}
              onClose={() => {
                setIsEditing(false);
              }}
            />
          )}
        </WithPermission>
        {!!error && <Callout intent={Intent.DANGER}>{error.message}</Callout>}
        {!!data && <Markdown markdown={data.content} />}
      </Collapse>
    </div>
  );
};
