import {gql} from "@apollo/client";

export const RECESSION_QUERY = gql`
    query Recession {
        getRecessionData {
            startDate
            endDate
        }
    }
`;