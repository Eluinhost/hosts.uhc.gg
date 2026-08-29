import React, { useCallback, useState, useMemo } from 'react';
import { Button, Callout, Collapse, H3, Intent } from '@blueprintjs/core';
import { Markdown } from '../Markdown';
import { SetRulesDialog } from './SetRulesDialog';
import { WithPermission } from '../WithPermission';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { GetHostingRules, SetHostingRules } from '../../actions';
import { ApplicationState } from '../../state/ApplicationState';

const rulesSelector = createSelector(
  (state: ApplicationState) => state.rules,
  rules => rules,
);

export const HostingRules = React.memo(() => {
  const rules = useSelector(rulesSelector);
  const dispatch = useDispatch();

  const [areRulesOpen, setAreRulesOpen] = useState(false);

  const toggleDropdown = useCallback(() => {
    if (!areRulesOpen) {
      dispatch(GetHostingRules.start());
    }
    setAreRulesOpen(prev => !prev);
  }, [areRulesOpen, dispatch]);

  const stopPropagation = useCallback((e: React.MouseEvent<any>) => e.stopPropagation(), []);

  const rulesToShow = useMemo(() => {
    if (rules.data) return rules.data.content;
    if (rules.fetching) return 'Loading...';
    return rules.error;
  }, [rules.data, rules.fetching, rules.error]);

  const headerInfo = useMemo(() => {
    if (rules.fetching) return 'Loading...';
    if (rules.data) {
      const time = rules.data.modified.format('MMM Do HH:mm z');
      return `Last modified: ${time} by /u/${rules.data.author}`;
    }
    return rules.error;
  }, [rules.data, rules.fetching, rules.error]);

  const startEdit = useCallback(
    () => dispatch(SetHostingRules.openEditor()),
    [dispatch],
  );

  return (
    <Callout
      icon={areRulesOpen ? 'chevron-up' : 'chevron-down'}
      className="hosting-rules"
      onClick={toggleDropdown}
    >
      <H3>
        Hosting Rules<small style={{ float: 'right' }}>{headerInfo}</small>
      </H3>
      <Collapse isOpen={areRulesOpen}>
        <div onClick={stopPropagation}>
          <WithPermission permission="hosting advisor">
            <div>
              <Button intent={Intent.PRIMARY} text="Edit Rules" onClick={startEdit} />
              <SetRulesDialog />
            </div>
          </WithPermission>
          {!!rules.error && <Callout intent={Intent.DANGER}>{rules.error}</Callout>}
          {!!rulesToShow && <Markdown markdown={rulesToShow!} />}
        </div>
      </Collapse>
    </Callout>
  );
});
