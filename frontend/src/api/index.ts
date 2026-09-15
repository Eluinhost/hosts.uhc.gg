import * as Authentication from './Authentication';
import * as Errors from './Errors';
import * as HostingRules from './HostingRules';
import * as Matches from './Matches';
import * as Permissions from './Permissions';
import * as ServerTime from './ServerTime';

export const MatchesApi = Matches;
export const AuthenticationApi = Authentication;
export const PermissionsApi = Permissions;
export const HostingRulesApi = HostingRules;
export const ServerTimeApi = ServerTime;
export const ApiErrors = Errors;
