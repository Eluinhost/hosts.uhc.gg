import React, { useCallback, useEffect, useRef } from 'react';
import { ApplicationState } from '../../state/ApplicationState';
import { useNavigate } from 'react-router';
import { CreateMatchForm } from './CreateMatchForm';
import { useSelector, useDispatch } from 'react-redux';
import { nextAvailableSlot } from './nextAvailableSlot';
import { renderTeamStyle, TeamStyles } from '../../models/TeamStyles';
import { MatchesApi, ApiErrors } from '../../api';
import { change, getFormValues, SubmissionError } from 'redux-form';
import { renderToMarkdown } from './TemplateField';
import { getAccessToken, getUsername, isDarkMode, is12hFormat, getPermissions } from '../../state/Selectors';
import { createSelector, Selector } from 'reselect';
import { CreateMatchData } from '../../models/CreateMatchData';
import { SetSavedHostFormData } from '../../actions';

export const formKey: string = 'create-match-form';

const valuesSelector: Selector<ApplicationState, CreateMatchData> = createSelector(
  getFormValues(formKey),
  data => data as CreateMatchData,
);

const stateSelector = createSelector(
  getUsername,
  getPermissions,
  valuesSelector,
  getAccessToken,
  isDarkMode,
  is12hFormat,
  state => state.hostFormSavedData,
  (username, permissions, formValues, accessToken, isDarkMode, is12h, savedData) => ({
    formValues,
    is12h,
    savedData,
    username: username || 'ERROR NO USERNAME IN STORE',
    roles: permissions,
    accessToken: accessToken || 'ERROR NO ACCESS TOKEN IN STORE',
  }),
);

// Main goal of this is to save form data back to local storage when the component unmounts
export const HostingPage: React.FC = () => {
  const { formValues, savedData, username, accessToken, is12h, roles } = useSelector(stateSelector);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeTemplate = useCallback(
    (newTemplate: string) => dispatch(change(formKey, 'content', newTemplate)),
    [dispatch],
  );

  const saveData = useCallback((data: CreateMatchData) => dispatch(SetSavedHostFormData.start(data)), [dispatch]);

  const updateOpeningTime = useCallback(() => dispatch(change(formKey, 'opens', nextAvailableSlot())), [dispatch]);

  const formValuesRef = useRef<CreateMatchData | undefined>(formValues);

  useEffect(() => {
    formValuesRef.current = formValues;
  }, [formValues]);

  const onUnload = useCallback((): void => {
    // only save if we have values we can replace it with
    if (formValuesRef.current) {
      saveData(formValuesRef.current);
    }
  }, [saveData]);

  useEffect(() => {
    // when mounting we want to register for page unloads + load the stored values from local storage
    window.addEventListener('beforeunload', onUnload);

    // change the opening time
    updateOpeningTime();

    return () => {
      // remove the listener and fire the manual unload
      window.removeEventListener('beforeunload', onUnload);
      onUnload();
    };
  }, [onUnload, updateOpeningTime]);

  const createTemplateContext = useCallback(
    (data: CreateMatchData): any => {
      const teams = TeamStyles.find(it => it.value === data.teams) || TeamStyles[0];

      return {
        ...data,
        // overwite teams value with rendered version
        teams: renderTeamStyle(teams, data.size, data.customStyle),
        teamStyle: teams.value,
        author: username,
      };
    },
    [username],
  );

  const handleCreateMatch = useCallback(
    async (values: CreateMatchData): Promise<void> => {
      const withRenderedTemplate = {
        ...values,
        // we convert the template to markdown only, we don't want to send HTML
        content: renderToMarkdown(values.content, createTemplateContext(values)),
      };

      // Remove the team size if it isn't required to avoid potential non-ints being sent and rejected at decoding
      if (!TeamStyles.find(it => it.value === values.teams)!.requiresTeamSize) {
        withRenderedTemplate.size = null;
      }

      try {
        // fire API call
        await MatchesApi.create(withRenderedTemplate, accessToken);

        // if success send them to the matches page to view it
        navigate('/matches');
      } catch (err) {
        if (err instanceof ApiErrors.BadDataError) throw new SubmissionError({ _error: `Bad data: ${err.message}` });

        if (err instanceof ApiErrors.NotAuthenticatedError) {
          // User cookie has expired, get them to reauthenticate
          window.location.href = '/authenticate?path=/host';
          return;
        }

        if (err instanceof ApiErrors.ForbiddenError) {
          throw new SubmissionError({ _error: 'You no longer have hosting permission' });
        }

        throw new SubmissionError({ _error: 'Unexpected server issue, please contact an admin if this persists' });
      }
    },
    [accessToken, createTemplateContext, navigate],
  );

  // Base data, use the current form value or the stored data if it doesn't exist (first-render I think)
  const data: CreateMatchData = formValues || savedData;

  const context = createTemplateContext(data);

  return (
    <CreateMatchForm
      form="create-match-form"
      initialValues={savedData}
      currentValues={data}
      templateContext={context}
      username={username}
      changeTemplate={changeTemplate}
      createMatch={handleCreateMatch}
      is12h={is12h}
      roles={roles}
    />
  );
};
