import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { authenticationAtom } from '@/authentication/atoms/authentication';
import { AuthenticationApi } from '@/authentication/AuthenticationApi';

export const useAuthRefresh = () => {
  const hasStoredTokens = useAtomValue(authenticationAtom) !== null;

  const query = useQuery({
    enabled: hasStoredTokens,
    ...AuthenticationApi.autoRefresh,
  });

  return { isInitialising: hasStoredTokens && query.isPending };
};
