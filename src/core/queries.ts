import { apolloClient } from '@/core/api/client';
import { QUERY_ALLOCATION_AND_Spx_RETURNS } from '@/core/api/gql/stock-to-asset-allocation';

export async function getAllocationData() {
  return apolloClient.query({
    query: QUERY_ALLOCATION_AND_Spx_RETURNS,
  })
}