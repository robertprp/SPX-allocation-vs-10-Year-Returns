import { gql } from '@apollo/client';

export const ALLOCATION_DATA_FRAGMENT = gql`
    fragment AllocationDataFragment on AllocationData {
        date
        percentage
        return10
    }
`;

// Fragment for StockToAssetAllocation
export const STOCK_TO_ASSET_ALLOCATION_FRAGMENT = gql`
    fragment StockToAssetAllocationFragment on StockToAssetAllocation {
        correlationSquared
        expectedReturns
        extrapolatedReturns
        lastUpdatedDate
        lastExtrapolatedDate
        data {
            ...AllocationDataFragment
        }
    }
`;

// Main Query
export const QUERY_ALLOCATION_AND_Spx_RETURNS = gql`
    query AllocationAndSpxReturns {
        queryAllocationAndSpxReturns {
            ...StockToAssetAllocationFragment
        }
    }
    ${ALLOCATION_DATA_FRAGMENT}
    ${STOCK_TO_ASSET_ALLOCATION_FRAGMENT}
`;
